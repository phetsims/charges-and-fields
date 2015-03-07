// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  //var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var StaticSensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/StaticSensorElement' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var K_CONSTANT = 9; // prefactor in E-field equation: E= k*Q/r^2 when Q is in nano coulomb, r is in meter and E is in Volt/meter
  var HEIGHT = ChargesAndFieldsConstants.HEIGHT;
  var WIDTH = ChargesAndFieldsConstants.WIDTH;
  var ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;
  var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;


  /**
   * Main constructor for ChargesAndFieldsModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function ChargesAndFieldsModel() {

    var thisModel = this;

    // For performance reasons these two following visibility properties are strongly tied to the model hence the reason they appear here.
    // The other visibility properties can be found in the ChargesAndFieldsScreenView file
    PropertySet.call( thisModel, {
      isElectricFieldGridVisible: true, // control the visibility of a grid of arrows representing the local electric field
      isElectricPotentialGridVisible: false, // control the visibility of the electric potential field, a.k.a. rectangular grid
      isChargedParticlePresent: false // is there at least one charged particle on the board 
    } );

    //----------------------------------------------------------------------------------------
    // Initialize variables
    //----------------------------------------------------------------------------------------

    // @public read-only
    this.bounds = new Bounds2( -WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2 ); // bounds of the model

    // @public read-only
    this.chargeAndSensorEnclosureBounds = new Bounds2( -1.25, -2.30, 1.25, -1.70 );

    // Observable arrays of all draggable electric charges
    // @public
    this.chargedParticles = new ObservableArray();

    // Observable arrays of all draggable electric field sensors
    // @public
    this.electricFieldSensors = new ObservableArray();

    // electric potential sensor
    var position = new Vector2( -2.5, -1.0 ); // position of the crosshair on the electric potential sensor
    this.electricPotentialSensor = new SensorElement( position );
    this.electricPotentialSensor.electricField = thisModel.getElectricField( this.electricPotentialSensor.position );
    this.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( this.electricPotentialSensor.position );

    // electric Field Sensor Grid
    // @public read-only
    this.electricFieldSensorGrid = thisModel.sensorGridFactory( {
      spacing: ELECTRIC_FIELD_SENSOR_SPACING,
      onOrigin: true
    } );

    // electric potential Sensor Grid, a.k.a in physics as the electric potential 'field'
    // @public read-only
    this.electricPotentialSensorGrid = thisModel.sensorGridFactory( {
      spacing: ELECTRIC_POTENTIAL_SENSOR_SPACING,
      onOrigin: false
    } );

    // @public read-only
    this.equipotentialLinesArray = new ObservableArray();

    // @public read-only
    this.electricFieldLinesArray = new ObservableArray();

    //----------------------------------------------------------------------------------------
    //
    // Hook up all the listeners the model
    //
    //----------------------------------------------------------------------------------------


    //------------------------
    // Position Listener on the electric potential Sensor
    //------------------------

    // update the Electric Potential Sensor upon a change of position
    this.electricPotentialSensor.positionProperty.link( function( position ) {
      thisModel.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( position );
    } );

    //------------------------
    // isElectricFieldGridVisible Listener  (update all the electric field grid sensors a.k.a. grid of arrows)
    //------------------------

    // for performance reason, the electric field of the sensors on the grid is calculated and updated only if the
    // visibility of the grid is set to true
    this.isElectricFieldGridVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        thisModel.updateElectricFieldSensorGrid();
      }
    } );

    //------------------------
    // isElectricPotentialGridVisible Listener  (update all the grid of electric potential sensors a.k.a. the electric potential field)
    //------------------------

    // for performance reason, the electric potential is calculated and updated only if it is set to visible
    this.isElectricPotentialGridVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        thisModel.updateElectricPotentialSensorGrid();
      }
    } );

    //------------------------
    // AddItem Added Listener on the charged Particles Observable Array
    //------------------------

    // if any charges move, we need to update all the sensors
    this.chargedParticles.addItemAddedListener( function( chargedParticle ) {


      thisModel.checkAtLeastOneChargedParticleOnBoard();

      // send a trigger signal (go back to origin) if the charge particle is over the enclosure
      chargedParticle.userControlledProperty.link( function( userControlled ) {
        if ( !userControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( chargedParticle.position ) ) {
          chargedParticle.animate();
        }
      } );

      chargedParticle.positionProperty.link( function( position, oldPosition ) {

        // remove equipotential lines and electric field lines when the position of a charged particle changes
        thisModel.clearEquipotentialLines();
        thisModel.clearElectricFieldLines();

        // if oldPosition doesn't exist calculate the sensor properties from the charge configurations (from scratch)
        if ( oldPosition === null ) {
          thisModel.updateAllVisibleSensors();
        }
        // if oldPosition exists calculate the sensor properties from the delta contribution
        // this should help if there are many charged particles on the board
        else {
          // convenience variable
          var charge = chargedParticle.charge;

          // update the Electric Potential Sensor by calculating the change in the electric potential
          thisModel.electricPotentialSensor.electricPotential += thisModel.getElectricPotentialChange(
            thisModel.electricPotentialSensor.position, position, oldPosition, charge );

          // update the Electric Field Sensors  by calculating the change in the electric field due to the motion of the chargeParticle
          thisModel.electricFieldSensors.forEach( function( sensorElement ) {
            // electricField is a property that is being listened to. We want a new vector allocation when the electric field gets updated
            sensorElement.electricField = sensorElement.electricField.plus( thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
          } );

          // update the Electric Field Grid Sensors, but only if the electric Field grid is visible
          if ( thisModel.isElectricFieldGridVisible === true ) {
            thisModel.electricFieldSensorGrid.forEach( function( sensorElement ) {
              // let's calculate the change in the electric field due to the change in position of one charge
              sensorElement.electricField.add( thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
            } );
            thisModel.trigger( 'electricFieldGridUpdated' );
          }

          // update the Electric Potential Grid Sensors but only if the electric potential grid is visible
          if ( thisModel.isElectricPotentialGridVisible === true ) {
            thisModel.electricPotentialSensorGrid.forEach( function( sensorElement ) {
              // calculating the change in the electric potential due to the change in position of one charge
              sensorElement.electricPotential += thisModel.getElectricPotentialChange( sensorElement.position, position, oldPosition, charge );
            } );
            thisModel.trigger( 'electricPotentialGridUpdated' );
          }
        }
      } );
    } );

    //------------------------
    // AddItem Removed Listener on the charged Particles Observable Array
    //------------------------

    // if any charge is removed, we need to update all the sensors
    this.chargedParticles.addItemRemovedListener( function() {
      // Remove equipotential lines and electric field lines when the position of a charged particle changes
      thisModel.clearEquipotentialLines();
      thisModel.clearElectricFieldLines();
      // Update all the visible sensors
      thisModel.updateAllVisibleSensors();
      // is there at least one charge on the board ?
      thisModel.checkAtLeastOneChargedParticleOnBoard();
    } );

    //------------------------
    // AddItem Added Listener on the electric Field Sensors Observable Array
    //------------------------

    this.electricFieldSensors.addItemAddedListener( function( electricFieldSensor ) {
      // update the Electric Field Sensors upon a change of its own position
      electricFieldSensor.positionProperty.link( function( position ) {
        electricFieldSensor.electricField = thisModel.getElectricField( position );
      } );
      // send a trigger signal (go back to origin) if the electric field sensor is over the enclosure
      electricFieldSensor.userControlledProperty.link( function( userControlled ) {
        if ( !userControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( electricFieldSensor.position ) ) {
          electricFieldSensor.animate();
        }
      } );
    } );
  }

  return inherit( PropertySet, ChargesAndFieldsModel, {
    /**
     * @public
     */
    reset: function() {
      this.chargedParticles.clear(); // clear all the charges
      this.electricFieldSensors.clear(); // clear all the electric field sensors
      this.equipotentialLinesArray.clear(); // clear the equipotential 'lines'
      this.electricFieldLinesArray.clear(); // clear the electric field 'lines'
      this.electricPotentialSensor.reset(); // reposition the electricPotentialSensor
      PropertySet.prototype.reset.call( this ); // reset the visibility of the check boxes
    },


    /**
     * Function that determines if there are charges on the board
     * @private
     */
    checkAtLeastOneChargedParticleOnBoard: function() {
      this.isChargedParticlePresent = (this.chargedParticles.length > 0);
    },

    /**
     * Update the four types of sensors
     * @private
     */
    updateAllSensors: function() {
      this.updateElectricPotentialSensor();
      this.updateElectricPotentialSensorGrid();
      this.updateElectricFieldSensors();
      this.updateElectricFieldSensorGrid();
    },

    /**
     * Update all the visible sensors
     * @private
     */
    updateAllVisibleSensors: function() {
      this.updateElectricPotentialSensor(); // always visible
      if ( this.isElectricPotentialGridVisible === true ) {
        this.updateElectricPotentialSensorGrid();
      }
      this.updateElectricFieldSensors(); // always visible
      if ( this.isElectricFieldGridVisible === true ) {
        this.updateElectricFieldSensorGrid();
      }
    },

    /**
     * Update the Electric Field Sensors
     * @private
     */
    updateElectricFieldSensors: function() {
      var thisModel = this;
      this.electricFieldSensors.forEach( function( sensorElement ) {
        sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
      } );
    },
    /**
     * Update the Electric Potential Sensor
     * @private
     */
    updateElectricPotentialSensor: function() {
      this.electricPotentialSensor.electricPotential = this.getElectricPotential( this.electricPotentialSensor.position );
    },

    /**
     * Update the Electric Potential Grid Sensors
     * @private
     */
    updateElectricPotentialSensorGrid: function() {
      var thisModel = this;
      this.electricPotentialSensorGrid.forEach( function( sensorElement ) {
        sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );

      } );
      this.trigger( 'electricPotentialGridUpdated' );
    },

    /**
     * Update the Electric Field Grid Sensors
     * @private
     */
    updateElectricFieldSensorGrid: function() {
      var thisModel = this;
      this.electricFieldSensorGrid.forEach( function( sensorElement ) {
        sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
      } );
      this.trigger( 'electricFieldGridUpdated' );
    },

    //TODO Should that function be here in the first place? It is a pure function. It is called by UserCreatedNode
    /**
     * Function for adding an instance of a modelElement to this model when the user creates them, generally by clicking on some
     * some sort of creator node. The function add the type to an observable Array
     * @public
     * @param {Type} modelElement - the particular types that are of interest are ChargedParticle, SensorElement, ModelElement
     * @param {ObservableArray} observableArray - e.g. this.chargedParticles, this.electricFieldSensors
     */
    addUserCreatedModelElementToObservableArray: function( modelElement, observableArray ) {
      observableArray.push( modelElement );
      modelElement.on( 'returnedToOrigin', function() {
        observableArray.remove( modelElement );
      } );
    },

    /**
     * Function  that returns an array of equally spaced sensors on a two dimensional grid
     * The position of the sensors is determined the options parameter
     * @private
     * @param {Object} [options]
     * @returns {Array.<StaticSensorElement>}
     */
    sensorGridFactory: function( options ) {
      options = _.extend( {
        spacing: 0.5, // separation (distance) in model coordinates between two adjacent sensors
        onOrigin: true // is there  a sensor at the origin(0,0)?, if false the first sensor is put at (spacing/2, spacing/2)
      }, options );

      var gridArray = [];

      // TODO: get rid of magic numbers
      // The grid is centered at the origin;
      var maxX = WIDTH / 2 * (30 / 25);
      var maxY = HEIGHT / 2;
      var minY = -HEIGHT / 2;

      var spacingOffset; // {number}  Measure of the smallest x-coordinate of all sensors (excluding the one at the origin, if present)

      if ( options.onOrigin ) {
        spacingOffset = options.spacing;
      }
      else {
        spacingOffset = options.spacing / 2;
      }

      var x;
      var y;

      // fill the array with sensors in the four quadrants

      for ( x = spacingOffset; x < maxX; x += options.spacing ) {
        for ( y = spacingOffset; y < maxY; y += options.spacing ) {
          var quadrant1Position = new Vector2( x, y );
          var quadrant2Position = new Vector2( -x, y );

          gridArray.push(
            new StaticSensorElement( quadrant1Position ),
            new StaticSensorElement( quadrant2Position )
          );
        }

        for ( y = -spacingOffset; y > minY; y -= options.spacing ) {
          var quadrant3Position = new Vector2( -x, y );
          var quadrant4Position = new Vector2( x, y );

          gridArray.push(
            new StaticSensorElement( quadrant3Position ),
            new StaticSensorElement( quadrant4Position )
          );
        }
      }

      // if onOrigin is true, add a sensor at the origin as well as sensors that lie on the X-axis and Y-axis
      if ( options.onOrigin ) {
        // push a sensor at the origin
        gridArray.push( new StaticSensorElement( new Vector2( 0, 0 ) ) );

        // push sensors on the X-axis
        for ( x = options.spacing; x < maxX; x += options.spacing ) {
          var positiveXAxisPosition = new Vector2( x, 0 );
          var negativeXAxisPosition = new Vector2( -x, 0 );

          gridArray.push(
            new StaticSensorElement( positiveXAxisPosition ),
            new StaticSensorElement( negativeXAxisPosition )
          );
        }
        // push sensors on the Y-axis
        for ( y = options.spacing; y < maxY; y += options.spacing ) {
          var positiveYAxisPosition = new Vector2( 0, y );

          gridArray.push(
            new StaticSensorElement( positiveYAxisPosition )
          );
        }
        for ( y = -options.spacing; y > minY; y -= options.spacing ) {
          var negativeYAxisPosition = new Vector2( 0, y );

          gridArray.push(
            new StaticSensorElement( negativeYAxisPosition )
          );

        }

      }

      return gridArray;
    },

    /**
     * Return the change in the electric field at position Position due to the motion of a charged particle from oldChargePosition to  newChargePosition.
     * @private
     *
     * @param {Vector2} position
     * @param {Vector2} newChargePosition
     * @param {Vector2} oldChargePosition
     * @param {number} particleCharge - allowed values are +1 or -1
     * @returns {{x:number,y:number}}
     */
    getElectricFieldChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
      var newDistancePowerCube = Math.pow( newChargePosition.distanceSquared( position ), 1.5 );
      var oldDistancePowerCube = Math.pow( oldChargePosition.distanceSquared( position ), 1.5 );

      // For performance reason, we don't want to generate more vector allocations
      // Here is the original code
      //var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
      //var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
      //var electricFieldChange = (newFieldVector.subtract( oldFieldVector )).multiplyScalar( particleCharge * K_CONSTANT );
      return {
        x: ((position.x - newChargePosition.x) / ( newDistancePowerCube ) -
            (position.x - oldChargePosition.x) / ( oldDistancePowerCube )) *
        ( particleCharge * K_CONSTANT ),
        y: ((position.y - newChargePosition.y) / ( newDistancePowerCube ) -
            (position.y - oldChargePosition.y) / ( oldDistancePowerCube )) *
        ( particleCharge * K_CONSTANT )
      };
    },

    /**
     * Return the change in the electric potential at position Position due to the motion of a charged particle from oldChargePosition to  newChargePosition.
     * @private
     * @param {Vector2} position
     * @param {Vector2} newChargePosition
     * @param {Vector2} oldChargePosition
     * @param {number} particleCharge
     * @returns {number}
     */
    getElectricPotentialChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
      var newDistance = newChargePosition.distance( position );
      var oldDistance = oldChargePosition.distance( position );
      //var electricPotentialChange = particleCharge * K_CONSTANT * (1 / newDistance - 1 / oldDistance);
      return particleCharge * K_CONSTANT * (1 / newDistance - 1 / oldDistance);
    },

    /**
     * Return the electric field ( a vector) at a location position
     * @private
     * @param {Vector2} position
     * @returns {Vector2}
     */
    getElectricField: function( position ) {
      var electricField = new Vector2( 0, 0 );
      this.chargedParticles.forEach( function( chargedParticle ) {
        var distanceSquared = chargedParticle.position.distanceSquared( position );
        var distancePowerCube = Math.pow( distanceSquared, 1.5 );
        // For performance reason, we don't want to generate more vector allocations
        var electricFieldContribution = {
          x: (position.x - chargedParticle.position.x) * (chargedParticle.charge) / distancePowerCube,
          y: (position.y - chargedParticle.position.y) * (chargedParticle.charge) / distancePowerCube
        };
        electricField.add( electricFieldContribution );
      } );
      electricField.multiplyScalar( K_CONSTANT ); // prefactor depends on units
      return electricField;
    },

    /**
     * Return the electric potential at a location position due to the configuration of charges on the board.
     * @public read-Only
     * @param {Vector2} position
     * @returns {number}
     */
    getElectricPotential: function( position ) {
      var electricPotential = 0;
      this.chargedParticles.forEach( function( chargedParticle ) {
        var distance = chargedParticle.position.distance( position );
        electricPotential += (chargedParticle.charge) / distance;
      } );
      electricPotential *= K_CONSTANT; // prefactor depends on units
      return electricPotential;
    },

    /**
     * getNextPositionAlongEquipotential gives the next position (within a distance deltaDistance) with the same electric Potential
     * as the initial position.  If delta epsilon is positive, it gives as the next position, a point that is pointing (approximately) 90 degrees
     * to the left of the electric field (counterclockwise) whereas if deltaDistance is negative the next position is 90 degrees to the right of the
     * electric Field.
     *
     * The algorithm works best for small epsilon.
     * @private
     * @param {Vector2} position
     * @param {Number} deltaDistance - a distance
     * @returns {Vector2} next point along the equipotential line
     */
    getNextPositionAlongEquipotential: function( position, deltaDistance ) {
      var initialElectricPotential = this.getElectricPotential( position );
      return this.getNextPositionAlongEquipotentialWithElectricPotential.call( this, position, initialElectricPotential, deltaDistance );
    },

    /**
     * Given a (initial) position, find a position with the targeted electric potential within a distance deltaDistance
     * @private
     * @param {Vector2} position
     * @param {number} electricPotential
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithElectricPotential: function( position, electricPotential, deltaDistance ) {
      /*
       General Idea: Given the electric field at point position, find an intermediate point that is 90 degrees
       to the left of the electric field (if deltaDistance is positive) or to the right (if deltaDistance is negative).
       A further correction is applied since this intermediate point will not have the same electric potential
       as the targeted electric potential. To find the final point, the electric potential offset between the targeted
       and the electric potential at the intermediate point is found. By knowing the electric field at the intermediate point
       the next point should be found (approximately) at a distance epsilon equal to (Delta V)/|E| of the intermediate point.
       */
      var initialElectricField = this.getElectricField( position ); // {Vector2}
      assert && assert( initialElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
      var equipotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along equipotential
      var midwayPosition = ( equipotentialNormalizedVector.multiplyScalar( deltaDistance ) ).add( position ); // {Vector2}
      var midwayElectricField = this.getElectricField( midwayPosition ); // {Vector2}
      assert && assert( midwayElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: midway Electric Field ' );
      var midwayElectricPotential = this.getElectricPotential( midwayPosition ); //  {number}
      var deltaElectricPotential = midwayElectricPotential - electricPotential; // {number}
      var deltaPosition = midwayElectricField.multiplyScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared() ); // {Vector2}
      assert && assert( deltaPosition.magnitude() < Math.abs( deltaDistance ), 'the second order correction is larger than the first' );
      return midwayPosition.add( deltaPosition ); // {Vector2} finalPosition
    },

    /**
     * This method returns a downward position vector along the electric field lines
     * This uses a standard midpoint algorithm
     * http://en.wikipedia.org/wiki/Midpoint_method
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - can be positive (for forward direction) or negative (for backward direction) (units of meter)
     * @returns {Vector2}
     */
    getNextPositionAlongElectricField: function( position, deltaDistance ) {
      var initialElectricField = this.getElectricField( position );
      assert && assert( initialElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero' );
      var midwayDisplacement = initialElectricField.normalized().multiplyScalar( deltaDistance / 2 );
      var midwayPosition = midwayDisplacement.add( position );
      var midwayElectricField = this.getElectricField( midwayPosition );
      assert && assert( midwayElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero' );
      var deltaDisplacement = midwayElectricField.normalized().multiplyScalar( deltaDistance );
      return deltaDisplacement.add( position ); // {Vector2} finalPosition
    },

    /**
     * This method returns an array of points (vectors) with the same electric potential as the electric potential
     * at the initial position. The array is ordered with position points going counterclockwise.
     * @private
     * @param {Vector2} position - initial position
     * @returns {Array.<Vector2>|| null} a series of positions with the same electric Potential as the initial position
     */
    getEquipotentialPositionArray: function( position ) {
      if ( !this.isChargedParticlePresent ) {
        // if there are no charges, don't bother to find the equipotential line
        return null;
      }
      /*
       General Idea of this algorithm

       The equipotential line is found using two searches. Starting from an initial point, we find the electric field at
       this position and define the point to the left of the electric field as the counterclockwise point, whereas the point that is
       90 degree right of the electric field is the clockwise point. The points are stored in a counterclockwise and clockwise array.
       The search of the clockwise and counterclockwise points done concurrently. The search stops if (1) the number of
       searching steps exceeds a large number and (2) either the clockwise or counterClockwise point is very far away from the origin.
       A third condition to bailout of the search is that the clockwise and counterClockwise position are very close to one another
       in which case we have a closed equipotential line. Note that if the conditions (1) and (2) are fulfilled the equipotential line
       is not going to be a closed line but this is so far away from the screenview that the end user will simply see the line going
       beyond the screen.

       After the search is done, the function returns an array of points ordered in a counterclockwise direction, i.e. after
       joining all the points, the directed line would be made of points that have an electric field
       pointing clockwise (yes  clockwise) to the direction of the line.
       */
      var stepCounter = 0; // {number} integer
      var stepMax = 500; // {number} integer, the product of stepMax and epsilonDistance should be larger than maxDistance
      var epsilonDistance = 0.05; // {number} step length along equipotential in meters
      var isLinePathClosed = false; // {boolean}
      var maxDistance = Math.max( WIDTH, HEIGHT ); //maximum distance from the center
      assert && assert( stepMax * epsilonDistance > maxDistance, 'the length of the "path" should be larger than the linear size of the screen ' );
      var nextClockwisePosition; // {Vector2}
      var nextCounterClockwisePosition; // {Vector2}
      var currentClockwisePosition = position; // {Vector2}
      var currentCounterClockwisePosition = position; // {Vector2}
      var clockwisePositionArray = [];
      var counterClockwisePositionArray = [];

      // electric potential associated with the position
      var initialElectricPotential = this.getElectricPotential( position ); // {number} in volts

      // return a null array if the initial point for the equipotential line is too close to a charged particle
      // see https://github.com/phetsims/charges-and-fields/issues/5
      var closestDistance = 2 * epsilonDistance;
      var isSafeDistance = true;
      this.chargedParticles.forEach( function( chargedParticle ) {
        isSafeDistance = isSafeDistance && (chargedParticle.position.distance( position ) > closestDistance);
      } );
      if ( !isSafeDistance ) {
        return null;
      }
      else {
        while ( stepCounter < stepMax &&
                currentClockwisePosition.magnitude() < maxDistance ||
                currentCounterClockwisePosition.magnitude() < maxDistance ) {

          nextClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
            currentClockwisePosition,
            initialElectricPotential,
            epsilonDistance );
          nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
            currentCounterClockwisePosition,
            initialElectricPotential,
            -epsilonDistance );

          clockwisePositionArray.push( nextClockwisePosition );
          counterClockwisePositionArray.push( nextCounterClockwisePosition );

          //TODO: the epsilonDistance should be adaptative and get smaller once the two heads get within some distance.

          // if the clockwise and counterclockwise points are closing in on one another let's stop after one more pass
          if ( nextClockwisePosition.distance( nextCounterClockwisePosition ) < epsilonDistance ) {
            isLinePathClosed = true;
            clockwisePositionArray.push( nextCounterClockwisePosition ); // let's close the 'path'
            break;
          }

          currentClockwisePosition = nextClockwisePosition;
          currentCounterClockwisePosition = nextCounterClockwisePosition;

          stepCounter++;
        }// end of while()

        if ( !isLinePathClosed && (currentClockwisePosition.magnitude() < maxDistance ||
                                   currentClockwisePosition.magnitude() < maxDistance) ) {
          console.log( 'an equipotential line terminates on the screen' );
          // bring out the big guns
          // see https://github.com/phetsims/charges-and-fields/issues/1
          this.getEquipotentialThroughMarchingSquaresPositionArray( position );
        }

        // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
        var reversedArray = clockwisePositionArray.reverse();
        //var positionArray = reversedArray.concat( position, counterClockwisePositionArray );
        return reversedArray.concat( position, counterClockwisePositionArray );
      }
    },

    /**
     * This method returns an array of points (vectors) with the same electric potential as the electric potential
     * at the initial position. The array is ordered with position points going counterclockwise.
     * This method uses a so called 'Marching Squares' Algorithm
     * see http://en.wikipedia.org/wiki/Marching_squares
     * @private
     * @param {Vector2} position - initial position
     * @returns {Array.<Vector2>|| null} a series of positions with the same electric Potential as the initial position
     */
    getEquipotentialThroughMarchingSquaresPositionArray: function( position ) {

      //TODO: complete this algorithm

      /*

       */
      // options = _.extend( {
      //   spacing: 0.5 // separation (distance) in model coordinates between two adjacent sensors
      // }, options );
      // var gridArray = [];
      //
      // //var minX = -WIDTH / 2;
      // var maxX = WIDTH / 2;
      // //var minY = -HEIGHT / 2;
      // var maxY = HEIGHT / 2;
      //
      // var x;
      // var y;
      //
      //// Marching Squares Parameters
      // var threshold = this.getElectricPotential( position );

    },

    /**
     * Starting from an initial position, this method generates a list of points that are
     * along an electric field lines. The list of points is forward (along the electric field) ordered.
     * @private
     * @param {Vector2} position
     * @returns {Array.<Vector2>|| null}
     *
     * UNUSED
     */
    getElectricFieldPositionArray: function( position ) {
      if ( !this.isChargedParticlePresent ) {
        // if there are no charges, don't bother to find the electric field lines
        return null;
      }
      /*
       General Idea of the algorithm

       Two arrays of points are generated. One is called forwardPositionArray and is made of all the points
       (excluding the initial point) that are along the electric field. The point are generated sequentially.
       Starting from the initial point it finds the next point that points along the initial electric field.
       The search stops once (1) the number of steps exceeds some large number, (2) the current position is very far away
       from the origin (center) of the model, (3) the current position is very close to a charge.
       A similar search process is repeated for the direction opposite to the electric field.
       Once the search process is over the two arrays are stitched together.  The resulting point array contains
       a sequence of forward ordered points, i.e. the electric field points forward to the next point.
       If no charges are present on the board, then the notion of electric field line does not exist, and the value
       null is returned
       */

      // closest approach distance to a charge in meters, should be smaller than the radius of a charge in the view
      var closestApproachDistance = 0.05; // in meters, for reference the radius of the charge circle is 0.10 m
      // define the largest electric field before the electric field line search algorithm bails out
      var maxElectricFieldMagnitude = K_CONSTANT / Math.pow( closestApproachDistance, 2 ); // {number}

      var stepCounter = 0; // our step counter

      // the product of stepMax and epsilonDistance should exceed the WIDTH or HEIGHT variable
      var stepMax = 2000; // an integer, the maximum number of steps in the algorithm
      var epsilonDistance = 0.025; // in meter

      var maxDistance = 3 * Math.max( WIDTH, HEIGHT ); // maximum distance from the initial position in meters

      var nextForwardPosition; // {Vector2} next position along the electric field
      var nextBackwardPosition; // {Vector2} next position opposite to the electric field direction
      var currentForwardPosition = position;
      var currentBackwardPosition = position;
      var forwardPositionArray = [];
      var backwardPositionArray = [];

      // find the positions along the electric field
      while ( stepCounter < stepMax &&
              currentForwardPosition.magnitude() < maxDistance &&
              this.getElectricField( currentForwardPosition ).magnitude() < maxElectricFieldMagnitude ) {
        nextForwardPosition = this.getNextPositionAlongElectricField( currentForwardPosition, epsilonDistance );
        forwardPositionArray.push( nextForwardPosition );
        currentForwardPosition = nextForwardPosition;
        stepCounter++;
      }// end of while()

      // reset the counter
      stepCounter = 0;

      // find the positions opposite to the initial electric field
      while ( stepCounter < stepMax &&
              currentBackwardPosition.magnitude() < maxDistance &&
              this.getElectricField( currentBackwardPosition ).magnitude() < maxElectricFieldMagnitude ) {

        nextBackwardPosition = this.getNextPositionAlongElectricField( currentBackwardPosition, -epsilonDistance );
        backwardPositionArray.push( nextBackwardPosition );
        currentBackwardPosition = nextBackwardPosition;
        stepCounter++;
      }// end of while()

      // order all the positions (including the initial point) in an array in a forward fashion
      var reversedArray = backwardPositionArray.reverse();

      return reversedArray.concat( position, forwardPositionArray ); //  positionArray ordered
    },

    /**
     * Push an equipotentialLine to an observable array
     * The drawing of the equipotential line is handled in the view (equipotentialLineNode)
     * @public
     * @param {Vector2} [position] - optional argument: starting point to calculate the equipotential line
     */
    addElectricPotentialLine: function( position ) {
      var equipotentialLine = {};

      if ( position ) {
        equipotentialLine.position = position;
      }
      else {
        // use the location of the electric Potential Sensor as default position
        equipotentialLine.position = this.electricPotentialSensor.position;
      }
      equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
      equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
      // make sure the positionArray is not null
      if ( equipotentialLine.positionArray ) {
        this.equipotentialLinesArray.push( equipotentialLine );
      }
    },

    /**
     * Push an electricFieldLine to an observable array
     * The drawing of the electricField Line is handled in the view.
     * @public
     * @param {Vector2} position - starting point to calculate the electric field line
     */
    addElectricFieldLine: function( position ) {
      // electric field lines don't exist in a vacuum of charges
      var electricFieldLine = {};
      if ( this.isChargedParticlePresent ) {
        electricFieldLine.position = position;
        electricFieldLine.positionArray = this.getElectricFieldPositionArray( electricFieldLine.position );
        this.electricFieldLinesArray.push( electricFieldLine );
      }
    },

    /**
     * Push many electric Potential Lines to an observable array
     * The drawing of the electric Potential Lines is handled in the view.
     * @param {number} numberOfLines
     * USED IN DEBUGGING MODE
     */
    addManyEquipotentialLines: function( numberOfLines ) {
      var i;
      for ( i = 0; i < numberOfLines; i++ ) {
        var position = new Vector2( WIDTH * (Math.random() - 0.5), HEIGHT * (Math.random() - 0.5) ); // a random position on the graph

        var equipotentialLine = {};
        equipotentialLine.position = position;
        equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
        equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
        this.equipotentialLinesArray.push( equipotentialLine );
      }
    },

    /**
     * Push many electric Field Lines to an observable array
     * The drawing of the electric Field Lines and electric Potential Lines is handled in the view.

     * @param {number} numberOfLines
     * USED IN DEBUGGING MODE
     */
    addManyElectricFieldLines: function( numberOfLines ) {
      var i;
      for ( i = 0; i < numberOfLines; i++ ) {
        var position = new Vector2( WIDTH * (Math.random() - 0.5), HEIGHT * (Math.random() - 0.5) ); // a random position on the graph
        var electricFieldLine = {};
        electricFieldLine.position = position;
        electricFieldLine.positionArray = this.getElectricFieldPositionArray( electricFieldLine.position );
        this.electricFieldLinesArray.push( electricFieldLine );
      }
    },

    /**
     * Function that clears the Equipotential Lines Observable Array
     * @public
     */
    clearEquipotentialLines: function() {
      this.equipotentialLinesArray.clear();
    },

    /**
     * Function that clears the Electric Field Lines Observable Array
     * @public
     */
    clearElectricFieldLines: function() {
      this.electricFieldLinesArray.clear();
    }

  } );
} );


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
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var interpolateRGBA = require( 'SCENERY/util/Color' ).interpolateRGBA;
    var LinearFunction = require( 'DOT/LinearFunction' );
    var ObservableArray = require( 'AXON/ObservableArray' );
    var inherit = require( 'PHET_CORE/inherit' );
    var PropertySet = require( 'AXON/PropertySet' );
    var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
    var StaticSensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/StaticSensorElement' );
    var Vector2 = require( 'DOT/Vector2' );

    //constants
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

      PropertySet.call( thisModel, {
        eFieldIsVisible: false, // control the visibility of a grid of arrows representing the local electric field
        directionOnlyIsVisible: false, // controls the color shading in the fill of
        voltageIsVisible: false, // control the visibility of the electric potential field, a.k.a. rectangular grid
        valuesIsVisible: false,  // control the visibility of many numerical values ( e field sensors, equipotential lines, etc)
        gridIsVisible: false,  //  control the visibility of the simple grid with minor and major axes
        tapeMeasureIsVisible: false, // control the visibility of the measuring tape
        tapeMeasureUnits: { name: 'cm', multiplier: 100 } // needed for the measuring tape scenery node
      } );
      // @public read-only
      this.bounds = new Bounds2( -WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2 ); // bounds of the sim play ground

      // @public read-only
      this.chargeAndSensorEnclosureBounds = new Bounds2( -1.25, -2.30, 1.25, -1.70 );

      // Observable arrays of all electric charges
      // @public
      this.chargedParticles = new ObservableArray();

      // Observable arrays of all draggable electric field sensors
      // @public
      this.electricFieldSensors = new ObservableArray();

      // electric potential detector
      var position = new Vector2( -2.5, -1.0 ); // position of the crosshair on the electric potential sensor
      this.electricPotentialSensor = new SensorElement( position );
      this.electricPotentialSensor.electricField = thisModel.getElectricField( this.electricPotentialSensor.position );
      this.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( this.electricPotentialSensor.position );

      // electric Field Sensors Grid
      // @public read-only
      this.electricFieldSensorGrid = thisModel.sensorGridFactory( {
        spacing: ELECTRIC_FIELD_SENSOR_SPACING,
        onOrigin: true
      } );

      // @public read-only
      this.electricPotentialGrid = thisModel.sensorGridFactory( {
        spacing: ELECTRIC_POTENTIAL_SENSOR_SPACING,
        onOrigin: false
      } );

      // @public read-only
      this.equipotentialLinesArray = new ObservableArray();

      // @public read-only
      this.electricFieldLinesArray = new ObservableArray();

      //////////////////////////////////////////
      //// Hook Up listeners
      /////////////////////////////////////////////////

      // for performance reason, the electric field sensors on the grid is calculated and updated only if their
      // visibility is set to true
      this.eFieldIsVisibleProperty.link( function( isVisible ) {
        if ( isVisible === true ) {
          thisModel.electricFieldSensorGrid.forEach( function( sensorElement ) {
            sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
          } );
        }
      } );

      // for performance reason, the electric potential is calculated and updated only if it is set to visible
      this.voltageIsVisibleProperty.link( function( isVisible ) {
        if ( isVisible ) {
          thisModel.electricPotentialGrid.forEach( function( sensorElement ) {
            sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );
          } );
        }
      } );

      // if any charges move, we need to update all the sensors
      this.chargedParticles.addItemAddedListener( function( chargedParticle ) {

        // send a trigger signal (go back to origin) if the charge particle is over the enclosure
        chargedParticle.userControlledProperty.link( function( userControlled ) {
          if ( !userControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( chargedParticle.position ) ) {
            chargedParticle.animating = true;
          }
        } );

        chargedParticle.positionProperty.link( function( position, oldPosition ) {

          // remove equipotential lines and electric field lines when the position of a charged particle changes
          thisModel.clearEquipotentialLines();
          thisModel.clearElectricFieldLines();

          var charge = chargedParticle.charge;

          // update the Electric Field Sensors
          thisModel.electricFieldSensors.forEach( function( sensorElement ) {
            sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
          } );

          // update the Electric Potential Sensor
          thisModel.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( thisModel.electricPotentialSensor.position );

          // update the Electric Field Grid Sensors
          if ( thisModel.eFieldIsVisible === true ) {
            thisModel.electricFieldSensorGrid.forEach( function( sensorElement ) {
              if ( oldPosition === null ) {
                sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
              }
              else {
                sensorElement.electricField = sensorElement.electricField.plus( thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
              }
            } );
          }

          // update the Electric Potential Grid Sensors
          if ( thisModel.voltageIsVisible === true ) {
            thisModel.electricPotentialGrid.forEach( function( sensorElement ) {
              if ( oldPosition === null ) {
                sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );
              }
              else {
                sensorElement.electricPotential += thisModel.getElectricPotentialChange( sensorElement.position, position, oldPosition, charge );
              }
            } );
          }
        } );
      } );


      //TODO this seems very redundant with the code for adding a particle
      // if any charge is removed, we need to update all the sensors
      this.chargedParticles.addItemRemovedListener( function() {

        // remove equipotential lines and electric field lines when the position of a charged particle changes
        thisModel.clearEquipotentialLines();
        thisModel.clearElectricFieldLines();

        // update the Electric Field Sensors
        thisModel.electricFieldSensors.forEach( function( sensorElement ) {
          sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
        } );

        // update the Electric Potential Sensor
        thisModel.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( thisModel.electricPotentialSensor.position );

        // update the Electric Field Grid Sensors
        if ( thisModel.eFieldIsVisible === true ) {
          thisModel.electricFieldSensorGrid.forEach( function( sensorElement ) {
            sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
          } );
        }

        // update the Electric Potential Grid Sensors
        if ( thisModel.voltageIsVisible === true ) {
          thisModel.electricPotentialGrid.forEach( function( sensorElement ) {
            sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );
          } );
        }
      } );


      // update the Electric Field Sensors upon a change of position
      this.electricFieldSensors.addItemAddedListener( function( electricFieldSensor ) {
        electricFieldSensor.positionProperty.link( function( position ) {
          electricFieldSensor.electricField = thisModel.getElectricField( position );
        } );

        // send a trigger signal (go back to origin) if the electric field sensor is over the enclosure
        electricFieldSensor.userControlledProperty.link( function( userControlled ) {
          if ( !userControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( electricFieldSensor.position ) ) {
            electricFieldSensor.animating = true;
          }
        } );
      } );

      // update the Electric Potential Sensor upon a change of position
      this.electricPotentialSensor.positionProperty.link( function( position ) {
        thisModel.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( position );
      } );
    }

    return inherit( PropertySet, ChargesAndFieldsModel, {
      // @public
      reset: function() {
        this.equipotentialLinesArray.clear();
        this.electricFieldLinesArray.clear();
        this.chargedParticles.clear();
        this.electricFieldSensors.clear();
        this.electricPotentialSensor.reset();
        PropertySet.prototype.reset.call( this );
      },

      step: function( dt ) {
        this.chargedParticles.forEach( function( chargedParticle ) {
          chargedParticle.step( dt );
        } );

        this.electricFieldSensors.forEach( function( chargedParticle ) {
          chargedParticle.step( dt );
        } );

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
       * The position of the sensors is determined the options parameter, and is bounded by the bounds of the model.
       * @param {Object} [options]
       * @returns {Array}
       */
      sensorGridFactory: function( options ) {
        options = _.extend( {
          spacing: 0.5, // separation (distance) in model coordinates between two adjacent sensors
          onOrigin: true // is there  a sensor at the origin (0,0)
        }, options );
        var gridArray = [];

        //var minX = -WIDTH / 2;
        var maxX = WIDTH / 2;
        //var minY = -HEIGHT / 2;
        var maxY = HEIGHT / 2;

        var spacingOffset;
        if ( options.onOrigin ) {
          spacingOffset = options.spacing;
        }
        else {
          spacingOffset = options.spacing / 2;
        }

        var x;
        var y;

        for ( x = spacingOffset; x < maxX; x += options.spacing ) {
          for ( y = spacingOffset; y < maxY; y += options.spacing ) {
            var quadrant1Position = new Vector2( x, y );
            var quadrant2Position = new Vector2( -x, y );
            var quadrant3Position = new Vector2( -x, -y );
            var quadrant4Position = new Vector2( x, -y );

            gridArray.push(
              new StaticSensorElement( quadrant1Position ),
              new StaticSensorElement( quadrant2Position ),
              new StaticSensorElement( quadrant3Position ),
              new StaticSensorElement( quadrant4Position )
            );
          }
        }

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
            var negativeYAxisPosition = new Vector2( 0, -y );

            gridArray.push(
              new StaticSensorElement( positiveYAxisPosition ),
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
       * @returns {Vector2}
       */
      getElectricFieldChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
        var newDistancePowerCube = Math.pow( newChargePosition.distanceSquared( position ), 1.5 );
        var oldDistancePowerCube = Math.pow( oldChargePosition.distanceSquared( position ), 1.5 );
        var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
        var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
        var electricFieldChange = (newFieldVector.subtract( oldFieldVector )).multiplyScalar( particleCharge * K_CONSTANT );
        return electricFieldChange;
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
        var electricPotentialChange = particleCharge * K_CONSTANT * (1 / newDistance - 1 / oldDistance);
        return electricPotentialChange;
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
          var displacementVector = position.minus( chargedParticle.position );
          electricField.add( displacementVector.multiplyScalar( (chargedParticle.charge) / distancePowerCube ) );
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
        return this.getNextPositionAlongEquipotentialWithVoltage.call( this, position, initialElectricPotential, deltaDistance );
      },

      /**
       * Given a (initial) position, find a position with the targeted electric potential voltage within a distance deltaDistance
       * @private
       * @param {Vector2} position
       * @param {number} voltage
       * @param {number} deltaDistance - a distance in meters, can be positive or negative
       * @returns {Vector2} finalPosition
       */
      getNextPositionAlongEquipotentialWithVoltage: function( position, voltage, deltaDistance ) {
        var initialElectricField = this.getElectricField( position );
        var equipotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); // normalized Vector along equipotential
        var midwayPosition = ( equipotentialNormalizedVector.multiplyScalar( deltaDistance ) ).add( position ); // a Vector2
        var midwayElectricField = this.getElectricField( midwayPosition ); // a Vector2
        var midwayElectricPotential = this.getElectricPotential( midwayPosition ); // a number
        var deltaElectricPotential = midwayElectricPotential - voltage;
        var deltaPosition = midwayElectricField.multiplyScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared() );
        var finalPosition = midwayPosition.add( deltaPosition );
        return finalPosition;
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
        var midwayDisplacement = initialElectricField.normalized().multiplyScalar( deltaDistance / 2 );
        var midwayPosition = midwayDisplacement.add( position );
        var midwayElectricField = this.getElectricField( midwayPosition );
        var deltaDisplacement = midwayElectricField.normalized().multiplyScalar( deltaDistance );
        var finalPosition = deltaDisplacement.add( position );
        return finalPosition;
      },

      /**
       * This method returns an array of points (vectors) with the same electric potential as the electric potential
       * at the initial position. The array is ordered with position points going counterclockwise.
       * @private
       * @param {Vector2} position - initial position
       * @returns {Array.<Vector2>|| null} a series of positions with the same electric Potential as the initial position
       */
      getEquipotentialPositionArray: function( position ) {
        if ( this.chargedParticles.length === 0 ) {
          // if there are no charges, don't bother to find the equipotential line
          return null;
        }
        var stepCounter = 0;
        var stepMax = 3000;
        var epsilonDistance = 0.01;//step length along equipotential in meters
        var readyToBreak = false;
        var maxDistance = Math.max( WIDTH, HEIGHT ); //maximum distance from the center
        var nextPositionClockwise;
        var nextPositionCounterClockwise;
        var currentPositionClockwise = position;
        var currentPositionCounterClockwise = position;
        var positionClockwiseArray = [];
        var positionCounterClockwiseArray = [];

        var initialElectricPotential = this.getElectricPotential( position );

        while ( stepCounter < stepMax &&
                currentPositionClockwise.magnitude() < maxDistance &&
                currentPositionCounterClockwise.magnitude() < maxDistance ) {

          nextPositionClockwise = this.getNextPositionAlongEquipotentialWithVoltage( currentPositionClockwise, initialElectricPotential, epsilonDistance );
          nextPositionCounterClockwise = this.getNextPositionAlongEquipotentialWithVoltage( currentPositionCounterClockwise, initialElectricPotential, -epsilonDistance );

          positionClockwiseArray.push( nextPositionClockwise );
          positionCounterClockwiseArray.push( nextPositionCounterClockwise );

          if ( readyToBreak ) {
            break;
          }

          // if the clockwise and counterclockwise points are closing in on one another let's stop after one more pass
          if ( nextPositionClockwise.distance( nextPositionCounterClockwise ) < epsilonDistance / 2 ) {
            readyToBreak = true;
          }

          currentPositionClockwise = nextPositionClockwise;
          currentPositionCounterClockwise = nextPositionCounterClockwise;

          stepCounter++;
        }//end of while()

        //let's order all the positions (including the initial point) in an array in a counterclockwise fashion
        var reverseArray = positionClockwiseArray.reverse();
        var positionArray = reverseArray.concat( position, positionCounterClockwiseArray );
        return positionArray;
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
        if ( this.chargedParticles.length === 0 ) {
          // if there are no charges, don't bother to find the electric field lines
          return null;
        }

        var closestApproachDistance = 0.01; // closest approach distance to a charge in meters
        var maxElectricFieldMagnitude = K_CONSTANT / Math.pow( closestApproachDistance, 2 );

        var stepCounter = 0;

        // the product of stepMax and epsilonDistance should exceed the WIDTH or HEIGHT variable
        var stepMax = 2000;
        var epsilonDistance = 0.01; // in meter t

        var maxDistance = Math.max( WIDTH, HEIGHT ); //maximum distance from the initial position in meters

        var nextPositionForward;
        var nextPositionBackward;
        var currentPositionForward = position;
        var currentPositionBackward = position;
        var positionForwardArray = [];
        var positionBackwardArray = [];

        //TODO: the this.getElectricField(currentPositionForward).magnitude() call is expensive
        // find way to reuse it
        while ( stepCounter < stepMax &&
                currentPositionForward.magnitude() < maxDistance &&
                this.getElectricField( currentPositionForward ).magnitude() < maxElectricFieldMagnitude ) {
          nextPositionForward = this.getNextPositionAlongElectricField( currentPositionForward, epsilonDistance );
          positionForwardArray.push( nextPositionForward );
          currentPositionForward = nextPositionForward;
          stepCounter++;
        }//end of while()

        stepCounter = 0;
        while ( stepCounter < stepMax &&
                currentPositionBackward.magnitude() < maxDistance &&
                this.getElectricField( currentPositionBackward ).magnitude() < maxElectricFieldMagnitude ) {

          nextPositionBackward = this.getNextPositionAlongElectricField( currentPositionBackward, -epsilonDistance );
          positionBackwardArray.push( nextPositionBackward );
          currentPositionBackward = nextPositionBackward;
          stepCounter++;
        }//end of while()

        //let's order all the positions (including the initial point) in an array in a forward fashion
        var reverseArray = positionBackwardArray.reverse();
        var positionArray = reverseArray.concat( position, positionForwardArray );
        return positionArray;
      },

      /**
       * Given a position returns a color that represent the intensity of the electricPotential at that point
       * @public read-only
       * @param {Vector2} position
       * @param {number} [electricPotential] - (optional Argument)
       * @returns {Color} color
       */
      getColorElectricPotential: function( position, electricPotential ) {

        if ( typeof electricPotential === "undefined" ) {
          electricPotential = this.getElectricPotential( position );
        }


        var electricPotentialMax = 40; // voltage (in volts) at which color will saturate to colorMax
        var electricPotentialMin = -40; // voltage at which color will saturate to minColor

        // Color constants
        var maxColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositive;   // for electricPotentialMax
        var backgroundColor = ChargesAndFieldsColors.electricPotentialGridZero; // for electric Potential of Zero
        var minColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegative; // for electricPotentialMin

        var finalColor;
        var distance;

        // a piecewise function is used to interpolate

        // for positive potential
        if ( electricPotential > 0 ) {
          var linearInterpolationPositive = new LinearFunction( 0, electricPotentialMax, 0, 1, true );  // clamp the linear interpolation function;
          distance = linearInterpolationPositive( electricPotential );
          finalColor = interpolateRGBA( backgroundColor, maxColor, distance ); //distance must be between 0 and 1
        }
        // for negative (or zero) potential
        else {
          var linearInterpolationNegative = new LinearFunction( electricPotentialMin, 0, 0, 1, true );  // clamp the linear interpolation function;
          distance = linearInterpolationNegative( electricPotential ); //
          finalColor = interpolateRGBA( minColor, backgroundColor, distance ); // distance must be between 0 and 1
        }
        return finalColor;
      },

      /**
       * Given a position, returns a color that is related to the intensity of the electric field magnitude.
       * @private
       * @param {Vector2} position
       * @param {number} [electricFieldMagnitude] -(optional argument)
       * @returns {Color}
       *
       */
      getColorElectricFieldMagnitude: function( position, electricFieldMagnitude ) {

        var electricFieldMag;
        if ( typeof electricFieldMagnitude === "undefined" ) {
          electricFieldMag = this.getElectricField( position ).magnitude();
        }
        else {
          electricFieldMag = electricFieldMagnitude;
        }

        var maxColor = ChargesAndFieldsColors.electricFieldGridSaturation;   // for electricPotentialMax
        var backgroundColor = ChargesAndFieldsColors.electricFieldGridZero; //  for zero electric Field
        var maxElectricFieldMagnitude = 5; // electricField at which color will saturate to maxColor (in Volts/meter)

        var linearInterpolationPositive = new LinearFunction( 0, maxElectricFieldMagnitude, 0, 1, true ); // true clamps the linear interpolation function;
        var distance = linearInterpolationPositive( electricFieldMag ); // a value between 0 and 1

        return interpolateRGBA( backgroundColor, maxColor, distance );
      },

      /**
       * Push an equipotentialLine to an observable array
       * The drawing of the equipotential line is handled in the view (equipotentialLineNode)
       * @param {Vector2} [position] - optional argument: starting point to calculate the equipotential line
       * @public
       */
      addElectricPotentialLine: function( position ) {
        // electric potential lines don't exist in a vacuum of charges
        if ( this.chargedParticles.length > 0 ) {
          var equipotentialLine = {};

          if ( position ) {
            equipotentialLine.position = position;
          }
          else {
            // use the location of the electric Potential Sensor as default position
            equipotentialLine.position = this.electricPotentialSensor.position;
          }
          equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
          equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
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
        if ( this.chargedParticles.length > 0 ) {
          electricFieldLine.position = position;
          electricFieldLine.positionArray = this.getElectricFieldPositionArray( electricFieldLine.position );
          this.electricFieldLinesArray.push( electricFieldLine );
        }
      },

      /**
       * Push many electric Field Lines and  electric Potential Lines to an observable array
       * The drawing of the electric Field Lines and electric Potential Lines is handled in the view.
       * @private
       * @param {number} numberOfLines
       * UNUSED, FOR DEBUGGING PURPOSES
       */
      addManyLine: function( numberOfLines ) {

        var i;
        for ( i = 0; i < numberOfLines; i++ ) {
          var position = new Vector2( WIDTH * (Math.random() - 0.5), HEIGHT * (Math.random() - 0.5) ); // a random position on the graph
          var electricFieldLine = {};
          electricFieldLine.position = position;
          electricFieldLine.positionArray = this.getElectricFieldPositionArray( electricFieldLine.position );
          this.electricFieldLinesArray.push( electricFieldLine );

          var equipotentialLine = {};
          equipotentialLine.position = position;
          equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
          equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
          this.equipotentialLinesArray.push( equipotentialLine );
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
  }
)
;


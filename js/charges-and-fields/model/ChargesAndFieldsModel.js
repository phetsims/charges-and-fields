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
    //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var Color = require( 'SCENERY/util/Color' );
    var interpolateRGBA = require( 'SCENERY/util/Color' ).interpolateRGBA;
    var LinearFunction = require( 'DOT/LinearFunction' );
    var ObservableArray = require( 'AXON/ObservableArray' );
    var inherit = require( 'PHET_CORE/inherit' );
    var PropertySet = require( 'AXON/PropertySet' );
    // var Property = require( 'AXON/Property' );
    var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
    // var SensorGridFactory = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorGridFactory' );
    var Vector2 = require( 'DOT/Vector2' );

    //constants
    var K_CONSTANT = 9; // prefactor in E-field equation: E= k*Q/r^2 when Q is in nano coulomb, r is in meter and E is is Volt/meter
    var SATURATION_POSITIVE_COLOR = new Color( 'red' );
    var SATURATION_NEGATIVE_COLOR = new Color( 'blue' );
    var BACKGROUND_COLOR = new Color( 'black' );

    // dimension of the screen in the model
    var HEIGHT = 5; //in meters
    var WIDTH = 6.5; // in meters

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
        tapeMeasureUnits: {name: 'cm', multiplier: 100} // need for the measuring tape scenery node
      } );


      var x;
      var y;
      var i;
      var position;

      function randomPosition() {
        return Math.random() * 4 - 2;
      }

      function randomVector() {
        return new Vector2( randomPosition(), randomPosition() );
      }

      // @public read-only
      this.chargeAndSensorEnclosureBounds = new Bounds2( -1.25, -2.30, 1.25, -1.70 );

      // Observable arrays of all electric charges
      // @public
      this.chargedParticles = new ObservableArray();

      // Observable arrays of all draggable electric field sensors
      // @public
      this.electricFieldSensors = new ObservableArray();

      // electric Field Sensors Grid

///    this.electricFieldSensorGrid= new SensorGridFactory();
      /* the screen in the model is 4 meters high and 6.5 meters wide*/
      // @public read-only
      this.electricFieldSensorGrid = new ObservableArray();


      // electric potential detector
      position = new Vector2( -1.5, -0.5 );

      this.electricPotentialSensor = new SensorElement( position );
      this.electricPotentialSensor.electricField = thisModel.getElectricField( position );
      this.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( position );

      // @public read-only
      this.electricPotentialGrid = new ObservableArray();

      // @public read-only
      this.equipotentialLinesArray = new ObservableArray();
      // @public read-only
      this.electricFieldLinesArray = new ObservableArray();

      //////////////////////////////////////////
      //// Hook Up listeners to the four Observables Arrays
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

      // for performance reason, the electric potential is calculated and updated only if the check is set to visible
      this.voltageIsVisibleProperty.link( function( isVisible ) {
        if ( isVisible ) {
          thisModel.electricPotentialGrid.forEach( function( sensorElement ) {
            sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );
          } );
        }
      } );

      // if any charges move , we need to update all the sensors
      this.chargedParticles.addItemAddedListener( function( chargedParticle ) {

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

      // update the Electric Field Sensors upon a change of position
      this.electricFieldSensors.addItemAddedListener( function( electricFieldSensor ) {
        electricFieldSensor.positionProperty.link( function( position ) {
          electricFieldSensor.electricField = thisModel.getElectricField( position );
        } );
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


      var j;
      //var aspectRatio= WIDTH/HEIGHT;
      //TODO increase to a larger value the number of horizontalSensors
      var numberHorizontalSensors = 4;
      var horizontalSpacing = WIDTH / (numberHorizontalSensors + 1);
      var verticalSpacing = horizontalSpacing;
      var numberVerticalSensors = Math.floor( HEIGHT / verticalSpacing ) - 1;

      for ( i = 0; i <= numberHorizontalSensors; i++ ) {
        for ( j = 0; j <= numberVerticalSensors; j++ ) {
          x = -WIDTH / 2 + horizontalSpacing * (i + 0.5);
          y = HEIGHT / 2 - verticalSpacing * (j + 0.5);
          position = new Vector2( x, y );
          var electricFieldSensorElement = new SensorElement( position );
          electricFieldSensorElement.electricField = thisModel.getElectricField( position );
          electricFieldSensorElement.electricPotential = thisModel.getElectricPotential( position );
          this.electricFieldSensorGrid.push( electricFieldSensorElement );
        }
      }

      //   var aspectRatio= WIDTH/HEIGHT;
      //TODO increase to a larger value the number of horizontalSensors
      numberHorizontalSensors = 8;
      horizontalSpacing = WIDTH / (numberHorizontalSensors + 1);
      verticalSpacing = horizontalSpacing;
      numberVerticalSensors = Math.floor( HEIGHT / verticalSpacing ) - 1;

      for ( i = 0; i <= numberHorizontalSensors; i++ ) {
        for ( j = 0; j <= numberVerticalSensors; j++ ) {
          x = -WIDTH / 2 + horizontalSpacing * (i + 0.5);
          y = HEIGHT / 2 - verticalSpacing * (j + 0.5);
          position = new Vector2( x, y );
          var electricPotentialSensorElement = new SensorElement( position );
          electricPotentialSensorElement.electricField = thisModel.getElectricField( position );
          electricPotentialSensorElement.electricPotential = thisModel.getElectricPotential( position );
          this.electricPotentialGrid.push( electricPotentialSensorElement );
        }
      }

    }

    return inherit( PropertySet, ChargesAndFieldsModel, {
      // @public
      reset: function() {
        this.equipotentialLinesArray.clear();
        this.electricFieldLinesArray.clear();
        this.chargedParticles.clear();
        this.electricFieldSensors.clear();
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

      /**
       * Function for adding new  chargedParticles to this model when the user creates them, generally by clicking on some
       * some sort of creator node.
       * @public
       * @param {ChargedParticle} chargedParticle
       */
      addUserCreatedModelElementToObservableArray: function( modelElement, observableArray ) {
        observableArray.push( modelElement );

        modelElement.on( 'returnedToOrigin', function() {
          observableArray.remove( modelElement );
        } );
      },


      /**
       * Function for adding new  chargedParticles to this model when the user creates them, generally by clicking on some
       * some sort of creator node.
       * @public
       * @param {ChargedParticle} chargedParticle
       */
      addUserCreatedChargedParticle: function( chargedParticle ) {
        this.chargedParticles.push( chargedParticle );
        var self = this;

        chargedParticle.on( 'returnedToOrigin', function() {
          self.chargedParticles.remove( chargedParticle );
        } );
      },

      /**
       * Function for adding new electric Field sensor elements to this model when the user creates them, generally by clicking on some
       * some sort of creator node.
       * @public
       * @param {SensorElement} electricFieldSensor
       */
      addUserCreatedElectricFieldSensor: function( electricFieldSensor ) {
        this.electricFieldSensors.push( electricFieldSensor );
        var self = this;

        electricFieldSensor.on( 'returnedToOrigin', function() {
          self.electricFieldSensors.remove( electricFieldSensor );
        } );
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
        var newDistancePowerCube = Math.pow( newChargePosition.distance( position ), 3 );
        var oldDistancePowerCube = Math.pow( oldChargePosition.distance( position ), 3 );
        var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
        var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
        var electricFieldChange = (newFieldVector.minus( oldFieldVector )).timesScalar( particleCharge * K_CONSTANT );
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
          var distance = chargedParticle.position.distance( position );
          var distancePowerCube = Math.pow( distance, 3 );
          var displacementVector = position.minus( chargedParticle.position );
          electricField = electricField.plus( displacementVector.timesScalar( (chargedParticle.charge) / distancePowerCube ) );
        } );
        electricField = electricField.timesScalar( K_CONSTANT );/////prefactor depends on units
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
        electricPotential = electricPotential * K_CONSTANT;/////prefactor depends on units
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
       * @param {Number} deltaDistance , a distance
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
       * @returns {Vector2} final position
       */
      getNextPositionAlongEquipotentialWithVoltage: function( position, voltage, deltaDistance ) {
        var initialElectricField = this.getElectricField( position );
        var equipotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); //normalized Vector along equipotential
        var midwayPosition = position.plus( equipotentialNormalizedVector.timesScalar( deltaDistance ) );
        var midwayElectricField = this.getElectricField( midwayPosition );
        var midwayElectricPotential = this.getElectricPotential( midwayPosition );
        var deltaElectricPotential = midwayElectricPotential - voltage;
        var deltaPosition = midwayElectricField.timesScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared() );
        var finalPosition = midwayPosition.plus( deltaPosition );
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
        var midwayDisplacement = initialElectricField.normalized().timesScalar( deltaDistance / 2 );
        var midwayPosition = position.plus( midwayDisplacement );
        var midwayElectricField = this.getElectricField( midwayPosition );
        var deltaDisplacement = midwayElectricField.normalized().timesScalar( deltaDistance );
        var finalPosition = position.plus( deltaDisplacement );
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
          // if there are no charges, don't bother to find the electric potential
          return null;
        }
        var stepCounter = 0;
        var stepMax = 2000;
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
       * @param {number}  [electricPotential] - (optional Argument)
       * @returns {Color} color
       */
      getColorElectricPotential: function( position, electricPotential ) {

        if ( typeof electricPotential === "undefined" ) {
          electricPotential = this.getElectricPotential( position );
        }

        var electricPotentialMax = 40; // voltage (in volts) at which color will saturate to colorMax
        var electricPotentialMin = -40; // voltage at which color will saturate to colorMin

        var colorMax = SATURATION_POSITIVE_COLOR;   // for electricPotentialMax
        var backgroundColor = BACKGROUND_COLOR; // for electric Potential of Zero
        var colorMin = SATURATION_NEGATIVE_COLOR; // for electricPotentialMin

        var finalColor;

        //clamp the linear interpolation function;
        if ( electricPotential > 0 ) {
          var linearInterpolationPositive = new LinearFunction( 0, electricPotentialMax, 0, 1, true );
          var distancePositive = linearInterpolationPositive( electricPotential );
          finalColor = interpolateRGBA( backgroundColor, colorMax, distancePositive );
        }
        else {
          var linearInterpolationNegative = new LinearFunction( electricPotentialMin, 0, 0, 1, true );
          var distanceNegative = linearInterpolationNegative( electricPotential );
          finalColor = interpolateRGBA( colorMin, backgroundColor, distanceNegative );
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
       * UNUSED
       */
      getColorElectricFieldMagnitude: function( position, electricFieldMagnitude ) {

        var electricFieldMag;
        if ( typeof electricFieldMagnitude === "undefined" ) {
          electricFieldMag = this.getElectricField( position ).magnitude();
        }
        else {
          electricFieldMag = electricFieldMagnitude;
        }

        //var colorMax = SATURATION_POSITIVE_COLOR;
        var colorMax = new Color( 'white' );
        var backgroundColor = BACKGROUND_COLOR;
        var electricFieldMax = 5; // electricField at which color will saturate to colorMax (in Volts/meter)

        var linearInterpolationPositive = new LinearFunction( 0, electricFieldMax, 0, 1, true );
        var distancePositive = linearInterpolationPositive( electricFieldMag );

        return interpolateRGBA( backgroundColor, colorMax, distancePositive );
      },

      /**
       * Push an equipotentialLine to an observable array
       * The drawing of the equipotential line is handled in the view (equipotentialLineNode)
       * @public
       */
      addElectricPotentialLine: function() {
        var equipotentialLine = {};
        equipotentialLine.position = this.electricPotentialSensor.position;
        equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
        equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
        this.equipotentialLinesArray.push( equipotentialLine );
      },

      /**
       * Push an electricFieldLine to an observable array
       * The drawing of the electricField Line is handled in the view.
       * @private
       *
       * UNUSED
       */
      addElectricFieldLine: function() {
        var electricFieldLine = {};
        electricFieldLine.position = this.electricPotentialSensor.position;
        electricFieldLine.positionArray = this.getElectricFieldPositionArray( electricFieldLine.position );
        this.electricFieldLinesArray.push( electricFieldLine );
      },

      /**
       * Push an electricFieldLine to an observable array
       * The drawing of the electricField Line is handled in the view.
       * @private
       *
       * UNUSED
       */
      addManyLine: function() {

        var i;
        for ( i = 0; i < 1; i++ ) {
          var position = new Vector2( 6.5 * Math.random() - 3.25, 4 * Math.random() - 2 );
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
       * UNUSED
       */
      clearElectricFieldLines: function() {
        this.electricFieldLinesArray.clear();
      }

    } );
  }
)
;


//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var interpolateRGBA = require( 'SCENERY/util/Color' ).interpolateRGBA;
  var LinearFunction = require( 'DOT/LinearFunction' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var SensorGridFactory = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorGridFactory' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

// temporary hack
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  //constants
  var K_CONSTANT = 9; // prefactor in E-field equation: E= k*Q/r^2 when Q is in nanocoulomb, r is in meter and E is is Volt/meter
  // var RAD_TO_DEGREES = 180 / Math.PI; //convert radians to degrees
  var SATURATION_POSITIVE_COLOR = new Color( 'red' );
  var SATURATION_NEGATIVE_COLOR = new Color( 'blue' );
  var BACKGROUND_COLOR = new Color( '#FFFFB7' );

  //dimension of the screen in the model
  var HEIGHT = 4; //in meters
  var WIDTH = 6.5; // in meters

  /**
   * Main constructor for ChargesAndFieldsModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function ChargesAndFieldsModel() {

    var thisModel = this;

    PropertySet.call( thisModel, {
      eFieldIsVisible: false,
      directionOnlyIsVisible: false,
      showResolution: false,
      gridIsVisible: false,
      showNumbersIsVisible: false,
      clearEquipotentialLines: false,
      tapeMeasureIsVisible: false,
      tapeMeasureUnits: 'cm',
      tapeMeasureScale: 1,
      tapeMeasureLocation: new Vector2( 20, 50 ) /// position in the view
    } );


    var x;
    var y;
    var i;
    var position;
    var electricPotential;
    var electricCharge;
    var electricField;


    function randomPosition() {
      return Math.random() * 4 - 2;
    }

    function randomVector() {
      return new Vector2( randomPosition(), randomPosition() );
    }

    // It is important to set up the charges first (before the sensors)
    // charge particles that make up the model
    this.chargedParticles = new ObservableArray();
    // this.chargedParticles = [];
    for ( i = 0; i < 10; i++ ) {
      position = randomVector();
      electricCharge = thisModel.randomElectricCharge();
      this.chargedParticles.push( new ChargedParticle( position, electricCharge ) );
    }

    // electric Field Sensors
    this.electricFieldSensors = new ObservableArray();
    for ( i = 0; i < 2; i++ ) {
      position = randomVector();
      electricField = thisModel.getElectricField( position );
      electricPotential = thisModel.getElectricPotential( position );
      this.electricFieldSensors.push( new SensorElement( position, electricField, electricPotential, true ) );
    }

    // electric Field Sensors Grid

    // the screen in the model is 4 meters high and 6.5 meters wide
    this.electricFieldSensorGrid = new ObservableArray();

    var i;
    var j;
    //var aspectRatio= WIDTH/HEIGHT;
    var numberHorizontalSensors = 15;
    var horizontalSpacing = WIDTH / (numberHorizontalSensors + 1);
    var verticalSpacing = horizontalSpacing;
    var numberVerticalSensors = Math.floor( HEIGHT / verticalSpacing ) - 1;


    for ( i = 0; i <= numberHorizontalSensors; i++ ) {
      for ( j = 0; j <= numberVerticalSensors; j++ ) {
        x = -WIDTH / 2 + horizontalSpacing * (i + 0.5);
        y = HEIGHT / 2 - verticalSpacing * (j + 0.5);
        position = new Vector2( x, y );
        electricField = thisModel.getElectricField( position );
        electricPotential = thisModel.getElectricPotential( position );
        this.electricFieldSensorGrid.push( new SensorElement( position, electricField, electricPotential, true ) );
      }
    }
    // electric potential detector
    position = new Vector2( -1.5, -0.5 );
    electricField = thisModel.getElectricField( position );
    electricPotential = thisModel.getElectricPotential( position );
    this.electricPotentialSensor = new SensorElement( position, electricField, electricPotential, true );


    this.electricPotentialGrid = new ObservableArray();

    var i;
    var j;
    //   var aspetRatio= WIDTH/HEIGHT;
    var numberHorizontalSensors = 80;
    var horizontalSpacing = WIDTH / (numberHorizontalSensors + 1);
    var verticalSpacing = horizontalSpacing;
    var numberVerticalSensors = Math.floor( HEIGHT / verticalSpacing ) - 1;

    for ( i = 0; i <= numberHorizontalSensors; i++ ) {
      for ( j = 0; j <= numberVerticalSensors; j++ ) {
        x = -WIDTH / 2 + horizontalSpacing * (i + 0.5);
        y = HEIGHT / 2 - verticalSpacing * (j + 0.5);
        position = new Vector2( x, y );
        electricField = thisModel.getElectricField( position );
        electricPotential = thisModel.getElectricPotential( position );
        this.electricPotentialGrid.push( new SensorElement( position, electricField, electricPotential, true ) );
      }
    }

    this.equipotentialLinesArray = new ObservableArray();
  }

  return inherit( PropertySet, ChargesAndFieldsModel, {
    reset: function() {
      this.equipotentialLinesArray.clear();
      PropertySet.prototype.reset.call( this );
    },

    getElectricFieldChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
      var newDistancePowerCube = Math.pow( newChargePosition.distance( position ), 3 );
      var oldDistancePowerCube = Math.pow( oldChargePosition.distance( position ), 3 );
      var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
      var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
      var electricFieldChange = (newFieldVector.minus( oldFieldVector )).timesScalar( particleCharge * K_CONSTANT );
      return electricFieldChange;
    },

    getElectricPotentialChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
      var newDistance = newChargePosition.distance( position );
      var oldDistance = oldChargePosition.distance( position );
      var electricPotentialChange = particleCharge * K_CONSTANT * (1 / newDistance - 1 / oldDistance);
      return electricPotentialChange;
    },

    getElectricField: function( position ) {
      var electricField = new Vector2( 0, 0 );
      this.chargedParticles.forEach( function( chargedParticle ) {
        var distance = chargedParticle.location.distance( position );
        var distancePowerCube = Math.pow( distance, 3 );
        var displacementVector = position.minus( chargedParticle.location );
        electricField = electricField.plus( displacementVector.timesScalar( (chargedParticle.charge) / distancePowerCube ) );
      } );
      electricField = electricField.timesScalar( K_CONSTANT );/////prefactor depends on units
      return electricField;
    },


    getElectricPotential: function( position ) {
      var electricPotential = 0;
      this.chargedParticles.forEach( function( chargedParticle ) {
        var distance = chargedParticle.location.distance( position );
        electricPotential += (chargedParticle.charge) / distance;
      } );
      electricPotential = electricPotential * K_CONSTANT;/////prefactor depends on units
      return electricPotential;

    },


    randomBoolean: function() {
      return Math.random() < 0.5;
    },

    randomElectricCharge: function() {
      return Math.round( this.randomBoolean() * 2 - 1 );
    },

    /**
     * getNextPositionAlongEquipotential gives the next position (within a distance deltaEpsilon) with the same electric Potential
     * as the initial position.  If delta epsilon is positive, it gives as the next position, a point that is pointing (approximately) 90 degrees
     * to the left of the electric field (counterclockwise) whereas if deltaEpsilon is negative the next position is 90 degrees to the right of the
     * electric Field.
     *
     * The algorithm works best for small epsilon.
     *
     * @param {Vector2} position
     * @param {Number} deltaEpsilon , a distance
     * @returns {Vector2} next point along the equipotential line
     */
    getNextPositionAlongEquipotential: function( position, deltaEpsilon ) {
      var initialElectricPotential = this.getElectricPotential( position );
      return this.getNextPositionAlongEquipotentialWithVoltage.call( this, position, initialElectricPotential, deltaEpsilon );
    },

//starting at position with potential=voltage find final position at a distance deltaEpsilon along equipotential
    getNextPositionAlongEquipotentialWithVoltage: function( position, voltage, deltaEpsilon ) {
      var initialElectricField = this.getElectricField( position );
      var equipotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); //normalized Vector along equipotential
      var midwayPosition = position.plus( equipotentialNormalizedVector.timesScalar( deltaEpsilon ) );
      var midwayElectricField = this.getElectricField( midwayPosition );
      var midwayElectricPotential = this.getElectricPotential( midwayPosition );
      var deltaElectricPotential = midwayElectricPotential - voltage;
      var deltaPosition = midwayElectricField.timesScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared() );
      var finalPosition = midwayPosition.plus( deltaPosition );
      return finalPosition;
    },

//starting at initial position move along E-field direction and get finalPosition at which voltage is targetElectricPotential
//this function unused at present
    getNextPositionTowardTargetedElectricPotential: function( position, targetElectricPotential ) {
      var initialElectricField = this.getElectricField( position );
      var initialElectricPotential = this.getElectricPotential( position );
      var deltaElectricPotential = targetElectricPotential - initialElectricPotential;
      var deltaPosition = initialElectricField.timesScalar( (-1) * deltaElectricPotential / initialElectricField.magnitudeSquared() );
      var finalPosition = position.plus( deltaPosition );
      return finalPosition;
    },

    /**
     * This method returns a downward position along the electric field lines
     * This uses a standard midpoint algorithm
     * http://en.wikipedia.org/wiki/Midpoint_method
     *
     * @param {Vector2} position
     * @param {number} deltaEpsilon can be positive (for forward direction) or negative (for backward direction) units of meter^2/volt
     * @returns {Vector2}
     */
    getNextPositionAlongElectricField: function( position, deltaEpsilon ) {
      //deltaEpsilon has units of meter square per volts
      var initialElectricField = this.getElectricField( position );
      var midwayDisplacement = initialElectricField.timesScalar( deltaEpsilon / 2 );
      var midwayPosition = position.plus( midwayDisplacement );
      var midwayElectricField = this.getElectricField( midwayPosition );
      var deltaDisplacement = midwayElectricField.timesScalar( deltaEpsilon );
      var finalPosition = position.plus( deltaDisplacement );
      return finalPosition;
    },

    /**
     * This method returns a downward position along the electric field lines
     * This uses a standard midpoint algorithm
     * http://en.wikipedia.org/wiki/Midpoint_method
     *
     * @param {Vector2} position
     * @param {number} deltaDistance, can be positive (for forward direction) or negative (for backward direction)
     * @returns {Vector2}
     */
    getNextPositionAlongElectricField2: function( position, deltaDistance ) {
      //deltaEpsilon has units of meter square per volts
      var initialElectricField = this.getElectricField( position );
      var deltaEpsilon = deltaDistance * deltaDistance / (1 + initialElectricField.magnitude());
      return   this.getNextPositionAlongElectricField( position, deltaEpsilon );
    },

    /**
     * This method returns a series of points with the same electric potential as the electric potential
     * at the initial position.
     *
     * @param {Vector2} position : initial position
     * @returns {Array<Vector2>|| null} a series of positions with the same electric Potential as the initial position
     */
    getEquipotentialPositionArray: function( position ) {
      if ( !this.chargedParticles.length === 0 ) {
        // if there are no charges, don't bother to find the electric potential
        return null;
      }

      //  var epsilonDistance = 0.01;	 //step length along equipotential in meters
      var epsilonDistance = 0.01;	 //step length along equipotential in meters
      var readyToBreak = false;
      var stepCounter = 0;
      var maxSteps = 4000;
      var maxDistance = Math.max( WIDTH, HEIGHT ); //maximum distance from the center
      var nextPositionClockwise;
      var nextPositionCounterClockwise;
      var currentPositionClockwise = position;
      var currentPositionCounterClockwise = position;
      var positionClockwiseArray = [];
      var positionCounterClockwiseArray = [];

      var initialElectricPotential = this.getElectricPotential( position );

      while ( stepCounter < maxSteps &&
              Math.abs( currentPositionClockwise.x ) < maxDistance &&
              Math.abs( currentPositionClockwise.y ) < maxDistance &&
              Math.abs( currentPositionCounterClockwise.x ) < maxDistance &&
              Math.abs( currentPositionCounterClockwise.y ) < maxDistance ) {

        nextPositionClockwise = this.getNextPositionAlongEquipotentialWithVoltage( currentPositionClockwise, initialElectricPotential, epsilonDistance );
        nextPositionCounterClockwise = this.getNextPositionAlongEquipotentialWithVoltage( currentPositionCounterClockwise, initialElectricPotential, -epsilonDistance );

        positionClockwiseArray.push( nextPositionClockwise );
        positionCounterClockwiseArray.push( nextPositionCounterClockwise );

        if ( readyToBreak ) {break;}

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
      var finalArray = reverseArray.concat( position, positionCounterClockwiseArray );
      return  finalArray;
    },

    /**
     * Starting from an initial position, this method generates a list of points that are
     * along an electric field lines. The list of points is forward (along the electric field) ordered.
     *
     * @param {Vector2} position
     * @returns {Array<Vector2>|| null}
     */
    getElectricFieldPositionArray: function( position ) {
      if ( !this.chargedParticles.length === 0 ) {
        // if there are no charges, don't bother to find the electric field lines
        return null;
      }

      var closestApproachDistance = 0.2; // in meters
      var maxElectricFieldMagnitude = K_CONSTANT / Math.pow( closestApproachDistance, 2 );

      var stepCounter = 0;
      var maxSteps = 100;
      var epsilonDistance = 0.01; // in meter square per Volt
      var readyToBreak = false;

      var maxDistance = 10; //maximum distance from the initial position in meters


      var nextPositionForward;
      var nextPositionBackward;
      var currentPositionForward = position;
      var currentPositionBackward = position;
      var positionForwardArray = [];
      var positionBackwardArray = [];

      //TODO: the this.getElectricField(currentPositionForward).magnitude() call is expensive
      // find way to reuse it
      while ( stepCounter < maxSteps ||
              currentPositionForward.magnitude() < maxDistance ||
              this.getElectricField( currentPositionForward ).magnitude() > maxElectricFieldMagnitude ) {

        nextPositionForward = this.getNextPositionAlongElectricField2( currentPositionForward, epsilonDistance );
        positionForwardArray.push( nextPositionForward );
        currentPositionForward = nextPositionForward;
        stepCounter++;
      }//end of while()

      stepCounter = 0;
      while ( stepCounter < maxSteps ||
              currentPositionBackward.magnitude() < maxDistance ||
              this.getElectricField( currentPositionBackward ).magnitude() > maxElectricFieldMagnitude ) {

        nextPositionBackward = this.getNextPositionAlongElectricField2( currentPositionBackward, -epsilonDistance );
        positionBackwardArray.push( nextPositionBackward );
        currentPositionBackward = nextPositionBackward;
        stepCounter++;
      }//end of while()

      //let's order all the positions (including the initial point) in an array in a forward fashion
      var reverseArray = positionBackwardArray.reverse();
      var finalArray = reverseArray.concat( position, positionForwardArray );
      return  finalArray;
    },
    /**
     *  Given a position returns a color that represent the intensity of the electricPotential at that point
     * @param {Vector2} position
     * @param {number}  electricPotential (optional Argument)
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
     *
     * @param {Vector2} position
     * @param {number} electricFieldMagnitude (optional argument)
     * @returns {Color}
     */
    getColorElectricFieldMagnitude: function( position, electricFieldMagnitude ) {

      if ( typeof electricFieldMagnitude === "undefined" ) {
        electricFieldMagnitude = this.electricField( position ).magnitude();
      }

      var colorMax = SATURATION_POSITIVE_COLOR;
      var backgroundColor = BACKGROUND_COLOR;
      var electricFieldMax = 200; // electricField at which color will saturate to colorMax (in Volts/meter)

      var linearInterpolationPositive = new LinearFunction( 0, electricFieldMax, 0, 1, true );
      var distancePositive = linearInterpolationPositive( electricFieldMagnitude );

      return interpolateRGBA( backgroundColor, colorMax, distancePositive );
    },

    /**
     * Push an equipotentialLine to the observable array
     * The drawing of the equipotential line is handled in the view (equipotentialLineNode)
     */
    addElectricPotentialLine: function() {
      var equipotentialLine = {};
      equipotentialLine.position = this.electricPotentialSensor.location;
      equipotentialLine.positionArray = this.getEquipotentialPositionArray( equipotentialLine.position );
      equipotentialLine.electricPotential = this.getElectricPotential( equipotentialLine.position );
      this.equipotentialLinesArray.push( equipotentialLine );
    }
  } );
} );


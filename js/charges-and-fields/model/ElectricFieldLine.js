// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric field line
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var dot = require( 'DOT/dot' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var MAX_STEPS = 2000; // an integer, the maximum number of steps in the algorithm
  var MIN_STEPS = 1000; // an integer, the minimum number of steps in the algorithm
  var MAX_EPSILON_DISTANCE = 0.10; // in meter, the maximum distance covered by a step (inside the bounds)
  var MIN_EPSILON_DISTANCE = 0.01; // in meter, the minimum distance covered by a step
  var SUPER_MAX_EPSILON_DISTANCE = 2.50; // in meter, the maximum distance covered by a step when outside the model bounds

  /**
   *
   * @param {Vector2} position - starting position for the search
   * @param {Bounds2} bounds - bounds of the electricField Lines
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - all the chargedParticles within the array are active
   * @param {Function} getElectricField - function that returns the electric Field at location 'position'
   * @param {Property.<boolean>} isPlayAreaChargedProperty
   * @constructor
   */
  function ElectricFieldLine( position,
                              bounds,
                              chargedParticles,
                              getElectricField,
                              isPlayAreaChargedProperty ) {

    this.position = position;  // @public read-only static

    this.bounds = bounds;   // @private static
    this.chargedParticles = chargedParticles; // @private static
    this.getElectricField = getElectricField;   // @private static

    if ( !isPlayAreaChargedProperty.value ) {
      // if there are no charges, don't bother to find the electric field line
      this.isLinePresent = false;     // @public read-only
    }
    else {
      // find the positions that make up the electric field line
      this.positionArray = this.getElectricFieldPositionArray( position ); // @public read-only
      this.isLinePresent = true;
    }
  }

  return inherit( Object, ElectricFieldLine, {
    /**
     * Given an (initial) position, find a position along the electric field line within a distance deltaDistance
     * This uses a standard RK4 algorithm (precise to (deltaDistance)^4)
     * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongElectricFieldWithRK4: function( position, deltaDistance ) {
      var initialElectricField = this.getElectricField( position ); // {Vector2}
      assert && assert( initialElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
      var k1Vector = this.getElectricField( position ).normalize(); // {Vector2} normalized Vector along electricPotential
      var k2Vector = this.getElectricField( position.plus( k1Vector.timesScalar( deltaDistance / 2 ) ) ).normalize(); // {Vector2} normalized Vector along electricPotential
      var k3Vector = this.getElectricField( position.plus( k2Vector.timesScalar( deltaDistance / 2 ) ) ).normalize(); // {Vector2} normalized Vector along electricPotential
      var k4Vector = this.getElectricField( position.plus( k3Vector.timesScalar( deltaDistance ) ) ).normalize(); // {Vector2} normalized Vector along electricPotential
      var deltaDisplacement =
      {
        x: deltaDistance * (k1Vector.x + 2 * k2Vector.x + 2 * k3Vector.x + k4Vector.x) / 6,
        y: deltaDistance * (k1Vector.y + 2 * k2Vector.y + 2 * k3Vector.y + k4Vector.y) / 6
      };
      return position.plus( deltaDisplacement ); // {Vector2} finalPosition
    },

    /**
     * This method returns a downward position vector along the electric field lines
     * This uses a standard midpoint algorithm (precise to (deltaDistance)^2)
     * http://en.wikipedia.org/wiki/Midpoint_method
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - can be positive (for forward direction) or negative (for backward direction) (units of meter)
     * @returns {Vector2} finalPosition
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
     * Starting from an initial position, this method generates a list of points that are
     * along an electric field lines. The list of points is forward (along the electric field) ordered.
     * @private
     * @param {Vector2} position
     * @returns {Array.<Vector2>}
     */
    getElectricFieldPositionArray: function( position ) {
      /*
       Two arrays of points are generated. One is called forwardPositionArray and is made of all the points
       (excluding the initial point) that are along the electric field. The point are generated sequentially.

       A similar search process is repeated for the direction opposite to the electric field.
       Once the search process is over the two arrays are stitched together.  The resulting point array contains
       a sequence of forward ordered points, i.e. the electric field points forward to the next point.
       */

      var forwardPositionArray = this.getPositionArray( position, false );
      var backwardPositionArray = this.getPositionArray( position, true );

      // order all the positions (including the initial point) in an array in a forward fashion
      var reversedArray = backwardPositionArray.reverse();
      return reversedArray.concat( position, forwardPositionArray ); //  positionArray ordered

    },

    /**
     * Function that returns an array of positions along (parallel) the electric field .
     * Starting from the initial point it finds the next point that points along the initial electric field.
     * The search stops once (1) the number of steps exceeds some large number, (2) the current position is no longer
     * within the enlarged bounds of the model, (3) the current position is very close to a charge.
     * A search can be performed against the direction of the electric field if the flag isSearchingBackward is true.
     * The returned array does not contain the initial position.
     *
     * @private
     * @param {Vector2} position
     * @param {boolean} isSearchingBackward
     * @returns {Array.<Vector2>} positionArray
     */
    getPositionArray: function( position, isSearchingBackward ) {

      var sign = ((isSearchingBackward) ? -1 : 1);
      var epsilonDistance = sign * MIN_EPSILON_DISTANCE; // initial working value of epsilon distance
      var currentPosition = position; // {Vector2} initial value  for the search position
      var nextPosition; // {Vector2}
      var positionArray = []; // {Array.<Vector2>}

      var stepCounter = 0; // our step counter

      var dilatedBounds = this.bounds.dilated( SUPER_MAX_EPSILON_DISTANCE );

      // is our starting position matching the position of a charge.
      var isPositionOnCharge = (this.getClosestChargedParticlePosition( currentPosition ).equals( currentPosition ));//  {boolean}

      // the order of the parenthesis is crucial here..
      while ( !isPositionOnCharge && ( stepCounter < MIN_STEPS ||
                                       (stepCounter < MAX_STEPS &&
                                        dilatedBounds.containsPoint( currentPosition )))
        ) {
        nextPosition = this.getNextPositionAlongElectricFieldWithRK4( currentPosition, epsilonDistance );
        currentPosition = nextPosition;
        positionArray.push( currentPosition );

        // after three steps starts monitoring the curvature of the path and change
        // the epsilonDistance accordingly
        if ( stepCounter > 3 ) {
          // adaptative epsilon distance
          epsilonDistance = this.getAdaptativeEpsilonDistance( epsilonDistance, positionArray, isSearchingBackward );
        }
        // however, if the current position is outside the dilated bounds, then it's pedal to metal
        if ( !dilatedBounds.containsPoint( currentPosition ) ) {
          epsilonDistance = sign * SUPER_MAX_EPSILON_DISTANCE;
        }

        var closestChargedParticlePosition = this.getClosestChargedParticlePosition( currentPosition );
        var closestChargeDistance = closestChargedParticlePosition.distance( currentPosition );

        // if the current position is getting close to a charge, slow down, you don't want to over shoot it.
        if ( closestChargeDistance < Math.abs( 2 * epsilonDistance ) ) {
          epsilonDistance = sign * MIN_EPSILON_DISTANCE;
        }

        // if the current position is very close to a charge, call it quits
        if ( closestChargeDistance < MIN_EPSILON_DISTANCE ) {
          positionArray.push( closestChargedParticlePosition );
          isPositionOnCharge = true;
        }

        stepCounter++;
      }// end of while()

      return positionArray;

    },

    /**
     * Function that determines the location of the closest charge to a given position.
     * @private
     * @param {Vector2} position
     * @returns {Vector2}
     */
    getClosestChargedParticlePosition: function( position ) {
      var closestChargedParticlePosition; // {Vector2}
      var closestDistance = Number.POSITIVE_INFINITY;
      assert && assert( this.chargedParticles.length > 0, ' the chargedParticles array must contain at least one element' );
      this.chargedParticles.forEach( function( chargedParticle ) {
        var distance = chargedParticle.position.distance( position );
        if ( closestDistance > distance ) {
          closestChargedParticlePosition = chargedParticle.position;
          closestDistance = distance;
        }
      } );
      return closestChargedParticlePosition;
    },

    /**
     * Function that returns the an updated epsilonDistance based on the three last points
     * of positionArray
     * @private
     * @param {number} epsilonDistance
     * @param {Array.<Vector2>} positionArray
     * @param {boolean} isSearchingBackward
     * @returns {number}
     */
    getAdaptativeEpsilonDistance: function( epsilonDistance, positionArray, isSearchingBackward ) {
      var deflectionAngle = this.getRotationAngle( positionArray ); // non negative number in radians
      if ( deflectionAngle === 0 ) {

        // pedal to metal
        epsilonDistance = MAX_EPSILON_DISTANCE;
      }
      else {

        // shorten the epsilon distance in tight turns, longer steps in straighter stretch
        // 360 implies that a perfect circle could be generated by 360 points, i.e. a rotation of 1 degree doesn't change epsilonDistance.
        epsilonDistance *= (2 * Math.PI / 360) / deflectionAngle;

        // clamp the value of epsilonDistance to be within this range
        epsilonDistance = dot.clamp( Math.abs( epsilonDistance ), MIN_EPSILON_DISTANCE, MAX_EPSILON_DISTANCE );
      }

      epsilonDistance = isSearchingBackward ? -epsilonDistance : epsilonDistance;
      return epsilonDistance;
    },

    /**
     * Function that returns the rotation angle between the three last points of a position array
     *
     * @private
     * @param {Array.<Vector2>} positionArray
     * @returns {number}
     */
    getRotationAngle: function( positionArray ) {
      assert && assert( positionArray.length > 2, 'the positionArray must contain at least three elements' );
      var length = positionArray.length;
      var newDeltaPosition = positionArray[ length - 1 ].minus( positionArray[ length - 2 ] );
      var oldDeltaPosition = positionArray[ length - 2 ].minus( positionArray[ length - 3 ] );
      return newDeltaPosition.angleBetween( oldDeltaPosition ); // a positive number
    },

    /**
     * Function that prunes points from a positionArray. The goal of this method is to
     * speed up the laying out the line by passing to scenery the minimal number of points
     * in the position array while being visually equivalent.
     * For instance this method would remove the middle point of three consecutive collinear points.
     * More generally, if the middle point is a distance less than maxOffset of the line connecting the two
     * neighboring points, then it is removed.
     *
     * @private
     * @param {Array.<Vector2>} positionArray
     * @returns {Array.<Vector2>}
     */
    getPrunedPositionArray: function( positionArray ) {
      var length = positionArray.length;
      var prunedPositionArray = []; //{Array.<Vector2>}

      // push first data point
      prunedPositionArray.push( positionArray[ 0 ] );

      var maxOffset = 0.001; // in model coordinates,  the threshold of visual acuity when rendered on the screen
      var lastPushedIndex = 0; // index of the last positionArray element pushed into prunedPosition

      for ( var i = 1; i < length - 1; i++ ) {
        var lastPushedPoint = prunedPositionArray[ prunedPositionArray.length - 1 ];

        for ( var j = lastPushedIndex; j < i + 1; j++ ) {
          var distance = this.getDistanceFromLine( lastPushedPoint, positionArray[ j + 1 ], positionArray[ i + 1 ] );
          if ( distance > maxOffset || (i - j > 10) ) {
            prunedPositionArray.push( positionArray[ i ] );
            lastPushedIndex = i;
            break; // breaks out of the inner for loop
          }
        }
      }

      // push last data point
      prunedPositionArray.push( positionArray[ length - 1 ] );
      return prunedPositionArray;
    },

    /**
     * Function that returns the smallest distance between the midwayPoint and
     * a straight line that would connect initialPoint and finalPoint.
     * see http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
     * @private
     * @param {Vector2} initialPoint
     * @param {Vector2} midwayPoint
     * @param {Vector2} finalPoint
     * @returns {number}
     */
    getDistanceFromLine: function( initialPoint, midwayPoint, finalPoint ) {
      var midwayDisplacement = midwayPoint.minus( initialPoint );
      var finalDisplacement = finalPoint.minus( initialPoint );
      var distance = Math.abs( midwayDisplacement.crossScalar( finalDisplacement.normalized() ) );
      return distance;
    },

    /**
     * Function that returns the shape of the electric field line. The line
     * is a directed line with arrows.
     * @public read-only
     * @param {Object} [options]
     * @returns {Shape}
     */
    getShape: function( options ) {

      options = _.extend( {
        arrowHeadLength: 0.05,// length of the arrow head in model coordinates
        arrowHeadInternalAngle: Math.PI * 6 / 8, // half the internal angle (in radians) at the tip of the arrow head
        numberOfSegmentsPerArrow: 10 // number of segment intervals between arrows
      }, options );

      // draw the electricField line shape
      var shape = new Shape();

      var positionArray = this.getPrunedPositionArray( this.positionArray ); //{Array.<Vector2>}
      var arrayLength = positionArray.length; // {number}

      shape.moveToPoint( positionArray [ 0 ] );

      for ( var arrayIndex = 1; arrayIndex < arrayLength; arrayIndex++ ) {
        var isArrowSegment = ( arrayIndex % options.numberOfSegmentsPerArrow === Math.floor( options.numberOfSegmentsPerArrow / 2 ) );  // modulo value is arbitrary, just not zero since it will start on a positive charge

        if ( isArrowSegment ) {
          var angle = positionArray[ arrayIndex ].minus( shape.getRelativePoint() ).angle(); // angle of the electric field at location 'position'
          // shape of an arrow head (triangle)
          shape = this.appendArrow( shape, angle, options );
        } // end of  if (isArrowSegment)

        shape.lineToPoint( positionArray[ arrayIndex ] );
      }
      return shape;
    },

    /**
     * Appends an arrow head shape to an existing shape. The arrow head is rotated with an angle
     * 'angle' with respect to the positive x -axis
     * @private
     * @param {Shape} shape
     * @param {number} angle - in radians
     * @param {Object} [options]
     * @returns {Shape}
     */
    appendArrow: function( shape, angle, options ) {
      options = _.extend( {
        arrowHeadLength: 0.05,// length of the arrow head in model coordinates
        arrowHeadInternalAngle: Math.PI * 6 / 8 // half the internal angle (in radians) at the tip of the arrow head
      }, options );

      shape
        .lineToPointRelative( {
          x: options.arrowHeadLength * Math.cos( angle + options.arrowHeadInternalAngle ),
          y: options.arrowHeadLength * Math.sin( angle + options.arrowHeadInternalAngle )
        } )
        .lineToPointRelative( {
          x: 2 * options.arrowHeadLength * Math.sin( options.arrowHeadInternalAngle ) * Math.sin( angle ),
          y: -2 * options.arrowHeadLength * Math.sin( options.arrowHeadInternalAngle ) * Math.cos( angle )
        } )
        .lineToPointRelative( {
          x: -options.arrowHeadLength * Math.cos( angle - options.arrowHeadInternalAngle ),
          y: -options.arrowHeadLength * Math.sin( angle - options.arrowHeadInternalAngle )
        } );
      return shape;
    }

  } );
} );


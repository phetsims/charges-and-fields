// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric potential line
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // modules
  var dot = require( 'DOT/dot' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Vector2} position
   * @param {Bounds2} bounds - if an equipotential line is not closed, it will terminate outside these bounds
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - array of active ChargedParticles
   * @param {Function} getElectricPotential -
   * @param {Function} getElectricField
   * @param {Property.<boolean>} isPlayAreaChargedProperty
   * @constructor
   */
  function ElectricPotentialLine( position,
                                  bounds,
                                  chargedParticles,
                                  getElectricPotential,
                                  getElectricField,
                                  isPlayAreaChargedProperty ) {


    this.getElectricPotential = getElectricPotential; // @private
    this.getElectricField = getElectricField; // @private
    this.chargedParticles = chargedParticles; // @private
    this.bounds = bounds; // @private
    this.isPlayAreaChargedProperty = isPlayAreaChargedProperty;

    this.position = position;
    this.electricPotential = getElectricPotential( position ); // {number}

    // calculate the array of positions
    this.positionArray = this.getEquipotentialPositionArray( position );

    // determine if there is an electric potential line
    this.isLinePresent = (this.positionArray !== null); // {boolean}

  }

  return inherit( Object, ElectricPotentialLine, {

    /**
     * getNextPositionAlongEquipotential gives the next position (within a distance deltaDistance) with the same electric Potential
     * as the initial position.  If delta epsilon is positive, it gives as the next position, a point that is pointing (approximately) 90 degrees
     * to the left of the electric field (counterclockwise) whereas if deltaDistance is negative the next position is 90 degrees to the right of the
     * electric Field.
     *
     * The algorithm works best for small epsilon.
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance
     * @returns {Vector2} next point along the electricPotential line
     */
    getNextPositionAlongEquipotential: function ( position, deltaDistance ) {
      var initialElectricPotential = this.getElectricPotential( position );
      return this.getNextPositionAlongEquipotentialWithElectricPotential.call( this, position, initialElectricPotential, deltaDistance );
    },

    /**
     * Given an (initial) position, find a position with the targeted electric potential within a distance 'deltaDistance'
     * @private
     * @param {Vector2} position
     * @param {number} electricPotential
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithElectricPotential: function ( position, electricPotential, deltaDistance ) {
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
      var electricPotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var midwayPosition = ( electricPotentialNormalizedVector.multiplyScalar( deltaDistance ) ).add( position ); // {Vector2}
      var midwayElectricField = this.getElectricField( midwayPosition ); // {Vector2}
      assert && assert( midwayElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: midway Electric Field ' );
      var midwayElectricPotential = this.getElectricPotential( midwayPosition ); //  {number}
      var deltaElectricPotential = midwayElectricPotential - electricPotential; // {number}
      var deltaPosition = midwayElectricField.multiplyScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared() ); // {Vector2}
      assert && assert( deltaPosition.magnitude() < Math.abs( deltaDistance ), 'the second order correction is larger than the first' );
      // if 'the second order correction is larger than the first'
      if ( deltaPosition.magnitude() > Math.abs( deltaDistance ) ) {
        // use a fail safe method
        return this.getNextPositionAlongEquipotentialWithMidPoint( position, deltaDistance );
      }
      else {
        return midwayPosition.add( deltaPosition ); // {Vector2} finalPosition
      }
    },

    /**
     * Given an (initial) position, find a position with the targeted electric potential within a distance deltaDistance
     * This uses a standard midpoint algorithm
     * http://en.wikipedia.org/wiki/Midpoint_method
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithMidPoint: function ( position, deltaDistance ) {
      var initialElectricField = this.getElectricField( position ); // {Vector2}
      assert && assert( initialElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
      var initialEquipotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var midwayPosition = ( initialEquipotentialNormalizedVector.multiplyScalar( deltaDistance / 2 ) ).add( position ); // {Vector2}
      var midwayElectricField = this.getElectricField( midwayPosition ); // {Vector2}
      assert && assert( midwayElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: midway Electric Field ' );
      var midwayEquipotentialNormalizedVector = midwayElectricField.normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var deltaPosition = midwayEquipotentialNormalizedVector.multiplyScalar( deltaDistance ); // {Vector2}
      return deltaPosition.add( position ); // {Vector2} finalPosition
    },

    /**
     * Given an (initial) position, find a position with the same (ideally) electric potential within a distance deltaDistance
     * of the initial position.
     *
     * This uses a standard RK4 algorithm generalized to 2D
     * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithRK4: function ( position, deltaDistance ) {
      var initialElectricField = this.getElectricField( position ); // {Vector2}
      assert && assert( initialElectricField.magnitude() !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
      var k1Vector = this.getElectricField( position ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var k2Vector = this.getElectricField( position.plus( k1Vector.timesScalar( deltaDistance / 2 ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var k3Vector = this.getElectricField( position.plus( k2Vector.timesScalar( deltaDistance / 2 ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var k4Vector = this.getElectricField( position.plus( k3Vector.timesScalar( deltaDistance ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
      var deltaDisplacement =
      {
        x: deltaDistance * (k1Vector.x + 2 * k2Vector.x + 2 * k3Vector.x + k4Vector.x) / 6,
        y: deltaDistance * (k1Vector.y + 2 * k2Vector.y + 2 * k3Vector.y + k4Vector.y) / 6
      };
      return position.plus( deltaDisplacement ); // {Vector2} finalPosition
    },

    /**
     * This method returns an array of points (vectors) with the same electric potential as the electric potential
     * at the initial position. The array is ordered with position points going counterclockwise.
     * @private
     * @param {Vector2} position - initial position
     * @returns {Array.<Vector2>|| null} a series of positions with the same electric Potential as the initial position
     */
    getEquipotentialPositionArray: function ( position ) {
      if ( !this.isPlayAreaChargedProperty.value ) {
        // if there are no charges, don't bother to find the electricPotential line
        return null;
      }
      /*
       General Idea of this algorithm

       The electricPotential line is found using two searches. Starting from an initial point, we find the electric field at
       this position and define the point to the left of the electric field as the counterclockwise point, whereas the point that is
       90 degree right of the electric field is the clockwise point. The points are stored in a counterclockwise and clockwise array.
       The search of the clockwise and counterclockwise points done concurrently. The search stops if (1) the number of
       searching steps exceeds a large number and (2) either the clockwise or counterClockwise point is very far away from the origin.
       A third condition to bailout of the search is that the clockwise and counterClockwise position are very close to one another
       in which case we have a closed electricPotential line. Note that if the conditions (1) and (2) are fulfilled the electricPotential line
       is not going to be a closed line but this is so far away from the screenview that the end user will simply see the line going
       beyond the screen.

       After the search is done, the function returns an array of points ordered in a counterclockwise direction, i.e. after
       joining all the points, the directed line would be made of points that have an electric field
       pointing clockwise (yes  clockwise) to the direction of the line.
       */
      var stepCounter = 0; // {number} integer
      var stepMax = 500; // {number} integer, the product of stepMax and epsilonDistance should be larger than maxDistance
      var maxEpsilonDistance = 0.50; // {number} step length along electricPotential in meters
      var minEpsilonDistance = 0.05; // {number} step length along electricPotential in meters
      this.isLineClosed = false; // {boolean}
      var maxDistance = Math.max( this.bounds.width, this.bounds.height ); //maximum distance from the center
      //assert && assert( stepMax * epsilonDistance > maxDistance, 'the length of the "path" should be larger than the linear size of the screen ' );
      var nextClockwisePosition; // {Vector2}
      var nextCounterClockwisePosition; // {Vector2}
      var currentClockwisePosition = position; // {Vector2}
      var currentCounterClockwisePosition = position; // {Vector2}
      var clockwisePositionArray = [];
      var counterClockwisePositionArray = [];


      // return a null array if the initial point for the electricPotential line is too close to a charged particle
      // see https://github.com/phetsims/charges-and-fields/issues/5
      var closestDistance = 0.1;
      var isSafeDistance = true;
      this.chargedParticles.forEach( function ( chargedParticle ) {
        isSafeDistance = isSafeDistance && (chargedParticle.position.distance( position ) > closestDistance);
      } );

      if ( !isSafeDistance ) {
        return null;
      }
      else {

        // electric potential associated with the position
        //var initialElectricPotential = this.getElectricPotential( position ); // {number} in volts
        var clockwiseEpsilonDistance = Math.sqrt( minEpsilonDistance * maxEpsilonDistance );
        var counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
        while ( (stepCounter < stepMax ) && (!this.isLineClosed) &&
                ( this.bounds.containsPoint( currentClockwisePosition ) ||
                  this.bounds.containsPoint( currentCounterClockwisePosition ) ) ) {

          //nextClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
          //  currentClockwisePosition,
          //  initialElectricPotential,
          //  epsilonDistance );
          //nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
          //  currentCounterClockwisePosition,
          //  initialElectricPotential,
          //  -epsilonDistance );


          nextClockwisePosition = this.getNextPositionAlongEquipotentialWithRK4(
            currentClockwisePosition,
            clockwiseEpsilonDistance );
          nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithRK4(
            currentCounterClockwisePosition,
            counterClockwiseEpsilonDistance );

          clockwisePositionArray.push( nextClockwisePosition );
          counterClockwisePositionArray.push( nextCounterClockwisePosition );

          if ( clockwisePositionArray.length > 3 ) {
            clockwiseEpsilonDistance *= Math.PI / (20 * this.getRotationAngle( clockwisePositionArray ));
            clockwiseEpsilonDistance = dot.clamp( clockwiseEpsilonDistance, minEpsilonDistance, maxEpsilonDistance );
          }
          if ( counterClockwisePositionArray.length > 3 ) {
            counterClockwiseEpsilonDistance *= Math.PI / (20 * this.getRotationAngle( counterClockwisePositionArray ));
            counterClockwiseEpsilonDistance = dot.clamp( counterClockwiseEpsilonDistance, -1 * maxEpsilonDistance, -1 * minEpsilonDistance );
          }

          if ( clockwisePositionArray.length > 3 ) {
            var approachDistance = nextClockwisePosition.distance( nextCounterClockwisePosition );
            if ( approachDistance < clockwiseEpsilonDistance + Math.abs( counterClockwiseEpsilonDistance ) ) {
              clockwiseEpsilonDistance = approachDistance / 3;
              counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
              if ( nextClockwisePosition.distance( nextCounterClockwisePosition ) < 2 * minEpsilonDistance ) {
                // if the clockwise and counterclockwise points are close,
                this.isLineClosed = true;
              }
            }
          }

          currentClockwisePosition = nextClockwisePosition;
          currentCounterClockwisePosition = nextCounterClockwisePosition;

          stepCounter++;

        }// end of while()

        //if ( !this.isLineClosed && ( this.bounds.containsPoint( currentClockwisePosition ) ||
        //                             this.bounds.containsPoint( currentCounterClockwisePosition ) ) ) {
        //  console.log( 'an electricPotential line terminates on the screen' );
        //  // rather than plotting an unphysical electricPotential line, returns null
        //  return null;
        //}

        // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
        var reversedArray = clockwisePositionArray.reverse();

        // lets returned the entire array , i.e. the reversed clockwise array, the initial position, and the counterclockwise array
        return reversedArray.concat( position, counterClockwisePositionArray );
      }
    },

    /**
     *
     * @private
     * @param {Array.<Vector2>} positionArray
     * @returns {number}
     */
    getRotationAngle: function ( positionArray ) {
      var length = positionArray.length;
      var newDeltaPosition = positionArray[ length - 1 ].minus( positionArray[ length - 2 ] );
      var oldDeltaPosition = positionArray[ length - 2 ].minus( positionArray[ length - 3 ] );
      return newDeltaPosition.angleBetween( oldDeltaPosition );
    },

    /**
     * Returns the Shape of the electric potential line
     * @public
     * @returns {Shape}
     */
    getShape: function () {

      var shape = new Shape();
      return this.positionArrayToCardinalSpline( shape, this.positionArray,
        {isClosedLineSegments: this.isLineClosed}
      );
    },

    /**
     * Function that returns a weighted vector
     * @private
     * @param {Vector2} beforeVector
     * @param {Vector2} currentVector
     * @param {Vector2} afterVector
     * @param {Object} [options]
     * @returns {Vector2}
     */
    getWeightedVector: function ( beforeVector, currentVector, afterVector, options ) {
      options = _.extend( {
        // the ‘tension’ parameter controls how smoothly the curve turns through its
        // control points. For a Catmull-Rom curve the tension is zero.
        // the tension should range from -1 to 1
        tension: 0
      }, options );

      var workingVector = new Vector2();
      workingVector.add( afterVector ).subtract( beforeVector );
      workingVector.multiplyScalar( (1 - options.tension) / 6 );
      workingVector.add( currentVector );
      return workingVector;
    },

    /**
     *
     * This is a convenience function that allows to generate Cardinal splines
     * from a position array. Cardinal spline differs from Bezier curves in that all
     * defined points on a Cardinal spline are on the path itself.
     *
     * It include a 'tension' parameter to allow the client to specify how tightly
     * the path interpolates between points. One can think of the tension as the tension in
     * a rubber band around pegs. however unlike a rubber band the tension can be negative.
     * the tension ranges from -1 to 1.
     * @private
     * @param {Shape} shape
     * @param {Array.<Vector2>} positionArray
     * @param {Object} [options]
     * @returns {Shape}
     */
    positionArrayToCardinalSpline: function ( shape, positionArray, options ) {
      options = _.extend( {
        // the ‘tension’ parameter controls how smoothly the curve turns through its
        // control points. For a Catmull-Rom curve the tension is zero.
        // the tension should range from -1 to 1
        tension: 0,

        // is the resulting shape forming a close path
        isClosedLineSegments: false,

        // is this part of another shape, it should link to
        //TODO
        isSubPath: false
      }, options );


      var cardinalPoints = []; // {Array.<Vector2>} cardinal points Array
      var bezierPoints = []; // {Array.<Vector2>} bezier points Array

      // if the line is open, there is one less segment than point vectors
      var segmentNumber = (options.isClosedLineSegments) ? positionArray.length : positionArray.length - 1;

      for ( var i = 0; i < segmentNumber; i++ ) {
        cardinalPoints = [];
        if ( i === 0 && !options.isClosedLineSegments ) {
          cardinalPoints.push(
            positionArray[ 0 ],
            positionArray[ 0 ],
            positionArray[ 1 ],
            positionArray[ 2 ] );
        }
        else if ( (i === segmentNumber - 1) && !options.isClosedLineSegments ) {
          cardinalPoints.push(
            positionArray[ i - 1 ],
            positionArray[ i ],
            positionArray[ i + 1 ],
            positionArray[ i + 1 ] );
        }
        else {
          cardinalPoints.push(
            positionArray[ (i - 1 + segmentNumber) % segmentNumber ],
            positionArray[ (i) % segmentNumber ],
            positionArray[ (i + 1 ) % segmentNumber ],
            positionArray[ (i + 2 ) % segmentNumber ] );
        }


        // Cardinal Spline to Cubic Bezier conversion matrix
        //    0                 1             0            0
        //  (-1+tension)/6      1      (1-tension)/6       0
        //    0            (1-tension)/6      1       (-1+tension)/6
        //    0                 0             1           0

        bezierPoints = [];
        bezierPoints.push( cardinalPoints[ 1 ] );
        bezierPoints.push( this.getWeightedVector( cardinalPoints[ 0 ], cardinalPoints[ 1 ], cardinalPoints[ 2 ], options ) );
        bezierPoints.push( this.getWeightedVector( cardinalPoints[ 3 ], cardinalPoints[ 2 ], cardinalPoints[ 1 ], options ) );
        bezierPoints.push( cardinalPoints[ 2 ] );

        shape.moveToPoint( bezierPoints[ 0 ] );
        shape.cubicCurveToPoint( bezierPoints[ 1 ], bezierPoints[ 2 ], bezierPoints[ 3 ] );
      }
      return shape;
    }

  } );

} );




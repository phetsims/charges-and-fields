// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric potential line
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var dot = require( 'DOT/dot' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  // see getEquipotentialPositionArray to find how these are used
  var MAX_STEPS = 5000; // {number} integer, the maximum number of steps in the search for a closed path
  var MIN_STEPS = 1000; // {number} integer, the minimum number of steps it will do while searching for a closed path
  var MAX_EPSILON_DISTANCE = 0.10; // {number} maximum step length along electricPotential in meters
  var MIN_EPSILON_DISTANCE = 0.01; // {number} minimum step length along electricPotential in meters

  /**
   *
   * @param {Vector2} position
   * @param {Bounds2} bounds - if an equipotential line is not closed, it will terminate outside these bounds
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - array of active ChargedParticles
   * @param {Function} getElectricPotential - function that retruns a number
   * @param {Function} getElectricField - function that returns a vector
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
    this.isPlayAreaChargedProperty = isPlayAreaChargedProperty; // @private

    this.isLineClosed = false; // @private - value will be updated by  this.getEquipotentialPositionArray
    this.isEquipotentialLineTerminatingInsideBounds = true; // @private - value will be updated by this.getEquipotentialPositionArray

    // calculate the array of positions
    this.position = position; // {Vector2} @public read-only
    this.electricPotential = getElectricPotential( position ); // {number} @public read-only, value in volts
    this.positionArray = this.getEquipotentialPositionArray( position ); // @public read-only
    // this.getEquipotentialPositionArray has for side effects to update
    // this.isLineClosed, and this.isEquipotentialLineTerminatingInsideBounds

    // determine if there is an electric potential line
    // @public read-only
    this.isLinePresent = (this.positionArray !== null); // {boolean} @public read-only

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
    getNextPositionAlongEquipotential: function( position, deltaDistance ) {
      return this.getNextPositionAlongEquipotentialWithElectricPotential.call( this, position, this.electricPotential, deltaDistance );
    },

    /**
     * Given an (initial) position, find a position with the targeted electric potential within a distance 'deltaDistance'
     * This finds the next position with a precision of  ('deltaDistance')^2. There are other algorithms
     * that are more precise however, this is globally quite precise since it keeps track of the targeted electric potential
     * and therefore there is no electric potential drift over large distance. The drawback of this approach is that
     * there is no guarantee that the next position is within a delta distance from the initial point.
     * see https://github.com/phetsims/charges-and-fields/issues/5
     *
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
        return this.getNextPositionAlongEquipotentialWithRK4( position, deltaDistance );
      }
      else {
        return midwayPosition.add( deltaPosition ); // {Vector2} finalPosition
      }
    },

    /**
     * Given an (initial) position, find a position with the targeted electric potential within a distance deltaDistance
     * This uses a standard midpoint algorithm
     * This is guaranteed to be within a distance deltaDistance of the initial position.
     * Although it is locally more precise than getNextPositionAlongEquipotentialWithElectricPotential,
     * this algorithm is not symplectic and the equipotential will start to drift over many steps.
     *
     * http://en.wikipedia.org/wiki/Midpoint_method
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithMidPoint: function( position, deltaDistance ) {
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
     * of the initial position. This is locally precise to (deltaDistance)^4 and guaranteed to be within a distance deltaDistance
     * from the starting point.
     *
     * This uses a standard RK4 algorithm generalized to 2D
     * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
     * @private
     * @param {Vector2} position
     * @param {number} deltaDistance - a distance in meters, can be positive or negative
     * @returns {Vector2} finalPosition
     */
    getNextPositionAlongEquipotentialWithRK4: function( position, deltaDistance ) {
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
     * This method returns an array of points {Vector2} with the same electric potential as the electric potential
     * at the initial position. The array is ordered with position points going counterclockwise.
     *
     * This function has side effects and updates this.isEquipotentialLineTerminatingInsideBounds and
     * this.isLineClosed.
     *
     * @private
     * @param {Vector2} position - initial position
     * @returns {Array.<Vector2>|| null} a series of positions with the same electric Potential as the initial position
     */
    getEquipotentialPositionArray: function( position ) {
      if ( !this.isPlayAreaChargedProperty.value ) {
        // if there are no charges, don't bother to find the electricPotential line
        return null;
      }

      var closestChargeDistance = this.getClosestChargedParticlePosition( position ).distance( position );
      var closestDistance = 0.05; // in model coordinates, should be less than the radius of a charged particle

      if ( closestChargeDistance < closestDistance ) {
        // return a null array if the initial point for the electricPotential line is too close to a charged particle
        // see https://github.com/phetsims/charges-and-fields/issues/5
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

      var nextClockwisePosition; // {Vector2}
      var nextCounterClockwisePosition; // {Vector2}
      var currentClockwisePosition = position; // {Vector2}
      var currentCounterClockwisePosition = position; // {Vector2}
      var clockwisePositionArray = [];
      var counterClockwisePositionArray = [];

      // initial epsilon distance for the two heads.
      var clockwiseEpsilonDistance = MIN_EPSILON_DISTANCE;
      var counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;

      while ( (stepCounter < MAX_STEPS ) && !this.isLineClosed &&
              (this.isEquipotentialLineTerminatingInsideBounds || (stepCounter < MIN_STEPS ) ) ) {

        nextClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
          currentClockwisePosition,
          this.electricPotential,
          clockwiseEpsilonDistance );
        nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
          currentCounterClockwisePosition,
          this.electricPotential,
          counterClockwiseEpsilonDistance );

        clockwisePositionArray.push( nextClockwisePosition );
        counterClockwisePositionArray.push( nextCounterClockwisePosition );

        currentClockwisePosition = nextClockwisePosition;
        currentCounterClockwisePosition = nextCounterClockwisePosition;

        stepCounter++;

        // after three steps, the epsilon distance is adaptative, i.e. large distance when 'easy', small when 'difficult'
        if ( stepCounter > 3 ) {

          // adaptative epsilon distance
          clockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance( clockwiseEpsilonDistance, clockwisePositionArray, true );
          counterClockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance( counterClockwiseEpsilonDistance, counterClockwisePositionArray, false );

          assert && assert( clockwiseEpsilonDistance > 0 ); // sanity check
          assert && assert( counterClockwiseEpsilonDistance < 0 );

          // distance between the two searching heads
          var approachDistance = currentClockwisePosition.distance( currentCounterClockwisePosition );

          // logic to stop the while loop when the two heads are getting closer
          if ( approachDistance < clockwiseEpsilonDistance + Math.abs( counterClockwiseEpsilonDistance ) ) {

            // we want to perform more steps as the two head get closer but we want to avoid the two heads to pass
            // one another. Let's reduce the epsilon distance
            clockwiseEpsilonDistance = approachDistance / 3;
            counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
            if ( approachDistance < 2 * MIN_EPSILON_DISTANCE ) {

              // if the clockwise and counterclockwise points are close, set this.isLineClosed to true to get out of this while loop
              this.isLineClosed = true;
            }
          }
        } // end of if(stepCounter>3)

        // is at least one current head inside the bounds ?
        this.isEquipotentialLineTerminatingInsideBounds =
          ( this.bounds.containsPoint( currentClockwisePosition ) ||
            this.bounds.containsPoint( currentCounterClockwisePosition ) );

      }// end of while()
      console.log( 'model array', stepCounter * 2 );

      if ( !this.isLineClosed && this.isEquipotentialLineTerminatingInsideBounds ) {
        console.log( 'an electricPotential line terminates on the screen' );

        // see https://github.com/phetsims/charges-and-fields/issues/1
        // this is very difficult to come up with such a scenario. so far this
        // was encountered only with a pure quadrupole configuration.
        // let's redo the entire process but starting a tad to the right so we don't get stuck in our search
        var weeVector = new Vector2( 0.00031415, 0.00027178 ); // (pi,e)
        return this.getEquipotentialPositionArray( position.plus( weeVector ) );
      }

      // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
      var reversedArray = clockwisePositionArray.reverse();

      // lets returned the entire array , i.e. the reversed clockwise array, the initial position, and the counterclockwise array
      return reversedArray.concat( position, counterClockwisePositionArray );
    },

    /**
     * Function that prunes points from this.positionArray
     * @private
     * @returns {Array.<Vector2>}
     */
    getCleanUpPositionArray: function() {
      var length = this.positionArray.length;
      var cleanUpPositionArray = [];
      cleanUpPositionArray.push( this.positionArray[ 0 ] );
      cleanUpPositionArray.push( this.positionArray[ 1 ] );
      for ( var i = 2; i < length - 2; i++ ) {
        var cleanUpLength = cleanUpPositionArray.length;
        var newDeltaPosition = this.positionArray[ i + 1 ].minus( cleanUpPositionArray[ cleanUpLength - 1 ] );
        var oldDeltaPosition = cleanUpPositionArray[ cleanUpLength - 1 ].minus( cleanUpPositionArray[ cleanUpLength - 2 ] );
        var angle = newDeltaPosition.angleBetween( oldDeltaPosition );
        if ( angle > (2 * Math.PI / 400 ) ) {
          cleanUpPositionArray.push( this.positionArray[ i + 1 ] );
        }
      }
      console.log( 'clean length', cleanUpPositionArray.length );
      cleanUpPositionArray.push( this.positionArray[ length - 1 ] );
      return cleanUpPositionArray;
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
        if ( distance < closestDistance ) {
          closestChargedParticlePosition = chargedParticle.position;
          closestDistance = distance;
        }
      } );
      return closestChargedParticlePosition;
    },

    /**
     * Function that returns the an updated epsilonDistance based on the three last points
     * of positionArray
     *
     * @param {number} epsilonDistance
     * @param {Array.<Vector2>} positionArray
     * @param {boolean} isClockwise
     * @returns {number}
     */
    getAdaptativeEpsilonDistance: function( epsilonDistance, positionArray, isClockwise ) {
      var deflectionAngle = this.getRotationAngle( positionArray ); // non negative number in radians
      if ( deflectionAngle === 0 ) {

        // pedal to metal
        epsilonDistance = MAX_EPSILON_DISTANCE;
      }
      else {

        // shorten the epsilon distance in tight turns, longer steps in straighter stretch
        // 360 implies that a perfect circle could be generated by 360 points, i.e. a rotation of 1 degree doesn't change epsilonDistance.
        epsilonDistance *= (2 * Math.PI / 360) / deflectionAngle;
      }
      // clamp the value of epsilonDistance to be within this range
      epsilonDistance = dot.clamp( Math.abs( epsilonDistance ), MIN_EPSILON_DISTANCE, MAX_EPSILON_DISTANCE );
      epsilonDistance = isClockwise ? epsilonDistance : -epsilonDistance;
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
     * Returns the Shape of the electric potential line
     * @public read-only
     * @returns {Shape}
     */
    getShape: function() {
      assert && assert( this.isLinePresent, 'the positionArray cannot be empty' );
      var shape = new Shape();
      return this.positionArrayToStraightLine( shape, this.getCleanUpPositionArray(),
        { isClosedLineSegments: this.isLineClosed }
      );
    },

    /**
     * Function that returns an appended shape with lines between points.
     * @private
     * @param {Shape} shape
     * @param {Array.<Vector2>} positionArray
     * @param {Object} [options]
     * @returns {Shape}
     */
    positionArrayToStraightLine: function( shape, positionArray, options ) {
      options = _.extend( {
        // is the resulting shape forming a close path
        isClosedLineSegments: false
      }, options );

      // if the line is open, there is one less segment than point vectors
      var segmentNumber = (options.isClosedLineSegments) ? positionArray.length : positionArray.length - 1;

      shape.moveToPoint( positionArray[ 0 ] );
      for ( var i = 1; i < segmentNumber + 1; i++ ) {
        shape.lineToPoint( positionArray[ (i) % positionArray.length ] );
      }
      return shape;
    }

  } );

} );



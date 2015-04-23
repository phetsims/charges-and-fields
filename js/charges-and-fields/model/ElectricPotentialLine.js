// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric potential line
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );

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

    // determine if there is
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
      var epsilonDistance = 0.10; // {number} step length along electricPotential in meters
      var isLinePathClosed = false; // {boolean}
      var maxDistance = Math.max( this.bounds.width, this.bounds.height ); //maximum distance from the center
      assert && assert( stepMax * epsilonDistance > maxDistance, 'the length of the "path" should be larger than the linear size of the screen ' );
      var nextClockwisePosition; // {Vector2}
      var nextCounterClockwisePosition; // {Vector2}
      var currentClockwisePosition = position; // {Vector2}
      var currentCounterClockwisePosition = position; // {Vector2}
      var clockwisePositionArray = [];
      var counterClockwisePositionArray = [];

      // electric potential associated with the position
      //var initialElectricPotential = this.getElectricPotential( position ); // {number} in volts

      // return a null array if the initial point for the electricPotential line is too close to a charged particle
      // see https://github.com/phetsims/charges-and-fields/issues/5
      var closestDistance = 2 * epsilonDistance;
      var isSafeDistance = true;
      this.chargedParticles.forEach( function ( chargedParticle ) {
        isSafeDistance = isSafeDistance && (chargedParticle.position.distance( position ) > closestDistance);
      } );

      if ( !isSafeDistance ) {
        return null;
      }
      else {

        while ( stepCounter < stepMax &&
                this.bounds.containsPoint( currentClockwisePosition ) ||
                this.bounds.containsPoint( currentCounterClockwisePosition ) ) {

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
            epsilonDistance );
          nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithRK4(
            currentCounterClockwisePosition,
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

        if ( !isLinePathClosed && ( this.bounds.containsPoint( currentClockwisePosition ) ||
                                    this.bounds.containsPoint( currentCounterClockwisePosition ) ) ) {
          console.log( 'an electricPotential line terminates on the screen' );
          // rather than plotting an unphysical electricPotential line, returns null
          return null;
        }

        // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
        var reversedArray = clockwisePositionArray.reverse();

        // lets returned the entire array , i.e. the reversed clockwise array, the initial position, and the counterclockwise array
        return reversedArray.concat( position, counterClockwisePositionArray );
      }
    },

    getIsLineClose: function () {
      var isLinePathClosed = false; // {boolean}

    },


    /**
     * Returns the Shape of the electric potential line
     * @public
     * @returns {Shape}
     */
    getShape: function () {

      // Create the electricPotential line shape
      var shape = new Shape();

      // Draw a quadratic curve through all the point in the array
      shape.moveToPoint( this.positionArray [ 0 ] );
      var length = this.positionArray.length;

      var intermediatePoint; // {Vector2}
      var i;

      for ( i = 1; i < length - 2; i++ ) {
        intermediatePoint = (this.positionArray[ i ].plus( this.positionArray[ i + 1 ] )).divideScalar( 2 );
        shape.quadraticCurveToPoint( this.positionArray[ i ], intermediatePoint );
      }
      // curve through the last two points
      shape.quadraticCurveToPoint( this.positionArray[ i ], this.positionArray[ i + 1 ] );

      // Simple and naive method to plot lines between all the points
      //shape.moveToPoint( this.positionArray [ 0 ] );
      //this.positionArray.forEach( function( position ) {
      //  shape.lineToPoint( position );
      //} );
      return shape;
    }
  } );
} );



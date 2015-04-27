// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric field line
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // modules
  var dot = require( 'DOT/dot' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );

  // constants
  // closest approach distance to a charge in meters, should be smaller than the radius of a charge in the view
  var CLOSEST_APPROACH_DISTANCE = 0.1; // in meters, for reference the radius of the charge circle is 0.10 m

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

    this.position = position;  // @public read-only

    this.bounds = bounds;   // @private
    this.chargedParticles = chargedParticles; // @private
    this.getElectricField = getElectricField;   // @private
    this.isPlayAreaChargedProperty = isPlayAreaChargedProperty;   // @private

    // @public read-only
    this.positionArray = this.getElectricFieldPositionArray( position );

    // @public read-only
    this.isLinePresent = (this.positionArray !== null); // is there an electric Field Line

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
    getNextPositionAlongElectricFieldWithRK4: function ( position, deltaDistance ) {
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
    getNextPositionAlongElectricField: function ( position, deltaDistance ) {
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
     * @returns {Array.<Vector2>|| null}
     */
    getElectricFieldPositionArray: function ( position ) {
      /*
       Two arrays of points are generated. One is called forwardPositionArray and is made of all the points
       (excluding the initial point) that are along the electric field. The point are generated sequentially.

       A similar search process is repeated for the direction opposite to the electric field.
       Once the search process is over the two arrays are stitched together.  The resulting point array contains
       a sequence of forward ordered points, i.e. the electric field points forward to the next point.
       If no charges are present on the board, then the notion of electric field line does not exist, and the value
       null is returned
       */
      if ( !this.isPlayAreaChargedProperty.value ) {
        // if there are no charges, don't bother to find the electric field line
        return null;
      }
      else {
        var forwardPositionArray = this.getPositionArray( position, false );
        var backwardPositionArray = this.getPositionArray( position, true );

        // order all the positions (including the initial point) in an array in a forward fashion
        var reversedArray = backwardPositionArray.reverse();
        return reversedArray.concat( position, forwardPositionArray ); //  positionArray ordered
      }
    },

    /**
     * Function that determines if the position is far enough from active charges
     * @private
     * @param {Vector2} position
     * @returns {boolean}
     */
    getIsSafeDistanceFromChargedParticles: function ( position ) {
      var isSafeDistance = true;
      this.chargedParticles.forEach( function ( chargedParticle ) {
        isSafeDistance = isSafeDistance && (chargedParticle.position.distance( position ) > CLOSEST_APPROACH_DISTANCE);
      } );
      return isSafeDistance;
    },

    /**
     * Function that determines the location of the closest charge to a given position.
     * @private
     * @param {Vector2} position
     * @returns {Vector2}
     */
    getClosestChargedParticlePosition: function ( position ) {
      var closestChargedParticlePosition; // {Vector2}
      var closestDistance = Number.POSITIVE_INFINITY;
      this.chargedParticles.forEach( function ( chargedParticle ) {
        var distance = chargedParticle.position.distance( position );
        if ( distance < closestDistance ) {
          closestChargedParticlePosition = chargedParticle.position;
          closestDistance = distance;
        }
      } );
      return closestChargedParticlePosition;
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
    getPositionArray: function ( position, isSearchingBackward ) {

      // the product of stepMax and epsilonDistance should exceed the width and height of the model bounds
      var maxSteps = 20000; // an integer, the maximum number of steps in the algorithm
      var minSteps = 5000; // an integer, the maximum number of steps in the algorithm
      var minEpsilonDistance = 0.02; // in meter
      var maxEpsilonDistance = 0.10;
      //assert && assert( epsilonDistance / 2 <= CLOSEST_APPROACH_DISTANCE, 'the steps are too big and you might skipped over a charge' );
      //var maxDistance = Math.max( this.bounds.height, this.bounds.width );
      //assert && assert( stepMax * epsilonDistance > maxDistance, ' there are not enough steps to cross the playArea ' );


      var epsilonDistance = minEpsilonDistance;

      var sign = 1;
      if ( isSearchingBackward ) {
        sign = -1;
      }

      var currentPosition = position;
      var nextPosition; // {Vector2}
      var positionArray = [];

      var stepCounter = 0; // our step counter

      var isOnCharge = false;

      // find the position array
      while ( !isOnCharge && ((
                              stepCounter < maxSteps &&
                              this.bounds.containsPoint( currentPosition )
                              )
                              ||
                              stepCounter < minSteps
      )
        ) {
        nextPosition = this.getNextPositionAlongElectricFieldWithRK4( currentPosition, sign * epsilonDistance );

        currentPosition = nextPosition;
        positionArray.push( currentPosition );

        var closestChargeDistance = this.getClosestChargedParticlePosition( currentPosition ).distance( currentPosition );

        if ( closestChargeDistance < minEpsilonDistance ) {
          isOnCharge = true;
          positionArray.push( this.getClosestChargedParticlePosition( currentPosition ) );
        }

        //
        if ( stepCounter > 3 ) {
          // adaptative epsilon distance
          epsilonDistance *= (2 * Math.PI / 360) / this.getRotationAngle( positionArray );

          epsilonDistance = dot.clamp( epsilonDistance, minEpsilonDistance, maxEpsilonDistance );
        }

        if ( !this.bounds.containsPoint( currentPosition ) ) {
          epsilonDistance = maxEpsilonDistance;
        }
        // logic to stop the while loop when the two heads are getting closer
        if ( closestChargeDistance < 4 * epsilonDistance ) {
          epsilonDistance = minEpsilonDistance;

        }


        stepCounter++;
      }// end of while()


      return positionArray;
    },

    /**
     * Method that determines if the starting point of the position array is close to an active charge
     * If this is true, this must be a positive charge.
     * It is the responsibility of the client to check that the positionArray exists in the first place
     * @public read-only
     * @returns {boolean}
     */
    getIsLineStartingNearCharge: function () {
      return !(this.getIsSafeDistanceFromChargedParticles( this.positionArray[ 0 ] ));
    }
    ,

    /**
     * Method that determines if the ending point of the position array is close to an active charge
     * If this is true, this must be a negative charge.
     * It is the responsibility of the client to check that the positionArray exists in the first place
     * @public read-only
     * @returns {boolean}
     */
    getIsLineEndingNearCharge: function () {
      var index = this.positionArray.length - 1;
      return !(this.getIsSafeDistanceFromChargedParticles( this.positionArray[ index ] ));
    }
    ,


    /**
     * Function that determines the location of the closest charge to a given position.
     * @private
     * @param {Vector2} position
     * @returns {Array.<Vector2>}
     */
    getCleanUpPositionArray: function () {
      var length = this.positionArray.length;
      var cleanUpPositionArray = [];
      cleanUpPositionArray.push( this.positionArray[ 0 ] );
      cleanUpPositionArray.push( this.positionArray[ 1 ] );
      for ( var i = 1; i < length - 2; i++ ) {
        var cleanUpLength = cleanUpPositionArray.length;
        var newDeltaPosition = this.positionArray[ i + 1 ].minus( cleanUpPositionArray[ cleanUpLength - 1 ] );
        var oldDeltaPosition = cleanUpPositionArray[ cleanUpLength - 1 ].minus( cleanUpPositionArray[ cleanUpLength - 2 ] );
        var angle = newDeltaPosition.angleBetween( oldDeltaPosition );
        if ( Math.sin( angle ) * (newDeltaPosition.magnitude()) > 0.001 ) {
          cleanUpPositionArray.push( this.positionArray[ i + 1 ] );
        }
      }
      console.log( 'clean length', cleanUpPositionArray.length );
      cleanUpPositionArray.push( this.positionArray[ length - 1 ] );
      return cleanUpPositionArray;
    }
    ,


    /**
     * Function that returns the shape of the electric field line. The line
     * is a directed line with arrows.
     * @public read-only
     * @param {Object} [options]
     * @returns {Shape}
     */
    getShape: function ( options ) {

      options = _.extend( {
        arrowHeadLength: 0.05,// length of the arrow head in model coordinates
        arrowHeadInternalAngle: Math.PI * 6 / 8, // half the internal angle (in radians) at the tip of the arrow head
        numberOfSegmentsPerArrow: 10 // number of segment intervals between arrows
      }, options );

      // draw the electricField line shape
      var shape = new Shape();

      var positionArray = this.getCleanUpPositionArray();
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
    }
    ,


    appendArrow: function ( shape, angle, options ) {
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
    ,


    /**
     *
     * This is a convenience function that allows to generate a shape
     * from a position array. Cardinal spline differs from Bezier curves in that all
     * defined points on a Cardinal spline are on the path itself.
     *
     * @private
     * @param {Shape} shape
     * @param {Array.<Vector2>} positionArray
     * @param {Object} [options]
     * @returns {Shape}
     */
    positionArrayToStraightLine: function ( shape, positionArray, options ) {
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

  } )
    ;
} )
;


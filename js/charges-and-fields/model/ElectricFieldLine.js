// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type responsible for creating an electric field line
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var K_CONSTANT = ChargesAndFieldsConstants.K_CONSTANT;

  /**
   *
   * @param {Vector2} position - starting position for the search
   * @param {Bounds2} bounds
   * @param {ObservableArray.<ChargedParticle>} chargedParticles,
   * @param {Function} getElectricPotential
   * @param {Function} getElectricField
   * @param {Property.<boolean>} isPlayAreaChargedProperty
   * @constructor
   */
  function ElectricFieldLine( position,
                              bounds,
                              chargedParticles,
                              getElectricPotential,
                              getElectricField,
                              isPlayAreaChargedProperty ) {

    this.getElectricPotential = getElectricPotential;
    this.getElectricField = getElectricField;
    this.chargedParticles = chargedParticles;
    this.enlargedBounds = bounds;
    this.isPlayAreaChargedProperty = isPlayAreaChargedProperty;

    this.position = position;
    this.positionArray = this.getElectricFieldPositionArray( position );
    this.isPresent = (this.positionArray !== null);

  }

  return inherit( Object, ElectricFieldLine, {
    /**
     * Given a (initial) position, find a position along the electric field line within a distance deltaDistance
     * This uses a standard RK4 algorithm
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
     * Starting from an initial position, this method generates a list of points that are
     * along an electric field lines. The list of points is forward (along the electric field) ordered.
     * @private
     * @param {Vector2} position
     * @returns {Array.<Vector2>|| null}
     *
     */
    getElectricFieldPositionArray: function( position ) {
      if ( !this.isPlayAreaChargedProperty.value ) {
        // if there are no charges, don't bother to find the electric field lines
        return null;
      }
      /*
       General Idea of the algorithm

       Two arrays of points are generated. One is called forwardPositionArray and is made of all the points
       (excluding the initial point) that are along the electric field. The point are generated sequentially.
       Starting from the initial point it finds the next point that points along the initial electric field.
       The search stops once (1) the number of steps exceeds some large number, (2) the current position is no longer
       within the enlarged bounds of the model, (3) the current position is very close to a charge.
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
      var epsilonDistance = 0.1; // in meter

      //var maxDistance = 3 * Math.max( WIDTH, HEIGHT ); // maximum distance from the initial position in meters

      var nextForwardPosition; // {Vector2} next position along the electric field
      var nextBackwardPosition; // {Vector2} next position opposite to the electric field direction
      var currentForwardPosition = position;
      var currentBackwardPosition = position;
      var forwardPositionArray = [];
      var backwardPositionArray = [];

      // find the positions along the electric field
      while ( stepCounter < stepMax &&
              this.enlargedBounds.containsPoint( currentForwardPosition ) &&
              this.getElectricField( currentForwardPosition ).magnitude() < maxElectricFieldMagnitude ) {
        nextForwardPosition = this.getNextPositionAlongElectricFieldWithRK4( currentForwardPosition, epsilonDistance );
        forwardPositionArray.push( nextForwardPosition );
        currentForwardPosition = nextForwardPosition;
        stepCounter++;
      }// end of while()

      // reset the counter
      stepCounter = 0;

      // find the positions opposite to the initial electric field
      while ( stepCounter < stepMax &&
              this.enlargedBounds.containsPoint( currentBackwardPosition ) &&
              this.getElectricField( currentBackwardPosition ).magnitude() < maxElectricFieldMagnitude ) {

        nextBackwardPosition = this.getNextPositionAlongElectricFieldWithRK4( currentBackwardPosition, -epsilonDistance );
        backwardPositionArray.push( nextBackwardPosition );
        currentBackwardPosition = nextBackwardPosition;
        stepCounter++;
      }// end of while()

      // order all the positions (including the initial point) in an array in a forward fashion
      var reversedArray = backwardPositionArray.reverse();

      return reversedArray.concat( position, forwardPositionArray ); //  positionArray ordered
    }


  } );
} );

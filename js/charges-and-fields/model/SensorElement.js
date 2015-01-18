// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a Sensor Element
 * Used by the Electric Sensors, the electricPotential Sensor and the electricField Grid
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Vector2} position
   * @constructor
   */
  function SensorElement( position ) {
    PropertySet.call( this, {
      // @public
      position: position,
      // @public
      electricField: new Vector2( 0, 0 ),
      // @public
      electricPotential: 0,
      //
      userControlled: false,
      //
      animating: false
    } );
  }

  return inherit( PropertySet, SensorElement, {
    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
    },
    // @public
    step: function( dt ) {
      if ( this.animating ) {
        this.animationStep( dt );
      }
    },

    /**
     * Function that displaces the position of the sensor element toward its origin Position.
     * @private
     * @param {number} dt
     */
    animationStep: function( dt ) {

      // perform any animation
      var distanceToDestination = this.position.distance( this.positionProperty.initialValue );
      if ( distanceToDestination > dt * ChargesAndFieldsConstants.ANIMATION_VELOCITY ) {
        // Move a step toward the position.
        var stepAngle = Math.atan2( this.positionProperty.initialValue.y - this.position.y, this.positionProperty.initialValue.x - this.position.x );
        var stepVector = Vector2.createPolar( ChargesAndFieldsConstants.ANIMATION_VELOCITY * dt, stepAngle );
        this.position = this.position.plus( stepVector );
      }
      else {
        // Less than one time step away, so just go to the initial position.
        this.position = this.positionProperty.initialValue;
        this.animating = false;
        this.trigger( 'returnedToOrigin' );
      }
    }
  } );
} );

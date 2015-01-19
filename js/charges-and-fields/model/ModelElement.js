// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type for a user controlled movable element. The element can return to its origin when animated.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @param {Vector2} position - initial position of the model element
   * @constructor
   */
  function ModelElement( position ) {

    PropertySet.call( this, {

      // @public
      position: position,

      // @public
      userControlled: false,

      // @public
      // Flag that indicates whether this element is animating from one location to another, should not be set externally.
      animating: false
    } );

  }

  return inherit( PropertySet, ModelElement, {
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
     * Function that displaces the position of the chargeParticle toward its origin Position.
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



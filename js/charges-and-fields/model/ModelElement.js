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
  var Vector2 = require( 'DOT/Vector2' );

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
      userControlled: false

    } );

    // @public read-only
    // Flag that indicates whether this element is animating from one location to another, should not be set externally.
    this.animating = false;

    this.destinationPosition = null; // {Vector2} the final destination when animated
  }

  return inherit( PropertySet, ModelElement, {

    /**
     * Function that animates the position of the chargeParticle toward its origin Position.
     * @public
     */
    animate: function() {
      var self = this;

      this.animating = true;

      var position = {
        x: this.position.x,
        y: this.position.y
      };

      var distanceToDestination = this.position.distance( this.destinationPosition );
      var animationTime = (distanceToDestination / ChargesAndFieldsConstants.ANIMATION_VELOCITY) * 1000; // in milliseconds

      var animationTween = new TWEEN.Tween( position ).
        to( {
          x: this.destinationPosition.x,
          y: this.destinationPosition.y
        }, animationTime ).
        easing( TWEEN.Easing.Cubic.InOut ).
        onUpdate( function() {
          self.position = new Vector2( position.x, position.y );
        } ).
        onComplete( function() {
          self.animating = false;
          self.trigger( 'returnedToOrigin' );
        } );

      animationTween.start();
    }
  } );
} );


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
      // Flag that indicates if this model element is controlled by the user
      isUserControlled: false,

      // @public
      // Flag that indicates if the model element is active or dormant
      isActive: false

    } );

    // @public read-only
    // Flag that indicates whether this element is animated from one location to another
    this.isAnimated = false;

    this.destinationPosition = null; // {Vector2} the final destination when animated
  }

  return inherit( PropertySet, ModelElement, {

    /**
     * Function that animates the position of the chargeParticle toward its origin Position.
     * @public
     */
    animate: function() {
      var self = this;

      // distance from current position to the destination position
      var distanceToDestination = this.position.distance( this.destinationPosition );

      // time to perform the animation in milliseconds, time is proportional to distance
      var animationTime = (distanceToDestination / ChargesAndFieldsConstants.ANIMATION_VELOCITY) * 1000; // in milliseconds

      // convenience variable for the Tween animation
      var position = {
        x: this.position.x,
        y: this.position.y
      };

      var animationTween = new TWEEN.Tween( position ).
        to( {
          x: this.destinationPosition.x,
          y: this.destinationPosition.y
        }, animationTime ).
        easing( TWEEN.Easing.Cubic.InOut ).
        onStart( function(){
          self.isAnimated = true;
        } ).
        onUpdate( function() {
          self.position = new Vector2( position.x, position.y );
        } ).
        onComplete( function() {
          self.isAnimated = false; // done with the animation
          self.trigger( 'returnedToOrigin' ); // model element can be removed from its observable array
        } );

      animationTween.start();
    }
  } );
} );


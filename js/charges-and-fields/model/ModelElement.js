// Copyright 2014-2015, University of Colorado Boulder

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
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   * @param {Object} [options] - PropertySet properties to be initialized
   */
  function ModelElement( tandem, options ) {

    var properties = _.extend( {

      // @public
      position: {
        value: new Vector2(),
        tandem: tandem.createTandem( 'positionProperty' ),
        phetioValueType: TVector2
      },

      // @public
      // Flag that indicates if this model element is controlled by the user
      isUserControlled: {
        value: false,
        tandem: tandem.createTandem( 'isUserControlledProperty' ),
        phetioValueType: TBoolean
      },

      // @public
      // Flag that indicates if the model element is active or dormant
      isActive: {
        value: false,
        tandem: tandem.createTandem( 'isActiveProperty' ),
        phetioValueType: TBoolean
      },

      // @public
      // If false, the user will not be able to interact with this charge at all.
      isInteractive: {
        value: true,
        tandem: tandem.createTandem( 'isInteractiveProperty' ),
        phetioValueType: TBoolean
      }
    }, options );

    PropertySet.call( this, null, null, properties );

    // @public read-only
    // Flag that indicates whether this element is animated from one location to another
    this.isAnimated = false;

    // @public
    this.initialPosition = null; // {Vector2} Where to animate the element when it is done being used.
  }

  chargesAndFields.register( 'ModelElement', ModelElement );

  return inherit( PropertySet, ModelElement, {

    /**
     * Function that animates the position of the chargeParticle toward its origin Position.
     * @public
     */
    animate: function() {
      var self = this;

      // distance from current position to the destination position
      var distanceToDestination = this.positionProperty.get().distance( this.initialPosition );

      // time to perform the animation in milliseconds, time is proportional to distance
      var animationTime = (distanceToDestination / ChargesAndFieldsConstants.ANIMATION_VELOCITY) * 1000; // in milliseconds

      // convenience variable for the Tween animation
      var position = {
        x: this.positionProperty.get().x,
        y: this.positionProperty.get().y
      };

      var animationTween = new TWEEN.Tween( position ).to( {
        x: this.initialPosition.x,
        y: this.initialPosition.y
      }, animationTime ).easing( TWEEN.Easing.Cubic.InOut ).onStart( function() {
        self.isAnimated = true;
      } ).onUpdate( function() {
        self.positionProperty.set( new Vector2( position.x, position.y ) );
      } ).onComplete( function() {
        self.isAnimated = false; // done with the animation
        self.trigger( 'returnedToOrigin' ); // model element can be removed from its observable array
      } );

      animationTween.start( phet.joist.elapsedTime );
    }
  } );
} );


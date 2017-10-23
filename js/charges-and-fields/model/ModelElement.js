// Copyright 2014-2017, University of Colorado Boulder

/**
 * Type for a user controlled movable element. The element can return to its origin when animated.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var TVector2 = require( 'DOT/TVector2' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function ModelElement( tandem ) {

    // @public {Property.<Vector2>}
    this.positionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2,
      useDeepEquality: true // see https://github.com/phetsims/charges-and-fields/issues/132
    } );

    // @public {Property.<boolean>}
    // Flag that indicates if this model element is controlled by the user
    this.isUserControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isUserControlledProperty' )
    } );

    // @public {Property.<boolean>}
    // Flag that indicates if the model element is active or dormant
    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
    } );

    // @public {Property.<boolean>}
    // If false, the user will not be able to interact with this charge at all.
    this.isInteractiveProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isInteractiveProperty' )
    } );

    // @public (read-only) {Tween|null} - Tween that is animating the particle back to its home in the toolbox, or null
    // if not animating.  Public access is only for checking existence, not for manipulating or reading the tween attributes
    this.animationTween = null;

    // @public
    this.initialPosition = null; // {Vector2} Where to animate the element when it is done being used.

    this.disposeEmitter = new Emitter();

    // @public
    this.returnedToOriginEmitter = new Emitter();
  }

  chargesAndFields.register( 'ModelElement', ModelElement );

  return inherit( Object, ModelElement, {

    dispose: function() {
      this.disposeEmitter.emit();
      this.isInteractiveProperty.dispose();
      this.isUserControlledProperty.dispose();
      this.isActiveProperty.dispose();
      this.positionProperty.dispose();

      // Cancel animation (if any) so it doesn't try to update a disposed ModelElement
      this.animationTween && this.animationTween.stop();
    },

    /**
     * Function that animates the position of the chargeParticle toward its origin Position.
     * @public
     */
    animate: function() {

      assert && assert( this.animationTween === null, 'cannot start animating while already animating' );
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

      this.animationTween = new TWEEN.Tween( position ).to( {
        x: this.initialPosition.x,
        y: this.initialPosition.y
      }, animationTime ).easing( TWEEN.Easing.Cubic.InOut ).onUpdate( function() {
        self.positionProperty.set( new Vector2( position.x, position.y ) );
      } ).onComplete( function() {
        self.animationTween = null; // done with the animation
        self.returnedToOriginEmitter.emit(); // model element can be removed from its observable array
      } );

      this.animationTween.start( phet.joist.elapsedTime );
    }
  } );
} );


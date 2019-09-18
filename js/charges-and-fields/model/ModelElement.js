// Copyright 2014-2019, University of Colorado Boulder

/**
 * Type for a user controlled movable element. The element can return to its origin when animated.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const Emitter = require( 'AXON/Emitter' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class ModelElement extends PhetioObject {

    /**
     * @param {Object} options
     */
    constructor( options ) {

      options = _.extend( {

        // {Vector2|null} Where to animate the element when it is done being used. This can be passed in when
        // ModelElements' state is set with PhET-iO, see ModelElementIO
        initialPosition: null,
        phetioType: ModelElementIO
      }, options );
      super( options );

      const tandem = options.tandem;// required

      // @public
      this.positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
        tandem: tandem.createTandem( 'positionProperty' ),
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
      this.initialPosition = options.initialPosition; // {Vector2|null} Where to animate the element when it is done being used.

      this.disposeEmitter = new Emitter();

      // @public
      this.returnedToOriginEmitter = new Emitter();
    }

    dispose() {
      this.disposeEmitter.emit();
      this.isInteractiveProperty.dispose();
      this.isUserControlledProperty.dispose();
      this.isActiveProperty.dispose();
      this.positionProperty.dispose();

      // Cancel animation (if any) so it doesn't try to update a disposed ModelElement
      this.animationTween && this.animationTween.stop();
      super.dispose();
    }

    /**
     * Function that animates the position of the chargeParticle toward its origin Position.
     * @public
     */
    animate() {

      assert && assert( this.animationTween === null, 'cannot start animating while already animating' );

      // distance from current position to the destination position
      const distanceToDestination = this.positionProperty.get().distance( this.initialPosition );

      // time to perform the animation in milliseconds, time is proportional to distance
      const animationTime = ( distanceToDestination / ChargesAndFieldsConstants.ANIMATION_VELOCITY ) * 1000; // in milliseconds

      // convenience variable for the Tween animation
      const position = {
        x: this.positionProperty.get().x,
        y: this.positionProperty.get().y
      };

      this.animationTween = new TWEEN.Tween( position ).to( {
        x: this.initialPosition.x,
        y: this.initialPosition.y
      }, animationTime ).easing( TWEEN.Easing.Cubic.InOut ).onUpdate( () => {
        this.positionProperty.set( new Vector2( position.x, position.y ) );
      } ).onComplete( () => {
        this.animationTween = null; // done with the animation
        this.returnedToOriginEmitter.emit(); // model element can be removed from its observable array
      } );

      this.animationTween.start( phet.joist.elapsedTime );
    }
  }

  return chargesAndFields.register( 'ModelElement', ModelElement );
} );
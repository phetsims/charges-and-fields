// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type for a user controlled movable element. The element can return to its origin when animated.
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const NullableIOVector2IO = NullableIO( Vector2IO );

class ModelElement extends PhetioObject {

  /**
   * @param {Vector2} initialPosition - Where to animate the element when it is done being used.
   * @param {Object} [options]
   */
  constructor( initialPosition, options ) {

    options = merge( {

      phetioType: ModelElement.ModelElementIO
    }, options );
    super( options );

    assert && assert( initialPosition instanceof Vector2 );

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

    // @public {Vector2} Where to animate the element when it is done being used.
    this.initialPosition = initialPosition;

    this.disposeEmitter = new Emitter();

    // @public
    this.returnedToOriginEmitter = new Emitter();
  }

  /**
   * Releases references
   * @public
   */
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

  /**
   * @public
   * @returns {Object}
   * @override
   */
  toStateObject() {
    return {
      initialPosition: NullableIOVector2IO.toStateObject( this.initialPosition )
    };
  }

  // @private
  static fromStateObject( stateObject ) {
    return {
      initialPosition: NullableIOVector2IO.fromStateObject( stateObject.initialPosition )
    };
  }

  /**
   * @param {Object} stateObject
   * @public
   */
  applyState( stateObject ) {
    const s = ModelElement.fromStateObject( stateObject );
    this.initialPosition = s.initialPosition;
  }

  /**
   * @public
   * @override
   * @param {Object} stateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( stateObject ) {
    return [ NullableIOVector2IO.fromStateObject( stateObject.initialPosition ) ];
  }
}

ModelElement.ModelElementIO = PhetioObject.createIOType( ModelElement, 'ModelElementIO', ObjectIO, {
  documentation: 'A Model Element'
} );

chargesAndFields.register( 'ModelElement', ModelElement );
export default ModelElement;
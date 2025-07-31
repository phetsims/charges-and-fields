// Copyright 2014-2025, University of Colorado Boulder

/**
 * Type for a user controlled movable element. The element can return to its origin when animated.
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const NullableIOVector2IO = NullableIO( Vector2.Vector2IO );

/* global TWEEN */

type SelfOptions = EmptySelfOptions;

type ModelElementOptions = SelfOptions & PhetioObjectOptions;

class ModelElement extends PhetioObject {

  public static ModelElementIO: IOType<ModelElement, IntentionalAny>;

  public readonly positionProperty: Vector2Property;

  // Flag that indicates if this model element is controlled by the user
  public readonly isUserControlledProperty: BooleanProperty;

  // Flag that indicates if the model element is active or dormant
  public readonly isActiveProperty: BooleanProperty;

  // If false, the user will not be able to interact with this charge at all.
  public readonly isInteractiveProperty: BooleanProperty;

  // Tween that is animating the particle back to its home in the toolbox, or null
  // if not animating.  Public access is only for checking existence, not for manipulating or reading the tween attributes
  public animationTween: IntentionalAny | null;

  // Where to animate the element when it is done being used.
  public readonly initialPosition: Vector2;

  public readonly returnedToOriginEmitter: Emitter;

  /**
   * @param initialPosition - Where to animate the element when it is done being used.
   * @param providedOptions - Options for the ModelElement, see ModelElementOptions.
   */
  public constructor( initialPosition: Vector2, providedOptions?: ModelElementOptions ) {

    const options = optionize<ModelElementOptions, SelfOptions, PhetioObjectOptions>()( {
      phetioType: ModelElement.ModelElementIO
    }, providedOptions );
    super( options );

    const tandem = options.tandem;// required

    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      valueComparisonStrategy: 'equalsFunction' // see https://github.com/phetsims/charges-and-fields/issues/132
    } );

    this.isUserControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isUserControlledProperty' )
    } );

    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
    } );

    this.isInteractiveProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isInteractiveProperty' )
    } );

    this.animationTween = null;

    this.initialPosition = initialPosition;

    this.returnedToOriginEmitter = new Emitter();
  }

  /**
   * Releases references
   */
  public override dispose(): void {
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
   */
  public animate(): void {

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

ModelElement.ModelElementIO = new IOType<ModelElement, IntentionalAny>( 'ModelElementIO', {
  valueType: ModelElement,
  documentation: 'A Model Element',
  toStateObject: ( modelElement: ModelElement ) => ( {
    initialPosition: NullableIOVector2IO.toStateObject( modelElement.initialPosition )
  } ),
  stateSchema: {
    initialPosition: NullableIOVector2IO
  },
  stateObjectToCreateElementArguments: ( stateObject: IntentionalAny ) => [ NullableIOVector2IO.fromStateObject( stateObject.initialPosition ) ]
} );

chargesAndFields.register( 'ModelElement', ModelElement );
export default ModelElement;
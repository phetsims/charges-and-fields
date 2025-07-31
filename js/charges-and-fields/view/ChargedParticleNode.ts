// Copyright 2014-2025, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargedParticle from '../model/ChargedParticle.js';
import ChargedParticleRepresentationNode from './ChargedParticleRepresentationNode.js';

// constants
const CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

class ChargedParticleNode extends ChargedParticleRepresentationNode {

  // The model element
  public readonly modelElement: ChargedParticle;

  // The drag listener for this node
  private readonly dragListener: DragListener;

  // Function to dispose this node
  private readonly disposeChargedParticleNode: () => void;

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param chargedParticle
   * @param snapToGridLines
   * @param modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param availableModelBoundsProperty - dragBounds for the charged particle
   * @param enclosureBounds - bounds in the model coordinate frame of the charge and sensor enclosure
   * @param tandem
   */
  public constructor( chargedParticle: ChargedParticle,
                      snapToGridLines: ( positionProperty: Vector2Property ) => void,
                      modelViewTransform: ModelViewTransform2,
                      availableModelBoundsProperty: Property<Bounds2>,
                      enclosureBounds: Bounds2,
                      tandem: Tandem ) {

    super( chargedParticle.charge, {
      tandem: tandem,
      phetioDynamicElement: true,
      phetioType: Node.NodeIO
    } );

    this.modelElement = chargedParticle;

    // Set up the mouse areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 10 );

    // Register for synchronization with model.
    const positionListener = ( position: Vector2 ) => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    };
    chargedParticle.positionProperty.link( positionListener );

    this.dragListener = new DragListener( {
      applyOffset: false,
      positionProperty: chargedParticle.positionProperty,
      tandem: tandem.createTandem( 'dragListener' ),
      dragBoundsProperty: availableModelBoundsProperty,
      transform: modelViewTransform,
      canStartPress: () => !chargedParticle.animationTween,
      offsetPosition: ( point, listener ) => {
        return listener.pointer && listener.pointer.isTouchLike() ? new Vector2( 0, -2 * CIRCLE_RADIUS ) : Vector2.ZERO;
      },
      start: () => {
        // Move the chargedParticle to the front of this layer when grabbed by the user.
        this.moveToFront();
      },
      end: () => {
        snapToGridLines( chargedParticle.positionProperty );

        if ( !enclosureBounds.containsPoint( chargedParticle.positionProperty.get() ) ) {
          chargedParticle.isActiveProperty.set( true );
        }
      }
    } );
    this.dragListener.isUserControlledProperty.link( ( controlled: boolean ) => {
      chargedParticle.isUserControlledProperty.value = controlled;
    } );

    // Conditionally hook up the input handling (and cursor) when the charged particle is interactive.
    let isDragListenerAttached = false;

    const isInteractiveListener = () => {

      const isInteractive = chargedParticle.isInteractiveProperty.get();

      if ( isDragListenerAttached !== isInteractive ) {
        if ( isInteractive ) {
          this.cursor = 'pointer';
          this.addInputListener( this.dragListener );
        }
        else {
          this.cursor = null;
          this.removeInputListener( this.dragListener );
        }

        isDragListenerAttached = isInteractive;
      }
    };
    chargedParticle.isInteractiveProperty.link( isInteractiveListener );

    this.disposeChargedParticleNode = () => {
      chargedParticle.positionProperty.unlink( positionListener );
      chargedParticle.isInteractiveProperty.unlink( isInteractiveListener );
      this.dragListener.dispose();
    };
  }

  /**
   * Releases references
   */
  public override dispose(): void {
    this.disposeChargedParticleNode();
    super.dispose();
  }
}

chargesAndFields.register( 'ChargedParticleNode', ChargedParticleNode );
export default ChargedParticleNode;
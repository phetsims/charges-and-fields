// Copyright 2014-2019, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const Touch = require( 'SCENERY/input/Touch' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

  class ChargedParticleNode extends ChargedParticleRepresentationNode {

    /**
     * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
     * @param {ChargedParticle} chargedParticle - the model of the charged particle
     * @param {function} snapToGridLines - function( {Property.<Vector2>})
     * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
     * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
     * @param {Bounds2} enclosureBounds - bounds in the model coordinate frame of the charge and sensor enclosure
     * @param {Tandem} tandem
     */
    constructor( chargedParticle,
                 snapToGridLines,
                 modelViewTransform,
                 availableModelBoundsProperty,
                 enclosureBounds,
                 tandem ) {

      super( chargedParticle.charge, { tandem: tandem } );

      this.modelElement = chargedParticle;

      // Set up the mouse areas for this node so that this can still be grabbed when invisible.
      this.touchArea = this.localBounds.dilated( 10 );

      // Register for synchronization with model.
      const positionListener = position => {
        this.translation = modelViewTransform.modelToViewPosition( position );
      };
      chargedParticle.positionProperty.link( positionListener );

      this.movableDragHandler = new DragListener( {
        applyOffset: false,
        locationProperty: chargedParticle.positionProperty,
        tandem: tandem.createTandem( 'dragListener' ),
        dragBoundsProperty: availableModelBoundsProperty,
        transform: modelViewTransform,
        canStartPress: function() { return !chargedParticle.animationTween; },
        offsetLocation: ( point, listener ) => {
          return listener.pointer instanceof Touch ? new Vector2( 0, -2 * CIRCLE_RADIUS ) : Vector2.ZERO;
        },
        start: ( event, listener ) => {
          // Move the chargedParticle to the front of this layer when grabbed by the user.
          this.moveToFront();
        },
        end: ( event, listener ) => {
          snapToGridLines( chargedParticle.positionProperty );

          if ( !enclosureBounds.containsPoint( chargedParticle.positionProperty.get() ) ) {
            chargedParticle.isActiveProperty.set( true );
          }
        }
      } );
      this.movableDragHandler.isUserControlledProperty.link( function( controlled ) {
        chargedParticle.isUserControlledProperty.value = controlled;
      } );

      // Conditionally hook up the input handling (and cursor) when the charged particle is interactive.
      let isDragListenerAttached = false;

      const isInteractiveListener = () => {

        const isInteractive = chargedParticle.isInteractiveProperty.get();

        if ( isDragListenerAttached !== isInteractive ) {
          if ( isInteractive ) {
            this.cursor = 'pointer';
            this.addInputListener( this.movableDragHandler );
          }
          else {
            this.cursor = null;
            this.removeInputListener( this.movableDragHandler );
          }

          isDragListenerAttached = isInteractive;
        }
      };
      chargedParticle.isInteractiveProperty.link( isInteractiveListener );

      this.disposeChargedParticleNode = function() {
        chargedParticle.positionProperty.unlink( positionListener );
        chargedParticle.isInteractiveProperty.unlink( isInteractiveListener );
        this.movableDragHandler.dispose();
      };
    }

    dispose() {
      this.disposeChargedParticleNode();
      super.dispose();
    }
  }

  return chargesAndFields.register( 'ChargedParticleNode', ChargedParticleNode );
} );
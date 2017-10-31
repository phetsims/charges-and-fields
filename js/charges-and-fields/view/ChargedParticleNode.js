// Copyright 2014-2017, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {function} snapToGridLines - function( {Property.<Vector2>})
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
   * @param {Bounds2} enclosureBounds - bounds in the model coordinate frame of the charge and sensor enclosure
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargedParticleNode( chargedParticle,
                                snapToGridLines,
                                modelViewTransform,
                                availableModelBoundsProperty,
                                enclosureBounds,
                                tandem ) {

    var self = this;

    this.modelElement = chargedParticle;

    ChargedParticleRepresentationNode.call( this, chargedParticle.charge );

    // Set up the mouse areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 10 );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      self.translation = modelViewTransform.modelToViewPosition( position );
    };
    chargedParticle.positionProperty.link( positionListener );

    this.movableDragHandler = new DragListener( {
      applyOffset: false,
      targetNode: this,
      locationProperty: chargedParticle.positionProperty,
      tandem: tandem.createTandem( 'movableDragHandler' ),
      dragBounds: availableModelBoundsProperty.get(),
      transform: modelViewTransform,
      canStartPress: function() { return !chargedParticle.animationTween; },
      isUserControlledProperty: chargedParticle.isUserControlledProperty,
      offsetLocation: function( point, listener ) {
        return listener.pointer.isTouch ? new Vector2( 0, -2 * CIRCLE_RADIUS ) : Vector2.ZERO;
      },
      start: function( event, listener ) {
        // Move the chargedParticle to the front of this layer when grabbed by the user.
        self.moveToFront();
      },
      end: function( event, listener ) {
        snapToGridLines( chargedParticle.positionProperty );

        if ( !enclosureBounds.containsPoint( chargedParticle.positionProperty.get() ) ) {
          chargedParticle.isActiveProperty.set( true );
        }
      }
    } );

    // readjust the dragBounds of the movable drag handler when the screen is resized
    var dragBoundsListener = self.movableDragHandler.setDragBounds.bind( self.movableDragHandler );
    availableModelBoundsProperty.link( dragBoundsListener );

    // Conditionally hook up the input handling (and cursor) when the charged particle is interactive.
    var isDragListenerAttached = false;

    var isInteractiveListener = function() {

      var isInteractive = chargedParticle.isInteractiveProperty.get();

      if ( isDragListenerAttached !== isInteractive ) {
        if ( isInteractive ) {
          self.cursor = 'pointer';
          self.addInputListener( self.movableDragHandler );
        }
        else {
          self.cursor = null;
          self.removeInputListener( self.movableDragHandler );
        }

        isDragListenerAttached = isInteractive;
      }
    };
    chargedParticle.isInteractiveProperty.link( isInteractiveListener );

    this.disposeChargedParticleNode = function() {
      availableModelBoundsProperty.unlink( dragBoundsListener );
      chargedParticle.positionProperty.unlink( positionListener );
      chargedParticle.isInteractiveProperty.unlink( isInteractiveListener );
      this.movableDragHandler.dispose();
    };

    // tandem support
    this.mutate( {
      tandem: tandem
    } );
  }

  chargesAndFields.register( 'ChargedParticleNode', ChargedParticleNode );

  return inherit( ChargedParticleRepresentationNode, ChargedParticleNode, {
    dispose: function() {
      this.disposeChargedParticleNode();
      ChargedParticleRepresentationNode.prototype.dispose.call( this );
    }

  } );
} );
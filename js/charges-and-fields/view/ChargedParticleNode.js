// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
   * @constructor
   */
  function ChargedParticleNode( chargedParticle, modelViewTransform, availableModelBoundsProperty ) {

    var chargedParticleNode = this;

    ChargedParticleRepresentationNode.call( this, chargedParticle.charge );

    // Set up the mouse areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilated( 10 );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    chargedParticle.positionProperty.link( positionListener );

    var movableDragHandler = new MovableDragHandler(
      chargedParticle.positionProperty,
      {
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {
          if ( !chargedParticle.isAnimated ) // you can't drag an animated particle
          {
            chargedParticle.isUserControlledProperty.set( true );

            // Move the chargedParticle to the front of this layer when grabbed by the user.
            chargedParticleNode.moveToFront();
            var globalPoint = chargedParticleNode.globalToParentPoint( event.pointer.point );

            // move this node upward so that the cursor touches the bottom of the chargedParticle
            chargedParticle.position = modelViewTransform.viewToModelPosition( globalPoint.addXY( 0, -CIRCLE_RADIUS ) );
          }
        },

        endDrag: function( event ) {
          chargedParticle.isUserControlledProperty.set( false );
        }
      } );

    // readjust the dragBounds of the movable drag handler when the screen is resized
    var availableModelBoundsPropertyListener = function( bounds ) {
      movableDragHandler.setDragBounds( bounds );
    };

    availableModelBoundsProperty.link( availableModelBoundsPropertyListener );

    // When dragging, move the charge
    chargedParticleNode.addInputListener( movableDragHandler );

    this.disposeChargedParticleNode = function() {
      availableModelBoundsProperty.unlink( availableModelBoundsPropertyListener );
      chargedParticle.positionProperty.unlink( positionListener );
    };
  }

  return inherit( ChargedParticleRepresentationNode, ChargedParticleNode, {
    dispose: function() {
      this.disposeChargedParticleNode();
    }

  } );
} );
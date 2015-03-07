// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargedParticleRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Bounds2} availableModelBounds - dragBounds for the charged particle
   * @constructor
   */
  function ChargedParticleNode( chargedParticle, modelViewTransform, availableModelBounds ) {

    var chargedParticleNode = this;

    ChargedParticleRepresentation.call( this, chargedParticle.charge );

    // Set up the mouse  areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );

    // Move the chargedParticle to the front of this layer when grabbed by the user.
    this.userControlledListener = function( userControlled ) {
      if ( userControlled ) {
        chargedParticleNode.moveToFront();
      }
    };
    chargedParticle.userControlledProperty.link( this.userControlledListener );

    // Register for synchronization with model.
    this.positionListener = function( position ) {
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    chargedParticle.positionProperty.link( this.positionListener );

    // When dragging, move the charge
    chargedParticleNode.addInputListener( new MovableDragHandler(
      chargedParticle.positionProperty,
      {
        dragBounds: availableModelBounds,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {
          chargedParticle.userControlled = true;
          var globalPoint = chargedParticleNode.globalToParentPoint( event.pointer.point );
          // move this node upward so that the cursor touches the bottom of the chargedParticle
          chargedParticle.position = modelViewTransform.viewToModelPosition( globalPoint.addXY( 0, -CIRCLE_RADIUS ) );
        },

        endDrag: function( event ) {
          chargedParticle.userControlled = false;
        }
      } ) );

    this.userControlledProperty = chargedParticle.userControlledProperty;
    this.positionProperty = chargedParticle.positionProperty;
  }

  return inherit( ChargedParticleRepresentation, ChargedParticleNode, {
    dispose: function() {
      this.userControlledProperty.unlink( this.userControlledListener );
      this.positionProperty.unlink( this.positionListener );
    }

  } );
} );
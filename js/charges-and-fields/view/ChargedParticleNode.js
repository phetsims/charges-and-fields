// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules

  var ChargedParticleRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ChargedParticleNode( chargedParticle, modelViewTransform ) {

    var chargedParticleNode = this;

    ChargedParticleRepresentation.call( this, chargedParticle.charge );

    // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );

    // Move the chargedParticle to the front of this layer when grabbed by the user.
    chargedParticle.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {
        chargedParticleNode.moveToFront();
      }
    } );

    // Register for synchronization with model.
    chargedParticle.positionProperty.link( function( position, oldPosition ) {
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // When dragging, move the charge
    chargedParticleNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,
        start: function( event, trail ) {
          chargedParticle.userControlled = true;
        },
        // Translate on drag events
        translate: function( args ) {
          chargedParticle.position = modelViewTransform.viewToModelPosition( args.position );

        },
        end: function( event, trail ) {
          chargedParticle.userControlled = false;
        }
      } ) );
  }

  return inherit( ChargedParticleRepresentation, ChargedParticleNode );
} );
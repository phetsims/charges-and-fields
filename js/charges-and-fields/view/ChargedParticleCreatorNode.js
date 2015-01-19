// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create new charged Particles in the model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ChargedParticleRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @param {Function} addChargedParticleToModel - A function for adding the created chargedParticle to the model
   * @param {number} charge - acceptable values are 1 or -1
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function ChargedParticleCreatorNode( addChargedParticleToModel, charge, modelViewTransform, options ) {

    ChargedParticleRepresentation.call( this, charge );

    var self = this;

    // Add the listener that will allow the user to click on this and create a new chargedParticle, then position it in the model.
    this.addInputListener( new SimpleDragHandler( {

      parentScreen: null, // needed for coordinate transforms
      chargedParticle: null,

      // Allow moving a finger (touch) across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {
        // Find the parent screen by moving up the scene graph.
        var testNode = self;
        while ( testNode !== null ) {
          if ( testNode instanceof ScreenView ) {
            this.parentScreen = testNode;
            break;
          }
          testNode = testNode.parents[0]; // Move up the scene graph by one level
        }

        // Determine the initial position of the new element as a function of the event position and this node's bounds.
        var centerPositionGlobal = self.parentToGlobalPoint( self.center );
        var initialPositionOffset = centerPositionGlobal.minus( event.pointer.point );
        var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point.plus( initialPositionOffset ) );

        // Create and add the new model element.
        var initialModelPosition = modelViewTransform.viewToModelPosition( initialPosition );
        this.chargedParticle = new ChargedParticle( initialModelPosition, charge );
        this.chargedParticle.userControlled = true;
        addChargedParticleToModel( this.chargedParticle );

      },

      translate: function( translationParams ) {
        this.chargedParticle.position = this.chargedParticle.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function( event, trail ) {
        this.chargedParticle.userControlled = false;
        this.chargedParticle = null;
      }
    } ) );

    // Pass options through to parent.
    this.mutate( options );
  }

  return inherit( ChargedParticleRepresentation, ChargedParticleCreatorNode );
} );
/*
 * Copyright 2002-2014, University of Colorado Boulder
 */

/**
 * A Scenery node that can be clicked upon to create new  chargedParticles in the model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );


  // constants
  var CIRCLE_RADIUS = 10; // radius of charged particles.

  /**
   * @param {Function} addChargedParticleToModel - A function for adding the created chargedParticle to the model
   * @param {Object} [options]
   * @constructor
   */

  function ChargedParticleCreatorNode( addChargedParticleToModel, charge, modelViewTransform, options ) {
    Node.call( this, {
      renderer: 'svg', rendererOptions: {cssTransform: true},
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );
    var self = this;

    // Create the node that the user will click upon to add a model element to the view.
    // Add the centered circle

    var chargeColor;

    // determine the color of the charged Particle based on its charge: blue positive
    chargeColor = (charge !== 1) ? 'rgb(0,0,150)' : 'rgb(150,0,0)';

    var circle = new Circle( CIRCLE_RADIUS, {
      stroke: 'black',
      fill: new RadialGradient( -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, 0, -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, CIRCLE_RADIUS * 1.6 )
        .addColorStop( 0, 'white' )
        .addColorStop( 1, chargeColor ), centerX: 0, centerY: 0
    } );

    self.addChild( circle );

    // create and add shape for the circle based on the charge of the particle
    var ratio = 0.5; //
    if ( charge === 1 ) {
      // plus Shape representing the positive charges
      var plusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 )
        .moveTo( 0, -CIRCLE_RADIUS * ratio )
        .lineTo( 0, CIRCLE_RADIUS * ratio );
      self.addChild( new Path( plusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'} ) );
    }
    else {
      // minus Shape representing the negative charges
      var minusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 );
      self.addChild( new Path( minusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'} ) );
    }

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
        this.chargedParticle = new ChargedParticle( modelViewTransform.viewToModelPosition( initialPosition ), charge );
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

  return inherit( Node, ChargedParticleCreatorNode );
} );
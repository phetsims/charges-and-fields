// Copyright 2002-2013, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules

  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var CIRCLE_RADIUS = 10; // radius of charged particles.

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {model} model of the simulation
   * @param {ChargedParticle} chargedParticle : the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ChargedParticleNode( model, chargedParticle, modelViewTransform ) {

    var chargedParticleNode = this;

    Node.call( chargedParticleNode, { renderer: 'svg', rendererOptions: { cssTransform: true },
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Add the centered circle

    var chargeColor;

    // determine the color of the charged Particle based on its charge: blue positive
    chargeColor = (chargedParticle.charge !== 1) ? 'blue' : 'red';

    var circle = new Circle( CIRCLE_RADIUS, {
      stroke: 'black',
      fill: new RadialGradient( -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, 0, -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, CIRCLE_RADIUS * 1.6 )
        .addColorStop( 0, 'white' )
        .addColorStop( 1, chargeColor ), centerX: 0, centerY: 0 } );

    chargedParticleNode.addChild( circle );

    // create and add shape for the circle based on the charge of the particle
    var ratio = 0.5; //
    if ( chargedParticle.charge === 1 ) {
      // plus Shape representing the positive charges
      var plusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 )
        .moveTo( 0, -CIRCLE_RADIUS * ratio )
        .lineTo( 0, CIRCLE_RADIUS * ratio );
      chargedParticleNode.addChild( new Path( plusShape, { centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white' } ) );
    }
    else {
      // minus Shape representing the negative charges
      var minusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 );
      chargedParticleNode.addChild( new Path( minusShape, { centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white' } ) );
    }

    // Register for synchronization with model.
    chargedParticle.positionProperty.link( function( position, oldPosition ) {

      chargedParticleNode.moveToFront();
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );

      model.clearEquipotentialLines = true;
      model.clearElectricFieldLines = true;

      var charge = chargedParticle.charge;

      model.electricFieldSensors.forEach( function( sensorElement ) {
        sensorElement.electricField = model.getElectricField( sensorElement.position );
      } );

      if ( model.eFieldIsVisible === true ) {
        model.electricFieldSensorGrid.forEach( function( sensorElement ) {
          if ( oldPosition === null ) {
            sensorElement.electricField = model.getElectricField( sensorElement.position );
          }
          else {
            sensorElement.electricField = sensorElement.electricField.plus( model.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
          }
        } );
      }

      if ( model.showResolution === true ) {
        model.electricPotentialGrid.forEach( function( sensorElement ) {
          if ( oldPosition === null ) {
            sensorElement.electricPotential = model.getElectricPotential( sensorElement.position );
          }
          else {
            sensorElement.electricPotential += model.getElectricPotentialChange( sensorElement.position, position, oldPosition, charge );
          }
        } );
      }
      model.electricPotentialSensor.electricPotential = model.getElectricPotential( model.electricPotentialSensor.position );

    } );

    // When dragging, move the charge
    chargedParticleNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events
        translate: function( args ) {
          chargedParticle.position = modelViewTransform.viewToModelPosition( args.position );
        }
      } ) );

  }

  return inherit( Node, ChargedParticleNode );
} );
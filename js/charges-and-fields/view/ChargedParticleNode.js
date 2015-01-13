// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules

  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS;// radius of charged particles.

  /**
   * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @param {ChargedParticle} chargedParticle - the model of the charged particle
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ChargedParticleNode( model, chargedParticle, modelViewTransform ) {

    var chargedParticleNode = this;

    Node.call( chargedParticleNode, {
      renderer: 'svg', rendererOptions: {cssTransform: true},
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );
    this.mouseArea = this.localBounds.dilatedXY( 10, 10 );

    // Add the centered circle

    var chargeColor;

    // determine the color of the charged Particle based on its charge: blue positive
    chargeColor = (chargedParticle.charge !== 1) ? 'blue' : 'red';

    var circle = new Circle( CIRCLE_RADIUS, {
      stroke: 'black',
      fill: chargeColor
    } );

    chargedParticleNode.addChild( circle );

    // create and add shape for the circle based on the charge of the particle
    var ratio = 0.5; //
    if ( chargedParticle.charge === 1 ) {
      // plus Shape representing the positive charges
      var plusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 )
        .moveTo( 0, -CIRCLE_RADIUS * ratio )
        .lineTo( 0, CIRCLE_RADIUS * ratio );
      chargedParticleNode.addChild( new Path( plusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'} ) );
    }
    else {
      // minus Shape representing the negative charges
      var minusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 );
      chargedParticleNode.addChild( new Path( minusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'} ) );
    }

    //TODO this is just a a proof of concept
    var testBounds = new Bounds2( 0, 0, 2, 2 );

    // Register for synchronization with model.
    chargedParticle.positionProperty.link( function( position, oldPosition ) {

      chargedParticleNode.moveToFront();
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );

      // remove equipotential lines and electric field lines when the position of a charged particle changes
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
        start: function( event, trail ) {
          chargedParticle.userControlled = true;
        },
        // Translate on drag events
        translate: function( args ) {
          chargedParticle.position = modelViewTransform.viewToModelPosition( args.position );
        },
        end: function( event, trail ) {
          chargedParticle.userControlled = false;
          if ( testBounds.containsPoint( chargedParticle.position ) ) {
            chargedParticle.animating = true;
          }
        }
      } ) );

  }

  return inherit( Node, ChargedParticleNode );
} );
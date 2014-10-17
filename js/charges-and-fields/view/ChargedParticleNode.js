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
   * @param {model} main model of the simulation
   * @param {ChargedParticle} the model of the charged particle
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
    var radius = 10;

    var chargeColor;
    if ( chargedParticle.charge === 1 ) { chargeColor = 'red'}
    else { chargeColor = 'blue'}

    var circle = new Circle( CIRCLE_RADIUS, {
      stroke: 'black',
      fill: new RadialGradient( -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, 0, -CIRCLE_RADIUS * 0.4, -CIRCLE_RADIUS * 0.4, CIRCLE_RADIUS * 1.6 )
        .addColorStop( 0, 'white' )
        .addColorStop( 1, chargeColor ), centerX: 0, centerY: 0 } );

    chargedParticleNode.addChild( circle );

    if ( chargedParticle.charge === 1 ) {
      var ratio = 0.5; //
      // plus Shape representing the positive charges
      var plusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 )
        .moveTo( 0, -CIRCLE_RADIUS * ratio )
        .lineTo( 0, CIRCLE_RADIUS * ratio );
      chargedParticleNode.addChild( new Path( plusShape, { centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white' } ) );
    }
    else {
      var ratio = 0.5;
      // minus Shape representing the negative charges
      var minusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 );
      chargedParticleNode.addChild( new Path( minusShape, { centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white' } ) );
    }

    // Register for synchronization with model.
    //synchronize all the other field dependent
    chargedParticle.locationProperty.link( function( position, oldPosition ) {

      model.clearEquiPotentialLines = true;

      var charge = chargedParticle.charge;
      chargedParticleNode.translation = modelViewTransform.modelToViewPosition( position );

      model.electricFieldSensors.forEach( function( sensorElement ) {
        sensorElement.electricField = model.getElectricField( sensorElement.location );
      } );

      if ( model.eFieldIsVisible === true ) {
        model.electricFieldSensorGrid.forEach( function( sensorElement ) {
          if ( oldPosition === null ) {
            sensorElement.electricField = model.getElectricField( sensorElement.location );
          }
          else {
// TODO this commented line should work but there is a bug with it.
//          sensorElement.electricField=sensorElement.electricField.plus(model.getElectricFieldChange( sensorElement.location, position, oldPosition, charge ));
            sensorElement.electricField = model.getElectricField( sensorElement.location );
          }
        } );
      }

      if ( model.showResolution === true ) {
        model.electricPotentialGrid.forEach( function( sensorElement ) {
          if ( oldPosition === null ) {
            sensorElement.electricPotential = model.getElectricPotential( sensorElement.location );
          }
          else {
            sensorElement.electricPotential += model.getElectricPotentialChange( sensorElement.location, position, oldPosition, charge );
          }
        } );
      }
      model.electricPotentialSensor.electricPotential = model.getElectricPotential( model.electricPotentialSensor.location )

    } );

    // When dragging, move the charge
    chargedParticleNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events
        translate: function( args ) {
          chargedParticle.location = modelViewTransform.viewToModelPosition( args.position );
        }
      } ) );

  }

  return inherit( Node, ChargedParticleNode );
} );
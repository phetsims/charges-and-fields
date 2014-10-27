// Copyright 2002-2013, University of Colorado Boulder

/**
 * View for the ElectricFieldSensorNode which renders the sensor as a scenery node.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules

  var ElectricPotentialSensorPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorPanel' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );


  //constants
  var CIRCLE_RADIUS = 15;

  //strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {model} model model of the simulation
   * @param {SensorElement} electricPotentialSensor model
   * @param {ModelViewTransform2} modelViewTransform the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ElectricPotentialSensorNode( model, electricPotentialSensor, modelViewTransform ) {

    var electricPotentialSensorNode = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Add the centered circle
    this.circle = new Circle( CIRCLE_RADIUS, { fill: 'green', stroke: 'black', lineWidth: 3, centerX: 0, centerY: 0 } );
    electricPotentialSensorNode.addChild( this.circle );


    // crosshair, starting from upper
    var crosshair = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    this.addChild( new Path( crosshair, { centerX: 0, centerY: 0, lineWidth: 1, stroke: 'black' } ) );

    this.electricPotentialSensorPanel = new ElectricPotentialSensorPanel( model, modelViewTransform );
    electricPotentialSensorNode.addChild( this.electricPotentialSensorPanel );
    this.electricPotentialSensorPanel.centerX = this.circle.centerX;
    this.electricPotentialSensorPanel.top = this.circle.bottom;

    // Register for synchronization with model.
    electricPotentialSensor.positionProperty.link( function( position ) {
      electricPotentialSensorNode.translation = modelViewTransform.modelToViewPosition( position );
      electricPotentialSensor.electricPotential = model.getElectricPotential( position );
    } );

    electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
      electricPotentialSensorNode.electricPotentialSensorPanel.voltageReading.text = StringUtils.format( pattern_0value_1units, electricPotential.toFixed( 1 ), voltageUnitString );
      electricPotentialSensorNode.circle.fill = model.getColorElectricPotential( electricPotentialSensor.position, electricPotential ).withAlpha( 0.5 );
    } );

    // When dragging, move the charge
    electricPotentialSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events
        translate: function( args ) {
          electricPotentialSensor.position = modelViewTransform.viewToModelPosition( args.position );
        }
      } ) );
  }

  return inherit( Node, ElectricPotentialSensorNode );
} );
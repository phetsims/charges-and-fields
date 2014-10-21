// Copyright 2002-2013, University of Colorado Boulder

/**
 * View for the electric field sensor nodes
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var MutableArrowNode = require( 'SCENERY_PHET/MutableArrowNode' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  //constants
  var RAD_TO_DEGREES = 180 / Math.PI; //convert radians to degrees
  var CIRCLE_COLOR = 'orange';
  var CIRCLE_RADIUS = 7; //in pixels
  var ARROW_COLOR = 'red';
  var LABEL_COLOR = 'brown';
  var LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );

  //strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  var angleUnit = require( 'string!CHARGES_AND_FIELDS/angleUnit' );

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {Sensor} the model of the electricFieldSensor
   * @param {ModelViewTransform2} modelViewTransform the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ElectricFieldSensorNode( model, electricFieldSensor, modelViewTransform ) {

    var electricFieldSensorNode = this;

    // Call the super constructor
    Node.call( electricFieldSensorNode, {

      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Add Arrow
    this.arrowNode = new MutableArrowNode( 0, 0, 40, 0, {
      fill: ARROW_COLOR,
      stroke: ARROW_COLOR,
      pickable: false,
      headWidth: 10} );

    electricFieldSensorNode.addChild( this.arrowNode );
    this.arrowNode.left = 0;
    this.arrowNode.centerY = 0;

    // Add the centered circle
    var circle = new Circle( CIRCLE_RADIUS, { fill: CIRCLE_COLOR, stroke: 'black', centerX: 0, centerY: 0 } );
    electricFieldSensorNode.addChild( circle );
    circle.centerX = 0;
    circle.centerY = 0;

    // Add Legend
    var fieldStrengthLabelText = StringUtils.format( pattern_0value_1units, '?', eFieldUnitString );
    this.fieldStrengthLabel = new Text( fieldStrengthLabelText, { fill: LABEL_COLOR, font: LABEL_FONT, pickable: false} );
    var directionLabelText = StringUtils.format( pattern_0value_1units, '?', angleUnit );
    this.directionLabel = new Text( fieldStrengthLabelText, { fill: LABEL_COLOR, font: LABEL_FONT, pickable: false} );
    this.fieldStrengthLabel.top = circle.bottom;
    this.directionLabel.top = this.fieldStrengthLabel.bottom;
    electricFieldSensorNode.addChild( this.fieldStrengthLabel );
    electricFieldSensorNode.addChild( this.directionLabel );

    // Register for synchronization with model.
    electricFieldSensor.positionProperty.link( function( position ) {
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
      electricFieldSensor.electricField = model.getElectricField( position );
    } );

    electricFieldSensor.electricFieldProperty.link( function( electricField ) {
      var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
      var magnitude = electricField.magnitude();
      var angle = electricFieldInView.angle(); // angle in the view

      //update strings
      var fieldMagnitudeString = magnitude.toFixed( 0 );
      electricFieldSensorNode.fieldStrengthLabel.text = StringUtils.format( pattern_0value_1units, fieldMagnitudeString, eFieldUnitString );
      var angleString = (-1 * angle * RAD_TO_DEGREES).toFixed( 0 );// the angle is expressed in the model hence the minus sign;
      electricFieldSensorNode.directionLabel.text = StringUtils.format( pattern_0value_1units, angleString, angleUnit );

      // update length and direction of the arrow
      electricFieldSensorNode.arrowNode.setTailAndTip( 0, 0, magnitude, 0 );
      electricFieldSensorNode.arrowNode.setRotation( angle );
    } );

    model.showNumbersIsVisibleProperty.link( function( isVisible ) {
      electricFieldSensorNode.fieldStrengthLabel.visible = isVisible;
      electricFieldSensorNode.directionLabel.visible = isVisible;
    } );

    // When dragging, move the charge
    electricFieldSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events and update electricField
        translate: function( args ) {
          electricFieldSensor.position = modelViewTransform.viewToModelPosition( args.position );
          electricFieldSensor.electricField = model.getElectricField( electricFieldSensor.position );
        }
      } ) );
  }

  return inherit( Node, ElectricFieldSensorNode );
} );
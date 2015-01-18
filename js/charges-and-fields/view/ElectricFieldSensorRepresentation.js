// Copyright 2002-2015, University of Colorado Boulder

/**
 *  Scenery Node for the electric field sensor node.
 *  The sensor is made of a circle and an arrow that points along the local electric field
 *  and changes its length according to the magnitude of the electric field
 *  A text label of the direction and magnitude of the local electric field is also displayed
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;
  var LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  var angleUnit = require( 'string!CHARGES_AND_FIELDS/angleUnit' );

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {SensorElement} electricFieldSensor
   * @param {Property.<boolean>} valueIsVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor, valueIsVisibleProperty ) {

    var electricFieldSensorNode = this;

    // Call the super constructor
    Node.call( electricFieldSensorNode, {
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    // Create the centered circle
    var circle = new Circle( CIRCLE_RADIUS, {
      centerX: 0,
      centerY: 0
    } );

    var circleFillColorFunction = function( color ) {
      circle.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorCircleFill', circleFillColorFunction );

    var circleStrokeColorFunction = function( color ) {
      circle.stroke = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorCircleStroke', circleStrokeColorFunction );

    // Create the E-field arrow, (set the arrow horizontally to start with)
    var arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false
    } );

    var arrowColorFunction = function( color ) {
      arrowNode.stroke = color;
      arrowNode.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorArrow', arrowColorFunction );

    // Create two numerical readouts for the strength and direction of the electric field.
    var textOptions = {
      font: LABEL_FONT,
      pickable: false
    };
    var fieldStrengthLabel = new Text( '', textOptions );
    var directionLabel = new Text( '', textOptions );

    var labelColorFunction = function( color ) {
      fieldStrengthLabel.fill = color;
      directionLabel.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorLabel', labelColorFunction );

    // Rendering order
    electricFieldSensorNode.addChild( arrowNode );
    electricFieldSensorNode.addChild( circle );
    electricFieldSensorNode.addChild( fieldStrengthLabel );
    electricFieldSensorNode.addChild( directionLabel );

    // Layout
    arrowNode.left = 0;
    arrowNode.centerY = 0;
    fieldStrengthLabel.top = circle.bottom;
    directionLabel.top = fieldStrengthLabel.bottom;

    // when the electric field changes update the arrow and the labels
    electricFieldSensor.electricFieldProperty.link( function( electricField ) {
      var magnitude = electricField.magnitude();
      var angle = electricField.angle(); // angle from the model, in radians

      // Update length and direction of the arrow
      arrowNode.setTailAndTip( 0, 0, magnitude, 0 );
      // note that the angleInView = -1 * angleInModel
      // since the vertical direction is reversed between the view and the model
      arrowNode.setRotation( -1 * angle );

      // Update the strings in the labels
      var fieldMagnitudeString = Util.toFixed( magnitude, 0 );
      fieldStrengthLabel.text = StringUtils.format( pattern_0value_1units, fieldMagnitudeString, eFieldUnitString );
      var angleString = Util.toFixed( Util.toDegrees( angle ), 0 );
      directionLabel.text = StringUtils.format( pattern_0value_1units, angleString, angleUnit );
    } );

    // Show/hide labels
    valueIsVisibleProperty.link( function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
      directionLabel.visible = isVisible;
    } );
  }

  return inherit( Node, ElectricFieldSensorNode );
} );
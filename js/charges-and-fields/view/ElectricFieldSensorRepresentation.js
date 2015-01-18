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
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;
  var LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @constructor
   */
  function ElectricFieldSensorNode() {

    var self = this;

    // Call the super constructor
    Node.call( this, {
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
    this.arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false
    } );

    var arrowColorFunction = function( color ) {
      self.arrowNode.stroke = color;
      self.arrowNode.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorArrow', arrowColorFunction );

    // Create two numerical readouts for the strength and direction of the electric field.
    var textOptions = {
      font: LABEL_FONT,
      pickable: false
    };
    this.fieldStrengthLabel = new Text( '', textOptions );
    this.directionLabel = new Text( '', textOptions );

    var labelColorFunction = function( color ) {
      self.fieldStrengthLabel.fill = color;
      self.directionLabel.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorLabel', labelColorFunction );

    // Rendering order
    this.addChild( this.arrowNode );
    this.addChild( circle );
    this.addChild( this.fieldStrengthLabel );
    this.addChild( this.directionLabel );

    // Layout
    this.arrowNode.left = 0;
    this.arrowNode.centerY = 0;
    this.fieldStrengthLabel.top = circle.bottom;
    this.directionLabel.top = this.fieldStrengthLabel.bottom;

  }

  return inherit( Node, ElectricFieldSensorNode );
} );
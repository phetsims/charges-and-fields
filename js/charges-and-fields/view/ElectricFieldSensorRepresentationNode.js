// Copyright 2015-2016, University of Colorado Boulder

/**
 *  Scenery Node for the electric field sensor.
 *  The representation of the sensor is a circle
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;

  /**
   * Constructor for the ElectricFieldSensorRepresentationNode which renders the sensor as a scenery node.
   * @constructor
   *
   * @param {Object} [options] - Passed to Node
   */
  function ElectricFieldSensorRepresentationNode( options ) {

    // Call the super constructor
    Node.call( this, options );

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

    // add circle
    this.addChild( circle );

    this.disposeEFSRN = function() {
      ChargesAndFieldsColors.unlink( 'electricFieldSensorCircleFill', circleFillColorFunction );
      ChargesAndFieldsColors.unlink( 'electricFieldSensorCircleStroke', circleStrokeColorFunction );
    };
  }

  chargesAndFields.register( 'ElectricFieldSensorRepresentationNode', ElectricFieldSensorRepresentationNode );

  return inherit( Node, ElectricFieldSensorRepresentationNode, {
    dispose: function() {
      this.disposeEFSRN();
    }
  } );
} );


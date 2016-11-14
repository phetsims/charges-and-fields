// Copyright 2015, University of Colorado Boulder

/**
 *  Scenery Node for the electric field sensor.
 *  The representation of the sensor is a circle
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
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
      centerY: 0,
      fill: ChargesAndFieldsColorProfile.electricFieldSensorCircleFillProperty,
      stroke: ChargesAndFieldsColorProfile.electricFieldSensorCircleStrokeProperty
    } );

    // add circle
    this.addChild( circle );
  }

  chargesAndFields.register( 'ElectricFieldSensorRepresentationNode', ElectricFieldSensorRepresentationNode );

  return inherit( Node, ElectricFieldSensorRepresentationNode );
} );


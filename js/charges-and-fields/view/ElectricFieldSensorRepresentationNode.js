// Copyright 2015-2017, University of Colorado Boulder

/**
 *  Scenery Node for the electric field sensor.
 *  The representation of the sensor is a circle
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );

  // constants
  const CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;

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
    const circle = new Circle( CIRCLE_RADIUS, {
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


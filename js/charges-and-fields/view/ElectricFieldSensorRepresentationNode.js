// Copyright 2015-2021, University of Colorado Boulder

/**
 * Scenery Node for the electric field sensor. The representation of the sensor is a circle.
 *
 * @author Martin Veillette (Berea College)
 */

import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import chargesAndFields from '../../chargesAndFields.js';
import chargesAndFieldsColorProfile from '../chargesAndFieldsColorProfile.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;

class ElectricFieldSensorRepresentationNode extends Node {

  /**
   * Constructor for the ElectricFieldSensorRepresentationNode which renders the sensor as a scenery node.
   *
   * @param {Object} [options] - Passed to Node
   */
  constructor( options ) {

    super( options );

    // Create the centered circle
    const circle = new Circle( CIRCLE_RADIUS, {
      centerX: 0,
      centerY: 0,
      fill: chargesAndFieldsColorProfile.electricFieldSensorCircleFillProperty,
      stroke: chargesAndFieldsColorProfile.electricFieldSensorCircleStrokeProperty
    } );

    // add circle
    this.addChild( circle );
  }
}

chargesAndFields.register( 'ElectricFieldSensorRepresentationNode', ElectricFieldSensorRepresentationNode );
export default ElectricFieldSensorRepresentationNode;
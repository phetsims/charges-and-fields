// Copyright 2015-2025, University of Colorado Boulder

/**
 * Scenery Node for the electric field sensor. The representation of the sensor is a circle.
 *
 * @author Martin Veillette (Berea College)
 */

import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS;

export default class ElectricFieldSensorRepresentationNode extends Node {

  /**
   * Constructor for the ElectricFieldSensorRepresentationNode which renders the sensor as a scenery node.
   */
  public constructor( options?: NodeOptions ) {

    super( options );

    // Create the centered circle
    const circle = new Circle( CIRCLE_RADIUS, {
      centerX: 0,
      centerY: 0,
      fill: ChargesAndFieldsColors.electricFieldSensorCircleFillProperty,
      stroke: ChargesAndFieldsColors.electricFieldSensorCircleStrokeProperty
    } );

    // add circle
    this.addChild( circle );
  }
}

chargesAndFields.register( 'ElectricFieldSensorRepresentationNode', ElectricFieldSensorRepresentationNode );
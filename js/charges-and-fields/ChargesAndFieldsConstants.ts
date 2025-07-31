// Copyright 2014-2021, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Martin Veillette (Berea College)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import chargesAndFields from '../chargesAndFields.js';

const ChargesAndFieldsConstants = {

  K_CONSTANT: 9, // prefactor in E-field equation: E= k*Q/r^2 when Q is in nano coulomb, r is in meter and E is in Volt/meter

  // width of the dev screen in the model
  WIDTH: 8, // in meters
  // nominal height of the model play area
  HEIGHT: 5, // in meters

  GRID_MAJOR_SPACING: 0.5, // in meters
  MINOR_GRIDLINES_PER_MAJOR_GRIDLINE: 5,
  ELECTRIC_FIELD_SENSOR_SPACING: 0.5, // in meters
  ELECTRIC_POTENTIAL_SENSOR_SPACING: 0.1, // in meters (for canvas fall back grid)

  // Velocity at which animated elements move
  ANIMATION_VELOCITY: 2, // In model coordinates (meters) per second

  CHARGE_RADIUS: 12, // in scenery coordinates
  ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS: 7, // in scenery coordinates
  PANEL_LINE_WIDTH: 2, // in scenery coordinates

  DEFAULT_FONT: new PhetFont( { size: 12 } ),
  VOLTAGE_LABEL_FONT: new PhetFont( { size: 14 } ), // font for the electricPotential Line voltage label
  GRID_LABEL_FONT: new PhetFont( { size: 12 } ), // font for the label that appears beneath the double arrow (length scale) on the grid
  ENCLOSURE_LABEL_FONT: new PhetFont( { size: 16 } ),  // font for the labels in the enclosure for the charges and sensors

  ELECTRIC_FIELD_SENSOR_LABEL_FONT: new PhetFont( { size: 14 } ), // font for the strength and angle of the electric field sensors
  CHECKBOX_FONT: new PhetFont( { size: 16 } ), // font for the control panel on the upper right hand side

  MAX_EFIELD_MAGNITUDE: 1e6, // V/m - maximum allowed electric field magnitude
  EFIELD_COLOR_SAT_MAGNITUDE: 5 // electricField at which color will saturate to maxColor (in Volts/meter)
};
chargesAndFields.register( 'ChargesAndFieldsConstants', ChargesAndFieldsConstants );
export default ChargesAndFieldsConstants;
// Copyright 2002-2015, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  return {

    // height of the screen in the model

    //HEIGHT: 6, //in meters
    //WIDTH: 10, //in meters
    HEIGHT: 5, //in meters
    WIDTH: 8, //in meters
    GRID_MAJOR_SPACING: 0.5, //in meters
    ELECTRIC_FIELD_SENSOR_SPACING: 0.5, //in meters
    ELECTRIC_POTENTIAL_SENSOR_SPACING: 0.1, //in meters

    // Velocity at which animated elements move
    ANIMATION_VELOCITY: 2, // In model coordinates per second

    CHARGE_RADIUS: 12, // in scenery coordinates
    ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS: 7, // in scenery coordinates
    PANEL_LINE_WIDTH: 2, // in scenery coordinates

    DEFAULT_FONT: new PhetFont( { size: 12 } ),
    VOLTAGE_LABEL_FONT: new PhetFont( { size: 14 } ), // font for the equipotential Line voltage label
    GRID_LABEL_FONT: new PhetFont( { size: 12 } ), // font for the label that appears beneath the double arrow (length scale) on the grid
    ENCLOSURE_LABEL_FONT: new PhetFont( { size: 16 } ),  // font for the labels in the enclosure for the charges and sensors

    ELECTRIC_FIELD_SENSOR_LABEL_FONT: new PhetFont( { size: 14 } ), // font for the strength and angle of the electric field sensors
    CHECK_BOX_FONT: new PhetFont( { size: 16 } ) // font for the control panel on the upper right hand side

  };
} );
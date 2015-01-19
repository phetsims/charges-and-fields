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
    HEIGHT: 5, //in meters
    WIDTH: 8, //in meters

    // Velocity at which animated elements move
    ANIMATION_VELOCITY: 2, // In model coordinates per second

    CHARGE_RADIUS: 12,
    ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS: 7,
    PANEL_LINE_WIDTH: 2,

    DEFAULT_FONT: new PhetFont( {size: 12} ),
    VOLTAGE_LABEL_FONT: new PhetFont( {size: 14} ), // font for the equipotential Line voltage label
    GRID_LABEL_FONT: new PhetFont( {size: 12} ), // font for the label that appears beneath the double arrow (length scale) on the grid
    ENCLOSURE_LABEL_FONT: new PhetFont( {size: 16} ),  // font for the labels in the enclosure for the charges and sensors

    ELECTRIC_FIELD_SENSOR_LABEL_FONT: new PhetFont( {size: 14} ), // font for the strength and angle of the electric field sensors
    CHECK_BOX_FONT: new PhetFont( {size: 16} ) // font for the control panel on the upper right hand side


  };
} );
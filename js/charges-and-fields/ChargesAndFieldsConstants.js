// Copyright 2002-2015, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  var Color = require( 'SCENERY/util/Color' );
  //var Dimension2 = require( 'DOT/Dimension2' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  return {

    // height of the screen in the model
    HEIGHT: 5, //in meters
    WIDTH: 8, //in meters

    // Velocity at which animated elements move
    ANIMATION_VELOCITY: 2, // In model coordinates per second

    CHARGE_RADIUS: 12,

    DEFAULT_FONT: new PhetFont( {size: 12} ),
    VOLTAGE_LABEL_FONT: new PhetFont( {size: 14} ), // labels for the equipotential Lines

    GRID_LABEL_FONT: new PhetFont( {size: 12} ),
    ENCLOSURE_LABEL_FONT: new PhetFont( {size: 16} ),
    ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS: 7,
    ELECTRIC_FIELD_SENSOR_LABEL_FONT: new PhetFont( {size: 14} ),
    CHECK_BOX_FONT: new PhetFont( {size: 16} ),

    PANEL_LINE_WIDTH: 2

  };
} );
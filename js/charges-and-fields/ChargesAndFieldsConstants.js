// Copyright 2002-2014, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );

  var minMass = 25;// kg
  var maxMass = 100;

  return {
    SATURATION_POSITIVE_COLOR: new Color( 'red' ),
    SATURATION_NEGATIVE_COLOR: new Color( 'blue' ),
    BACKGROUND_COLOR: new Color( '#FFFFB7' )

  };
} );
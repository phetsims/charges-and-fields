// Copyright 2015, University of Colorado Boulder

/**
 * Type responsible for creating a grid of sensor elements
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StaticSensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/StaticSensorElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Bounds2} bounds
   * @param {Bounds2} enlargedBounds
   * @param {Object} [options]
   * @constructor
   */
  function SensorGrid( bounds, enlargedBounds, options ) {

    options = _.extend( {
      spacing: 0.5, // separation (distance) in model coordinates between two adjacent sensors
      onOrigin: true // is there  a sensor at the origin (0,0)?, if false the first sensor is put at (spacing/2, spacing/2)
    }, options );

    /*
     The diagram below represents the bounds used in the model.
     The bounds defined by 'bounds' is inscribed in the lower middle portion. The origin (0,0) of the model
     is located as the center of 'bounds'. This bounds has a height of HEIGHT and width of WIDTH.
     The bounds defined by 'enlargedBounds' is represented by the largest bounds.

     In the view the viewport will always include 'bounds' and may or may not include the optional (OPT) regions
     depending on the aspect ratio. The viewport will never have access to the fallow regions.

     The sensorGridFactory generates an array of equally spaced sensors on the region defined by the
     cross. The four fallow regions are not seeded with sensors.

     ********---------------********
     *       |             |       *
     *       |             |       *
     * fallow|     OPT     |fallow *
     *       |     UP      |       *
     *       |             |       *
     |-------|------------ |-------|
     |  OPT  |             |  OPT  |
     |  LEFT |             | RIGHT |
     |       |    (0,0)    |       |
     |       |      bounds |       |
     |       |             |       |
     |-------|-------------|-------|
     *       |             |       *
     *       |             |       *
     * fallow|     OPT     |fallow *
     *       |     DOWN    |       *
     ********---------------********

     */

    Array.call( this );

    // bounds that includes OPT UP, bounds, and OPT DOWN
    var verticalBeamBounds = new Bounds2( bounds.minX, enlargedBounds.minY, bounds.maxX, enlargedBounds.maxY );

    // bounds that includes OPT LEFT, bounds, and OPT RIGHT
    var horizontalBeamBounds = new Bounds2( enlargedBounds.minX, bounds.minY, enlargedBounds.maxX, bounds.maxY );

    var spacing = options.spacing; // convenience variable
    var offset = (options.onOrigin) ? 0 : 0.5;

    // the following variables are integers or half-integers
    var minI = Math.ceil( enlargedBounds.minX / spacing ) - offset;
    var maxI = Math.floor( enlargedBounds.maxX / spacing ) + offset;
    var minJ = Math.ceil( enlargedBounds.minY / spacing ) - offset;
    var maxJ = Math.floor( enlargedBounds.maxY / spacing ) + offset;

    var vector;
    var i;
    var j;

    for ( i = minI + 1; i < maxI; i++ ) {
      for ( j = minJ + 1; j < maxJ; j++ ) {
        vector = new Vector2( i * spacing, j * spacing );
        // include the sensor element if its location is within the verticalBeam or horizontalBeam bounds;
        if ( verticalBeamBounds.containsPoint( vector ) || horizontalBeamBounds.containsPoint( vector ) ) {
          this.push( new StaticSensorElement( vector ) );
        }
      }
    }
  }

  return inherit( Array, SensorGrid );
} );
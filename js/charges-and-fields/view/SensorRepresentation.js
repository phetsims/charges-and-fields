// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node for the visual representation of the sensor.
 *
 * @author Martin Veillette
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );


  /**
   * @param {Object} [options]
   * @constructor
   */
  function SensorRepresentation( options ) {

    options = _.extend( {
      bodyWidth: 20,
      bodyHeight: 20,
      cornerRadius: 5,
      baseColor: 'blue',
      strokeColor: 'white',
      iconWidth: 20
    }, options );


    Node.call( this );

    // body
    var part1Shape = new Shape().
      moveTo( 0, 0 ).
      horizontalLineToRelative( options.bodyWidth / 2 - options.cornerRadius ).
      cubicCurveTo( options.cornerRadius, 0, options.cornerRadius, 0, options.bodyWidth / 2, options.cornerRadius ).
      verticalLineTo( options.bodyHeight - options.cornerRadius ).
      cubicCurveTo( options.cornerRadius, 0, options.cornerRadius, 0, options.bodyWidth / 2, options.cornerRadius ).
      horizontalLineToRelative( -options.bodyWidth / 2 + options.cornerRadius ).
      cubicCurveTo( options.cornerRadius, 0, options.cornerRadius, 0, options.bodyWidth / 2, options.cornerRadius ).
      verticalLineTo( options.cornerRadius ).
      cubicCurveTo( options.cornerRadius, 0, options.cornerRadius, 0, options.bodyWidth / 2, options.cornerRadius ).
      close();

    var part1Path = new Path( part1Shape, { fill: '#F4ABAA' } );

    this.addChild( part1Path );
    this.scale( options.iconWidth / this.width );

  }

  return inherit( Node, SensorRepresentation );
} );
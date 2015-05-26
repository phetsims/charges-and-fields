// Copyright 2002-2015, University of Colorado Boulder

/**
 * RectangularPushButton with a pencil icon.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PencilButton( options ) {

    options = _.extend( {
      iconWidth: 26,
      iconHeight: 20,
      baseColor: 'rgb(242, 242, 242)'
    }, options );

    // eraser
    var part1Shape = new Shape().
      moveTo( 26.685, 3.47 ).
      cubicCurveToRelative( 1.545, 1.913, 2.285, 3.701, 1.867, 4.215 ).
      cubicCurveToRelative( -0.361, 0.439, -0.939, 0.843, -0.939, 0.8431 ).
      lineToRelative( -2.674, 2.055 ).
      cubicCurveToRelative( -0.151, -0.282, -1.617, -2.99, -2.446, -4.032 ).
      cubicCurveToRelative( -0.868, -1.088, -3.375, -3.22, -3.375, -3.221 ).
      lineToRelative( -0.025, -0.032 ).
      lineToRelative( 2.829, -2.175 ).
      cubicCurveToRelative( 0, 0.001, 0.191, -0.234, 0.931, -0.364 ).
      cubicCurveTo( 23.5, 0.64, 25.14, 1.553, 26.685, 3.47 ).
      close();

    var part1Path = new Path( part1Shape, { fill: '#F4ABAA', pickable: false } );

    // metal part that hold the eraser
    var part2Shape = new Shape().
      moveTo( 24.938, 10.582 ).
      lineToRelative( -2.105, 1.617 ).
      lineToRelative( -0.002, -0.002 ).
      cubicCurveToRelative( 0, 0.001, -1.627, -3.026, -2.494, -4.123 ).
      cubicCurveToRelative( -0.797, -0.993, -2.95, -2.853, -3.325, -3.176 ).
      lineToRelative( 2.08, -1.601 ).
      lineToRelative( 0.025, 0.032 ).
      cubicCurveToRelative( 0, 0.001, 2.507, 2.132, 3.375, 3.22 ).
      cubicCurveTo( 23.321, 7.592, 24.787, 10.3, 24.938, 10.582 ).
      close();

    var part2Path = new Path( part2Shape, { fill: '#D1D3D4', pickable: false } );

    // main body of the pencil
    var part3Shape = new Shape().
      moveTo( 22.833, 12.199 ).
      lineToRelative( -10.83, 8.319 ).
      lineToRelative( -1.186, 0.275 ).
      lineToRelative( -0.001, -0.002 ).
      lineToRelative( 0.018, -1.584 ).
      lineToRelative( -2.802, -0.431 ).
      lineToRelative( -0.14, -3.24 ).
      lineToRelative( -2.36, 0.385 ).
      lineToRelative( 0.004, -1.294 ).
      verticalLineToRelative( -0.001 ).
      lineToRelative( 0.785, -1.508 ).
      lineToRelative( 10.689, -8.221 ).
      horizontalLineToRelative( 0.001 ).
      cubicCurveToRelative( 0.375, 0.323, 2.528, 2.183, 3.325, 3.176 ).
      cubicCurveToRelative( 0.867, 1.097, 2.494, 4.123, 2.494, 4.1231 ).
      lineTo( 22.833, 12.199 ).
      close();

    var part3Path = new Path( part3Shape, { fill: '#FDA720', pickable: false } );

    // triangular tip
    var part4Shape = new Shape().
      moveTo( 3.037, 19.432 ).
      lineTo( 5.169, 22.109 ).
      lineTo( 1.156, 23.044 ).
      close();

    var part4Path = new Path( part4Shape, { fill: '#231F20' } );

    // shaved wood
    var part5Shape = new Shape().
      moveTo( 10.817, 20.794 ).
      lineTo( 10.817, 20.795 ).
      lineTo( 5.17, 22.109 ).
      lineTo( 5.169, 22.109 ).
      lineTo( 3.037, 19.432 ).
      lineTo( 5.536, 14.628 ).
      lineTo( 5.532, 15.922 ).
      lineTo( 7.893, 15.537 ).
      lineTo( 8.032, 18.777 ).
      lineTo( 10.834, 19.208 ).
      lineTo( 10.816, 20.792 ).
      close();

    var part5Path = new Path( part5Shape, { fill: '#E1B89A', pickable: false } );

    // Outlines
    var lineOptions = { stroke: '#231F20', lineWidth: 0.5, miterLimit: 10, pickable: false };

    // lower body outline and eraser outline
    var part6Shape = new Shape().
      moveTo( 5.17, 22.109 ).
      lineToRelative( 5.647, -1.314 ).
      verticalLineToRelative( -0.001 ).
      lineToRelative( 1.186, -0.275 ).
      lineToRelative( 10.83, -8.319 ).
      lineToRelative( 2.105, -1.617 ).
      lineToRelative( 2.674, -2.055 ).
      cubicCurveToRelative( 0, 0.001, 0.578, -0.403, 0.939, -0.843 ).
      cubicCurveToRelative( 0.418, -0.514, -0.322, -2.302, -1.867, -4.215 ).
      cubicCurveTo( 25.14, 1.553, 23.5, 0.64, 22.852, 0.759 ).
      cubicCurveToRelative( -0.739, 0.13, -0.931, 0.365, -0.931, 0.364 ).
      lineToRelative( -2.829, 2.175 ).
      lineToRelative( -2.08, 1.601 );

    var part6Path = new Path( part6Shape, lineOptions );

    // Outline of upper shaved wood and tip
    var part7Shape = new Shape().
      moveTo( 5.536, 14.628 ).
      lineTo( 3.037, 19.432 ).
      lineTo( 1.156, 23.044 ).
      lineTo( 5.169, 22.109 );

    var part7Path = new Path( part7Shape, lineOptions );

    // Outline between eraser and metal
    var part8Shape = new Shape().
      moveTo( 19.117, 3.33 ).
      cubicCurveToRelative( 0.001, 0, 2.507, 2.132, 3.375, 3.22 ).
      cubicCurveToRelative( 0.829, 1.042, 2.295, 3.75, 2.446, 4.032 ).
      cubicCurveToRelative( 0.009, 0.016, 0.013, 0.023, 0.013, 0.0231 );

    var part8Path = new Path( part8Shape, lineOptions );

    // outline between wood and metal
    var part9Shape = new Shape().
      moveTo( 16.955, 4.852 ).
      cubicCurveToRelative( 0.001, 0, 0.02, 0.017, 0.056, 0.047 ).
      cubicCurveToRelative( 0.375, 0.323, 2.528, 2.183, 3.325, 3.176 ).
      cubicCurveToRelative( 0.867, 1.097, 2.494, 4.123, 2.494, 4.1231 );

    var part9Path = new Path( part9Shape, lineOptions );

    // Jagged outline between shaved wood and body
    var part10Shape = new Shape().
      moveTo( 10.816, 20.792 ).
      lineTo( 10.834, 19.208 ).
      lineTo( 8.032, 18.777 ).
      lineTo( 7.893, 15.537 ).
      lineTo( 5.532, 15.922 ).
      lineTo( 5.536, 14.628 ).
      lineTo( 5.535, 14.619 );
    var part10Path = new Path( part10Shape, lineOptions );

    // Outline between shaved wood and tip
    var part11Shape = new Shape().
      moveTo( 3.036, 19.43 ).
      lineTo( 5.169, 22.109 ).
      lineTo( 5.17, 22.109 );

    var part11Path = new Path( part11Shape, lineOptions );

    // upper wood outline
    var part12Shape = new Shape().
      moveTo( 17.011, 4.898 ).
      lineTo( 6.321, 13.119 ).
      lineTo( 5.536, 14.627 );

    var part12Path = new Path( part12Shape, lineOptions );

    // pencil icon
    options.content = new Node( {
      children: [ part1Path, part2Path, part3Path, part4Path, part5Path,
        part6Path, part7Path, part8Path, part9Path, part10Path, part11Path, part12Path ]
    } );

    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    RectangularPushButton.call( this, options );
  }

  return inherit( RectangularPushButton, PencilButton );
} );
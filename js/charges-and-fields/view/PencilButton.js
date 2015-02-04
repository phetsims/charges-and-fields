// Copyright 2002-2015, University of Colorado Boulder

/**
 * Button with an pencil icon.
 *
 * @author Martin Veillette
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );


  // images
  var pencilImage = require( 'image!CHARGES_AND_FIELDS/pencil.png' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PencilButton( options ) {

    options = _.extend( {
      baseColor: 'white',
      iconWidth: 20,
      iconHeight: 18
    }, options );

    // eraser
    var part1Shape = new Shape().
      moveTo( 151.991, 43.257 ).
      cubicCurveToRelative( -7.06, -7.05, -26.607, -20.176, -26.607, -20.177 ).
      lineToRelative( -0.188, -0.188 ).
      verticalLineToRelative( -0.009 ).
      lineToRelative( 18.351, -17.732 ).
      cubicCurveToRelative( 0.001, 0.001, 1.151, -1.826, 6.319, -3.343 ).
      cubicCurveToRelative( 4.513, -1.376, 16.89, 3.782, 29.426, 16.16 ).
      cubicCurveToRelative( 12.518, 12.349, 19.221, 24.454, 16.665, 28.451 ).
      cubicCurveToRelative( -2.21, 3.399, -6.002, 6.741, -6.003, 6.740 ).
      lineToRelative( -17.339, 16.749 ).
      cubicCurveTo( 171.269, 67.982, 158.694, 49.97, 151.991, 43.257 ).
      close();

    var part1Path = new Path( part1Shape, { fill: '#F4ABAA', pickable: false } );

    // metal part that hold the eraser
    var part2Shape = new Shape().
      moveTo( 137.882, 55.812 ).
      cubicCurveToRelative( -6.469, -6.395, -23.293, -17.919, -26.187, -19.886 ).
      lineToRelative( 13.501, -13.032 ).
      lineToRelative( 0.188, 0.188 ).
      cubicCurveToRelative( 0.001, 0.001, 19.548, 13.126, 26.607, 20.176 ).
      cubicCurveToRelative( 6.703, 6.713, 19.277, 24.726, 20.625, 26.654 ).
      lineToRelative( -13.669, 13.211 ).
      lineToRelative( -0.009, -0.01 ).
      cubicCurveTo( 158.938, 83.112, 144.941, 62.899, 137.882, 55.812 ).
      close();

    var part2Path = new Path( part2Shape, { fill: '#D1D3D4', pickable: false } );

    // main body of the pencil
    var part3Shape = new Shape().
      moveTo( 158.938, 83.112 ).
      lineToRelative( 0.009, 0.01 ).
      lineToRelative( -70.245, 67.857 ).
      lineToRelative( -8.202, 2.912 ).
      verticalLineToRelative( -0.01 ).
      lineToRelative( -1.16, -11.291 ).
      lineToRelative( -20.27, -0.768 ).
      lineToRelative( -3.596, -22.938 ).
      lineToRelative( -16.468, 4.644 ).
      lineToRelative( -1.021, -9.25 ).
      verticalLineToRelative( -0.009 ).
      lineToRelative( 4.344, -11.301 ).
      lineToRelative( 69.365, -67.044 ).
      cubicCurveToRelative( 2.894, 1.967, 19.718, 13.491, 26.187, 19.886 ).
      cubicCurveTo( 144.941, 62.899, 158.938, 83.112, 158.939, 83.113 ).
      close();


    var part3Path = new Path( part3Shape, { fill: '#FDA720', pickable: false } );

    // triangular tip
    var part4Shape = new Shape().
      moveTo( 13.653, 177.662 ).
      lineTo( 24.093, 150.483 ).
      lineTo( 41.413, 167.795 ).
      close();

    var part4Path = new Path( part4Shape, { fill: '#231F20' } );

    // shaved wood
    var part5Shape = new Shape().
      moveTo( 79.34, 142.591 ).
      lineTo( 80.5, 153.882 ).
      lineTo( 41.422, 167.795 ).
      lineTo( 24.093, 150.483 ).
      lineTo( 37.986, 114.279 ).
      lineTo( 39.007, 123.529 ).
      lineTo( 55.475, 118.886 ).
      lineTo( 59.07, 141.823 ).
      close();

    var part5Path = new Path( part5Shape, { fill: '#E1B89A', pickable: false } );

    var part6Shape = new Shape().
      moveTo( 41.422, 167.795 ).
      lineTo( 80.5, 153.892 ).
      lineToRelative( 8.202, -2.912 ).
      lineToRelative( 70.245, -67.857 ).
      lineToRelative( 13.669, -13.211 ).
      lineToRelative( 17.339, -16.749 ).
      cubicCurveToRelative( 0.001, 0.001, 3.792, -3.342, 6.002, -6.741 ).
      cubicCurveToRelative( 2.556, -3.997, -4.147, -16.103, -16.665, -28.451 ).
      cubicCurveTo( 166.756, 5.592, 154.379, 0.434, 149.866, 1.81 ).
      cubicCurveToRelative( -5.168, 1.517, -6.319, 3.343, -6.320, 3.344 ).
      lineToRelative( -18.351, 17.732 ).
      verticalLineToRelative( 0.009 ).
      lineToRelative( -13.501, 13.032 ).
      lineTo( 42.33, 102.97 ).
      lineToRelative( -4.344, 11.301 );

    var lineOptions = { stroke: '#231F20', lineWidth: 1.84, miterLimit: 10, pickable: false };
    var part6Path = new Path( part6Shape, lineOptions );

    var part7Shape = new Shape().
      moveTo( 37.986, 114.279 ).
      lineTo( 24.093, 150.483 ).
      lineTo( 13.653, 177.662 ).
      lineTo( 41.413, 167.795 );

    var part7Path = new Path( part7Shape, lineOptions );

    var part8Shape = new Shape().
      moveTo( 125.384, 23.081 ).
      cubicCurveToRelative( 0.001, 0.001, 19.548, 13.126, 26.607, 20.176 ).
      cubicCurveToRelative( 6.703, 6.713, 19.277, 24.726, 20.625, 26.654 ).
      cubicCurveToRelative( 0.075, 0.112, 0.112, 0.169, 0.113, 0.170 );

    var part8Path = new Path( part8Shape, lineOptions );

    var part9Shape = new Shape().
      moveTo( 111.265, 35.636 ).
      cubicCurveToRelative( 0.001, 0.001, 0.15, 0.104, 0.431, 0.29 ).
      cubicCurveToRelative( 2.894, 1.967, 19.718, 13.491, 26.187, 19.886 ).
      cubicCurveToRelative( 7.06, 7.088, 21.057, 27.301, 21.058, 27.302 );

    var part9Path = new Path( part9Shape, lineOptions );

    var part10Shape = new Shape().
      moveTo( 80.5, 153.882 ).
      lineTo( 79.34, 142.591 ).
      lineTo( 59.07, 141.823 ).
      lineTo( 55.475, 118.886 ).
      lineTo( 39.007, 123.529 ).
      lineTo( 37.986, 114.279 ).
      lineTo( 37.986, 114.271 );

    var part10Path = new Path( part10Shape, lineOptions );

    var part11Shape = new Shape().
      moveTo( 24.093, 150.483 ).
      lineTo( 41.413, 167.795 ).
      lineTo( 41.422, 167.795 ).
      lineTo( 41.432, 167.804 );

    var part11Path = new Path( part11Shape, lineOptions );

    // pencil icon
    options.content = new Node( {
      children: [ part1Path,
        part2Path, part3Path, part4Path, part5Path, part6Path, part7Path, part8Path, part9Path, part10Path, part11Path ]
    } );

    // pencil icon
    //options.content = new Image( pencilImage );
    options.useless = new Image( pencilImage );

    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    RectangularPushButton.call( this, options );
  }

  return inherit( RectangularPushButton, PencilButton );
} );
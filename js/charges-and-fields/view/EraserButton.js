// Copyright 2002-2015, University of Colorado Boulder

/**
 * Button with an eraser icon.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );

  // images
  var eraserImage = require( 'image!CHARGES_AND_FIELDS/eraser.png' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function EraserButton( options ) {

    options = _.extend( {
      baseColor: '#F2E916',
      iconWidth: 20,
      iconHeight: 18
    }, options );

    var sideLinearGradient = new LinearGradient( 204.9355, 81.1113, 108.6211, 81.1113 ).
      addColorStop( 0, '#F4ABAA' ).
      addColorStop( 0.2769, '#F1A9A8' ).
      addColorStop( 0.4948, '#E7A2A1' ).
      addColorStop( 0.6926, '#D69695' ).
      addColorStop( 0.8774, '#BF8685' ).
      addColorStop( 1, '#AB7877' );

    var frontLinearGradient = new LinearGradient( 10.3359, 131.7725, 123.8398, 131.7725 ).
      addColorStop( 0, '#F4ABAA' ).
      addColorStop( 0.2769, '#F1A9A8' ).
      addColorStop( 0.4948, '#E7A2A1' ).
      addColorStop( 0.6926, '#D69695' ).
      addColorStop( 0.8774, '#BF8685' ).
      addColorStop( 1, '#AB7877' );

    var topLinearGradient = new LinearGradient( 25.0527, 53.7559, 204.9355, 53.7559 ).
      addColorStop( 0, '#F4ABAA' ).
      addColorStop( 0.2769, '#F1A9A8' ).
      addColorStop( 0.4948, '#E7A2A1' ).
      addColorStop( 0.6926, '#D69695' ).
      addColorStop( 0.8774, '#BF8685' ).
      addColorStop( 1, '#AB7877' );

    var sideShape = new Shape().
      moveTo( 204.936, 9.342 ).
      lineTo( 123.84, 98.197 ).
      cubicCurveToRelative( -0.744, 1.15, -1.844, 6.367, -2.602, 9.109 ).
      cubicCurveToRelative( -1.328, 4.816, -2.971, 11.082, -4.285, 15.939 ).
      cubicCurveToRelative( -3.559, 12.975, -4.402, 16.746, -8.332, 29.635 ).
      cubicCurveToRelative( 24.549, -26.77, 44.41, -45.902, 68.988, -72.68 ).
      cubicCurveToRelative( 11.574, -12.604, 18.16, -21.998, 21.248, -38.574 ).
      cubicCurveTo( 200.863, 30.869, 202.865, 20.102, 204.936, 9.342 );

    var frontShape = new Shape().
      moveTo( 25.053, 98.197 ).
      cubicCurveToRelative( -6.123, 15.619, -12.066, 31.465, -14.432, 48.039 ).
      cubicCurveToRelative( -1.672, 11.811, 4.08, 15.955, 15.418, 17.27 ).
      cubicCurveToRelative( 16.354, 1.9, 33.473, 2.4, 49.883, 1.172 ).
      cubicCurveToRelative( 19.225, -1.438, 30.17, -0.93, 36.629, -20.541 ).
      cubicCurveToRelative( 3.986, -12.131, 5.029, -15.725, 6.639, -24.24 ).
      cubicCurveToRelative( 1.85, -9.889, 1.721, -15.348, 4.65, -21.699 );

    var topShape = new Shape().
      moveTo( 113.658, 11.379 ).
      cubicCurveToRelative( -3.564, 1.371, -3.564, 1.371, -8.566, 5.6 ).
      cubicCurveToRelative( -7.559, 6.395, -15.773, 15.812, -22.646, 23 ).
      cubicCurveTo( 67.098, 56.045, 51.18, 71.664, 35.555, 87.502 ).
      cubicCurveToRelative( -1.406, 1.438, -3.578, 3.451, -10.502, 10.695 ).
      horizontalLineToRelative( 98.787 ).
      lineToRelative( 81.096, -88.855 ).
      cubicCurveToRelative( -13.48, 0, -26.947, -0.035, -40.43, -0.014 ).
      cubicCurveToRelative( -10.08, 0.006, -20.184, 0.113, -30.285, 0.014 ).
      cubicCurveTo( 125.891, 9.285, 119.482, 9.113, 113.658, 11.379 ).
      close();

    var frontPath = new Path( frontShape, {
      stroke: '#231F20',
      lineWidth: 2,
      fill: frontLinearGradient
    } );

    var sidePath = new Path( sideShape, {
      stroke: '#231F20',
      lineWidth: 2,
      fill: sideLinearGradient
    } );

    var topPath = new Path( topShape, {
      stroke: '#231F20',
      lineWidth: 2,
      fill: topLinearGradient
    } );

    // eraser icon
    options.content = new Node( { children: [ sidePath, frontPath, topPath ] } );

    // eraser icon
    //options.content = new Image( eraserImage );
    options.useless = new Image( eraserImage );

    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    RectangularPushButton.call( this, options );
  }

  return inherit( RectangularPushButton, EraserButton );
} );
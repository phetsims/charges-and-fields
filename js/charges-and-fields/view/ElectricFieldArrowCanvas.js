// Copyright 2015, University of Colorado Boulder

/**
 * Contains and updates a Canvas where a canonical electric field arrow is drawn facing to the right. Contains
 * information about the scale and offset, so it's easy for clients to draw the arrow.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ElectricFieldArrowShape = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldArrowShape' );
  var Emitter = require( 'AXON/Emitter' );

  // Our shape that we'll use to draw (origin is where it will rotate)
  var arrowShape = new ElectricFieldArrowShape();
  var emitter = new Emitter();

  var scale = 1.3;
  var padding = 2;

  var scaledPaddedBounds = new Bounds2( arrowShape.bounds.minX * scale,
    arrowShape.bounds.minY * scale,
    arrowShape.bounds.maxX * scale,
    arrowShape.bounds.maxY * scale ).dilated( padding ).roundedOut();

  var canvas = document.createElement( 'canvas' );
  canvas.width = scaledPaddedBounds.width;
  canvas.height = scaledPaddedBounds.height;
  var context = canvas.getContext( '2d' );

  // Offset based on where the center is from the upper-left. Will usually be negative so it can be applied.
  // When drawing in this code, we'll want to negate it.
  var xOffset = scaledPaddedBounds.minX;
  var yOffset = scaledPaddedBounds.minY;

  function draw() {
    context.save();

    // Clear if we need to redraw
    context.clearRect( 0, 0, canvas.width, canvas.height );

    context.translate( -xOffset, -yOffset );
    context.scale( scale, scale );

    context.beginPath();
    arrowShape.writeToContext( context );
    context.fillStyle = ChargesAndFieldsColorProfile.electricFieldGridSaturationProperty.get().toCSS();
    context.fill();

    context.lineWidth = 0.5;
    context.strokeStyle = ChargesAndFieldsColorProfile.electricFieldGridSaturationStrokeProperty.get().toCSS();
    context.stroke();

    context.restore();

    emitter.emit();
  }

  // Draw immediately, and update on any color profile changes
  draw();
  ChargesAndFieldsColorProfile.electricFieldGridSaturationProperty.link( draw );
  ChargesAndFieldsColorProfile.electricFieldGridSaturationStrokeProperty.link( draw );

  return chargesAndFields.register( 'ElectricFieldArrowCanvas', {
    // @public {number} - Scale that was applied to the ArrowShape. Presumably un-scale by this amount.
    scale: scale,

    // @public {number} - X translation that should be applied "before" the scale
    xOffset: xOffset,

    // @public {number} - Y translation that should be applied "before" the scale
    yOffset: yOffset,

    // @public {HTMLCanvasElement} - The actual Canvas that can be used to draw
    canvas: canvas,

    // @public {Emitter} - Emits when the contents of the Canvas have changed (needs to be redrawn).
    updateEmitter: emitter
  } );

} );

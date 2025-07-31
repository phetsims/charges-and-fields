// Copyright 2016-2021, University of Colorado Boulder

/**
 * Contains and updates a Canvas where a canonical electric field arrow is drawn facing to the right. Contains
 * information about the scale and offset, so it's easy for clients to draw the arrow.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ElectricFieldArrowShape from './ElectricFieldArrowShape.js';

// Our shape that we'll use to draw (origin is where it will rotate)
const arrowShape = new ElectricFieldArrowShape();
const emitter = new Emitter();

const scale = 1.3;
const padding = 2;

const scaledPaddedBounds = new Bounds2( arrowShape.bounds.minX * scale,
  arrowShape.bounds.minY * scale,
  arrowShape.bounds.maxX * scale,
  arrowShape.bounds.maxY * scale ).dilated( padding ).roundedOut();

const canvas = document.createElement( 'canvas' );
canvas.width = scaledPaddedBounds.width;
canvas.height = scaledPaddedBounds.height;
const context = canvas.getContext( '2d' );

// Offset based on where the center is from the upper-left. Will usually be negative so it can be applied.
// When drawing in this code, we'll want to negate it.
const xOffset = scaledPaddedBounds.minX;
const yOffset = scaledPaddedBounds.minY;

function draw() {
  context.save();

  // Clear if we need to redraw
  context.clearRect( 0, 0, canvas.width, canvas.height );

  context.translate( -xOffset, -yOffset );
  context.scale( scale, scale );

  context.beginPath();
  arrowShape.writeToContext( context );
  context.fillStyle = ChargesAndFieldsColors.electricFieldGridSaturationProperty.get().toCSS();
  context.fill();

  context.lineWidth = 0.5;
  context.strokeStyle = ChargesAndFieldsColors.electricFieldGridSaturationStrokeProperty.get().toCSS();
  context.stroke();

  context.restore();

  emitter.emit();
}

// Draw immediately, and update on any color profile changes
draw();
ChargesAndFieldsColors.electricFieldGridSaturationProperty.link( draw );
ChargesAndFieldsColors.electricFieldGridSaturationStrokeProperty.link( draw );

const ElectricFieldArrowCanvas = {
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
};
chargesAndFields.register( 'ElectricFieldArrowCanvas', ElectricFieldArrowCanvas );
export default ElectricFieldArrowCanvas;
// Copyright 2016-2022, University of Colorado Boulder

/**
 * View for the electric potential Node that uses Canvas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargeTracker from './ChargeTracker.js';

// Spacing in the model coordinate frame.
const ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

class ElectricPotentialCanvasNode extends CanvasNode {

  /**
   * @param {ObservableArrayDef.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} modelBounds - The bounds in the model that need to be drawn
   * @param {Property.<boolean>} isVisibleProperty
   */
  constructor( chargedParticles,
               modelViewTransform,
               modelBounds,
               isVisibleProperty ) {

    super( {
      canvasBounds: modelViewTransform.modelToViewBounds( modelBounds )
    } );

    this.chargeTracker = new ChargeTracker( chargedParticles );

    this.modelViewTransform = modelViewTransform;
    this.modelBounds = modelBounds;
    this.viewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    const invalidateSelfListener = this.forceRepaint.bind( this );
    ChargesAndFieldsColors.electricPotentialGridZeroProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.link( invalidateSelfListener );
    isVisibleProperty.link( invalidateSelfListener ); // visibility change

    // particle added
    chargedParticles.addItemAddedListener( particle => particle.positionProperty.link( invalidateSelfListener ) );

    // particle removed
    chargedParticles.addItemRemovedListener( particle => {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } );

    isVisibleProperty.linkAttribute( this, 'visible' );

    this.modelPositions = []; // {Array.<Vector2>}
    const width = modelBounds.width;
    const height = modelBounds.height;
    const numHorizontal = Math.ceil( width / ELECTRIC_POTENTIAL_SENSOR_SPACING );
    const numVertical = Math.ceil( height / ELECTRIC_POTENTIAL_SENSOR_SPACING );
    for ( let row = 0; row < numVertical; row++ ) {
      const y = modelBounds.minY + ( row + 0.5 ) * height / numVertical;

      for ( let col = 0; col < numHorizontal; col++ ) {
        const x = modelBounds.minX + ( col + 0.5 ) * width / numHorizontal;

        this.modelPositions.push( new Vector2( x, y ) );
      }
    }

    this.electricPotentials = new Float64Array( this.modelPositions.length );

    this.directCanvas = document.createElement( 'canvas' );
    this.directCanvas.width = numHorizontal;
    this.directCanvas.height = numVertical;
    this.directContext = this.directCanvas.getContext( '2d' );
    this.directCanvasDirty = true; // Store a dirty flag, in case there weren't charge changes detected

    this.imageData = this.directContext.getImageData( 0, 0, numHorizontal, numVertical );
    assert && assert( this.imageData.width === numHorizontal );
    assert && assert( this.imageData.height === numVertical );

    // visibility change
    this.disposeElectricPotentialCanvasNode = () => isVisibleProperty.unlink( invalidateSelfListener );
  }

  /**
   * @private
   */
  forceRepaint() {
    this.invalidatePaint();
    this.directCanvasDirty = true;
  }

  /**
   * @private
   */
  updateElectricPotentials() {
    const kConstant = ChargesAndFieldsConstants.K_CONSTANT;

    const numChanges = this.chargeTracker.queue.length;

    for ( let i = 0; i < numChanges; i++ ) {
      const item = this.chargeTracker.queue[ i ];
      const oldPosition = item.oldPosition;
      const newPosition = item.newPosition;
      const charge = item.charge;

      for ( let j = 0; j < this.modelPositions.length; j++ ) {
        const position = this.modelPositions[ j ];
        let electricPotential = this.electricPotentials[ j ];

        if ( oldPosition ) {
          const oldDistance = position.distance( oldPosition );
          if ( oldDistance !== 0 ) {
            electricPotential -= charge * kConstant / oldDistance;
          }
        }

        if ( newPosition ) {
          const newDistance = position.distance( newPosition );
          if ( newDistance !== 0 ) {
            electricPotential += charge * kConstant / newDistance;
          }
        }

        this.electricPotentials[ j ] = electricPotential;
      }
    }

    this.chargeTracker.clear();

    // Update our direct canvas if necessary
    if ( numChanges || this.directCanvasDirty ) {
      const zeroColor = ChargesAndFieldsColors.electricPotentialGridZeroProperty.get();
      const positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get();
      const negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get();
      const data = this.imageData.data;

      for ( let k = 0; k < this.electricPotentials.length; k++ ) {
        let value = this.electricPotentials[ k ] / 40; // mapped with special constant

        let extremeColor;
        if ( value > 0 ) {
          extremeColor = positiveColor;
        }
        else {
          value = -value;
          extremeColor = negativeColor;
        }
        value = Math.min( value, 1 ); // clamp to [0,1]

        const offset = 4 * k;
        data[ offset + 0 ] = extremeColor.r * value + zeroColor.r * ( 1 - value );
        data[ offset + 1 ] = extremeColor.g * value + zeroColor.g * ( 1 - value );
        data[ offset + 2 ] = extremeColor.b * value + zeroColor.b * ( 1 - value );
        data[ offset + 3 ] = 255 * ( extremeColor.a * value + zeroColor.a * ( 1 - value ) );
      }

      this.directContext.putImageData( this.imageData, 0, 0 );

      this.directCanvasDirty = false;
    }
  }

  /**
   * Function responsible for painting the canvas Node as a grid array of squares
   * @public
   * @override
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {
    this.updateElectricPotentials();

    context.save();

    const sx = this.viewBounds.width / this.directCanvas.width;
    const sy = -this.viewBounds.height / this.directCanvas.height;
    const tx = this.viewBounds.minX;
    const ty = this.viewBounds.maxY;
    context.transform( sx, 0, 0, sy, tx, ty );

    context.drawImage( this.directCanvas, 0, 0 );

    context.restore();
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricPotentialCanvasNode();
  }
}

chargesAndFields.register( 'ElectricPotentialCanvasNode', ElectricPotentialCanvasNode );
export default ElectricPotentialCanvasNode;
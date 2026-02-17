// Copyright 2016-2025, University of Colorado Boulder

/**
 * View for the electric potential Node that uses Canvas.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargedParticle from '../model/ChargedParticle.js';
import ChargeTracker from './ChargeTracker.js';

// Spacing in the model coordinate frame.
const ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

export default class ElectricPotentialCanvasNode extends CanvasNode {

  private readonly chargeTracker: ChargeTracker;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly modelBounds: Bounds2;
  private readonly viewBounds: Bounds2;
  private readonly isVisibleProperty: Property<boolean>;

  // Array of model positions where electric potential is calculated
  private readonly modelPositions: Vector2[];

  // Array of electric potential values corresponding to model positions
  private readonly electricPotentials: Float64Array;

  // Direct canvas for rendering the potential grid
  private readonly directCanvas: HTMLCanvasElement;
  private readonly directContext: CanvasRenderingContext2D;
  private directCanvasDirty: boolean;
  private readonly imageData: ImageData;

  private readonly disposeElectricPotentialCanvasNode: () => void;

  /**
   * @param chargedParticles - only chargedParticles that are active in this array
   * @param modelViewTransform
   * @param modelBounds - The bounds in the model that need to be drawn
   * @param isVisibleProperty
   */
  public constructor( chargedParticles: ObservableArray<ChargedParticle>,
                      modelViewTransform: ModelViewTransform2,
                      modelBounds: Bounds2,
                      isVisibleProperty: Property<boolean> ) {

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
    chargedParticles.addItemAddedListener( ( particle: ChargedParticle ) => particle.positionProperty.link( invalidateSelfListener ) );

    // particle removed
    chargedParticles.addItemRemovedListener( ( particle: ChargedParticle ) => {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } );

    isVisibleProperty.linkAttribute( this, 'visible' );

    this.modelPositions = [];
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
    this.directContext = this.directCanvas.getContext( '2d' )!;
    this.directCanvasDirty = true;

    this.imageData = this.directContext.getImageData( 0, 0, numHorizontal, numVertical );
    assert && assert( this.imageData.width === numHorizontal );
    assert && assert( this.imageData.height === numVertical );

    this.disposeElectricPotentialCanvasNode = () => isVisibleProperty.unlink( invalidateSelfListener );
  }

  private forceRepaint(): void {
    this.invalidatePaint();
    this.directCanvasDirty = true;
  }

  private updateElectricPotentials(): void {
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
   */
  public override paintCanvas( context: CanvasRenderingContext2D ): void {
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
   */
  public override dispose(): void {
    this.disposeElectricPotentialCanvasNode();
  }
}

chargesAndFields.register( 'ElectricPotentialCanvasNode', ElectricPotentialCanvasNode );
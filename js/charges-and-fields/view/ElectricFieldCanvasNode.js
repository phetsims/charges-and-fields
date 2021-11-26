// Copyright 2016-2021, University of Colorado Boulder

/**
 * View for the electric field arrows that uses Canvas
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargeTracker from './ChargeTracker.js';
import ElectricFieldArrowCanvas from './ElectricFieldArrowCanvas.js';

// Spacing in the model coordinate frame.
const ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;

const MIN_VISIBLE_ELECTRIC_FIELD_MAG = 1e-9; // V/m

const scratchVector = new Vector2( 0, 0 );

class ElectricFieldCanvasNode extends CanvasNode {

  /**
   * @param {ObservableArrayDef.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} modelBounds - The bounds in the model that need to be drawn
   * @param {Property.<boolean>} isElectricFieldDirectionOnlyProperty
   * @param {Property.<boolean>} isVisibleProperty
   */
  constructor( chargedParticles,
               modelViewTransform,
               modelBounds,
               isElectricFieldDirectionOnlyProperty,
               isVisibleProperty ) {

    super( {
      canvasBounds: modelViewTransform.modelToViewBounds( modelBounds )
    } );

    this.chargeTracker = new ChargeTracker( chargedParticles );

    this.modelViewTransform = modelViewTransform;
    this.modelBounds = modelBounds;
    this.viewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );
    this.isElectricFieldDirectionOnlyProperty = isElectricFieldDirectionOnlyProperty;
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    const invalidateSelfListener = this.invalidatePaint.bind( this );

    ChargesAndFieldsColors.electricFieldGridSaturationProperty.link( invalidateSelfListener ); // color change

    isVisibleProperty.link( invalidateSelfListener ); // visibility change

    isElectricFieldDirectionOnlyProperty.link( invalidateSelfListener ); // visibility change

    chargedParticles.addItemAddedListener( particle => particle.positionProperty.link( invalidateSelfListener ) ); // particle added

    chargedParticles.addItemRemovedListener( particle => {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } ); // particle removed

    isVisibleProperty.linkAttribute( this, 'visible' );

    this.modelPositions = []; // {Array.<Vector2>}
    const width = modelBounds.width;
    const height = modelBounds.height;
    const numHorizontal = Math.ceil( width / ELECTRIC_FIELD_SENSOR_SPACING );
    const numVertical = Math.ceil( height / ELECTRIC_FIELD_SENSOR_SPACING );
    for ( let row = 0; row < numVertical; row++ ) {
      const y = modelBounds.minY + ( row + 0.5 ) * height / numVertical;

      for ( let col = 0; col < numHorizontal; col++ ) {
        const x = modelBounds.minX + ( col + 0.5 ) * width / numHorizontal;

        this.modelPositions.push( new Vector2( x, y ) );
      }
    }

    // {Array.<Vector2>}
    this.viewPositions = this.modelPositions.map( position => modelViewTransform.modelToViewPosition( position ) );

    // {Array.<Vector2>}, where electricField[ i ] is the 2D field at positions[ i ]
    this.electricField = this.modelPositions.map( () => new Vector2( 0, 0 ) );

    this.disposeElectricFieldCanvasNode = () => {
      isVisibleProperty.unlink( invalidateSelfListener ); // visibility change
      isElectricFieldDirectionOnlyProperty.unlink( invalidateSelfListener ); // visibility change
    };
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
        const electricField = this.electricField[ j ];

        if ( oldPosition ) {
          const oldDistanceSquared = position.distanceSquared( oldPosition );
          if ( oldDistanceSquared !== 0 ) {
            electricField.subtract( scratchVector.set( position )
              .subtract( oldPosition )
              .multiplyScalar( kConstant * charge / Math.pow( oldDistanceSquared, 1.5 ) ) );
          }
        }

        if ( newPosition ) {
          const newDistanceSquared = position.distanceSquared( newPosition );
          if ( newDistanceSquared !== 0 ) {
            electricField.add( scratchVector.set( position )
              .subtract( newPosition )
              .multiplyScalar( kConstant * charge / Math.pow( newDistanceSquared, 1.5 ) ) );
          }
        }
      }
    }

    this.chargeTracker.clear();
  }

  /**
   * Function responsible for painting electric field arrows
   * @override
   * @public
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {
    this.updateElectricPotentials();

    const isDirectionOnly = this.isElectricFieldDirectionOnlyProperty.get();
    const maxMagnitude = ChargesAndFieldsConstants.EFIELD_COLOR_SAT_MAGNITUDE;

    for ( let i = 0; i < this.viewPositions.length; i++ ) {
      const viewPosition = this.viewPositions[ i ];
      const electricField = this.electricField[ i ];

      context.save();
      context.globalAlpha = Utils.clamp( electricField.magnitude / maxMagnitude, 0, 1 );
      if ( isDirectionOnly && electricField.magnitude > MIN_VISIBLE_ELECTRIC_FIELD_MAG ) {
        context.globalAlpha = 1.0;
      }

      context.translate( viewPosition.x, viewPosition.y );
      context.rotate( -electricField.angle );
      context.scale( 1 / ElectricFieldArrowCanvas.scale, 1 / ElectricFieldArrowCanvas.scale );
      context.translate( ElectricFieldArrowCanvas.xOffset, ElectricFieldArrowCanvas.yOffset );
      context.drawImage( ElectricFieldArrowCanvas.canvas, 0, 0 );

      context.restore();
    }
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricFieldCanvasNode();
  }
}

chargesAndFields.register( 'ElectricFieldCanvasNode', ElectricFieldCanvasNode );
export default ElectricFieldCanvasNode;
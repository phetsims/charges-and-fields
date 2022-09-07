// Copyright 2015-2022, University of Colorado Boulder

/**
 * Scenery Node representing grid lines (located in the model) with major and minor lines.
 * A double arrow indicates the length scale of the grid.
 *
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants related to text
const FONT = ChargesAndFieldsConstants.GRID_LABEL_FONT;

// constants
const MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
const MAJOR_GRIDLINE_LINEWIDTH = 2;
const MINOR_GRIDLINE_LINEWIDTH = 1;
const ARROW_LENGTH = 1; // in model coordinates
const ARROW_POSITION = new Vector2( 2, -2.20 ); // top left position in model coordinates

const oneMeterString = ChargesAndFieldsStrings.oneMeter;

class GridNode extends Node {

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} boundsProperty - bounds in model coordinates
   * @param {Property.<boolean>} isGridVisibleProperty
   * @param {Property.<boolean>} areValuesVisibleProperty
   * @param {Tandem} tandem
   */
  constructor( modelViewTransform,
               boundsProperty,
               isGridVisibleProperty,
               areValuesVisibleProperty,
               tandem ) {

    super();

    const gridLinesParent = new Node();

    // separation in model coordinates of the major grid lines
    const majorDeltaX = ChargesAndFieldsConstants.GRID_MAJOR_SPACING;
    const majorDeltaY = majorDeltaX; // we want a square grid

    // separation in model coordinates of the minor grid lines
    const deltaX = majorDeltaX / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    const deltaY = majorDeltaY / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;

    // the following variables are integers
    const minI = Math.ceil( boundsProperty.get().minX / deltaX );
    const maxI = Math.floor( boundsProperty.get().maxX / deltaX );
    const minJ = Math.ceil( boundsProperty.get().minY / deltaY );
    const maxJ = Math.floor( boundsProperty.get().maxY / deltaY );

    let i; // {number} an integer
    let j; // {number} an integer
    let isMajorGridLine; // {boolean}
    const majorGridLinesShape = new Shape();
    const minorGridLinesShape = new Shape();

    // vertical gridLines
    for ( i = minI; i <= maxI; i++ ) {
      isMajorGridLine = ( i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridLine ) {
        majorGridLinesShape.moveTo( i * deltaX, minJ * deltaY ).verticalLineTo( maxJ * deltaY );
      }
      else {
        minorGridLinesShape.moveTo( i * deltaX, minJ * deltaY ).verticalLineTo( maxJ * deltaY );
      }
    }

    // horizontal gridLines
    for ( j = minJ; j <= maxJ; j++ ) {
      isMajorGridLine = ( j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridLine ) {
        majorGridLinesShape.moveTo( minI * deltaX, j * deltaY ).horizontalLineTo( maxI * deltaX );
      }
      else {
        minorGridLinesShape.moveTo( minI * deltaX, j * deltaY ).horizontalLineTo( maxI * deltaX );
      }
    }

    const majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
      lineWidth: MAJOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColors.gridStrokeProperty,
      tandem: tandem.createTandem( 'majorGridLinesPath' )
    } );

    const minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
      lineWidth: MINOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColors.gridStrokeProperty,
      tandem: tandem.createTandem( 'minorGridLinesPath' )
    } );

    // Create the one-meter double headed arrow representation
    const arrowShape = new ArrowShape( 0, 0, modelViewTransform.modelToViewDeltaX( ARROW_LENGTH ), 0, { doubleHead: true } );
    const arrowPath = new Path( arrowShape, {
      fill: ChargesAndFieldsColors.gridLengthScaleArrowFillProperty,
      stroke: ChargesAndFieldsColors.gridLengthScaleArrowStrokeProperty,
      tandem: tandem.createTandem( 'arrowPath' )
    } );

    // Create and add the text (legend) accompanying the double headed arrow
    const legendText = new Text( oneMeterString, {
      fill: ChargesAndFieldsColors.gridTextFillProperty,
      font: FONT,
      tandem: tandem.createTandem( 'legendText' )
    } );

    // add all the nodes
    gridLinesParent.addChild( minorGridLinesPath );
    gridLinesParent.addChild( majorGridLinesPath );
    this.addChild( gridLinesParent );
    this.addChild( arrowPath );
    this.addChild( legendText );

    // layout
    arrowPath.top = modelViewTransform.modelToViewY( ARROW_POSITION.y ); // empirically determined such that the electric field arrows do not overlap with it
    arrowPath.left = modelViewTransform.modelToViewX( ARROW_POSITION.x ); // should be set to an integer value such that it spans two majorGridLines
    legendText.centerX = arrowPath.centerX;
    legendText.top = arrowPath.bottom;

    // Show/ Hide the arrow
    // no need to unlink, present for the lifetime of the simulation
    areValuesVisibleProperty.link( isVisible => {
      arrowPath.visible = isVisible;
      legendText.visible = isVisible;
    } );

    // Show/ Hide the grid
    // no need to unlink, present for the lifetime of the simulation
    isGridVisibleProperty.link( isVisible => {
      this.visible = isVisible;
    } );
  }
}

chargesAndFields.register( 'GridNode', GridNode );
export default GridNode;
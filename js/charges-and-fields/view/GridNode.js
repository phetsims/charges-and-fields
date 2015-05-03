// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node representing grid lines (located in the model) with major and minor lines.
 * A double arrow indicates the length scale of the grid.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants related to text
  var FONT = ChargesAndFieldsConstants.GRID_LABEL_FONT;

  // constants
  var MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = 5;
  var MAJOR_GRIDLINE_LINEWIDTH = 2;
  var MINOR_GRIDLINE_LINEWIDTH = 1;
  var ARROW_LENGTH = 1; // in model coordinates

  // strings
  var oneMeterString = require( 'string!CHARGES_AND_FIELDS/oneMeter' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} boundsProperty - bounds in model coordinates
   * @param {Property.<boolean>} isGridVisibleProperty
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @constructor
   */
  function GridNode( modelViewTransform,
                     boundsProperty,
                     isGridVisibleProperty,
                     isValuesVisibleProperty ) {

    var thisGrid = this;

    Node.call( this );

    var gridlinesParent = new Node();

    // separation in model coordinates of the major grid lines
    var majorDeltaX = ChargesAndFieldsConstants.GRID_MAJOR_SPACING;
    var majorDeltaY = majorDeltaX; // we want a square grid

    // separation in model coordinates of the minor grid lines
    var deltaX = majorDeltaX / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    var deltaY = majorDeltaY / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;

    // the following variables are integers
    var minI = Math.ceil( boundsProperty.get().minX / deltaX );
    var maxI = Math.floor( boundsProperty.get().maxX / deltaX );
    var minJ = Math.ceil( boundsProperty.get().minY / deltaY );
    var maxJ = Math.floor( boundsProperty.get().maxY / deltaY );

    var i; // {number} an integer
    var j; // {number} an integer
    var isMajorGridline; // {boolean}
    var majorGridlinesShape = new Shape();
    var minorGridlinesShape = new Shape();

    // vertical gridlines
    for ( i = minI; i <= maxI; i++ ) {
      isMajorGridline = ( i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridline ) {
        majorGridlinesShape.moveTo( i * deltaX, minJ * deltaY ).verticalLineTo( maxJ * deltaY );
      }
      else {
        minorGridlinesShape.moveTo( i * deltaX, minJ * deltaY ).verticalLineTo( maxJ * deltaY );
      }
    }

    // horizontal gridlines
    for ( j = minJ; j <= maxJ; j++ ) {
      isMajorGridline = ( j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridline ) {
        majorGridlinesShape.moveTo( minI * deltaX, j * deltaY ).horizontalLineTo( maxI * deltaX );
      }
      else {
        minorGridlinesShape.moveTo( minI * deltaX, j * deltaY ).horizontalLineTo( maxI * deltaX );
      }
    }

    var majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridlinesShape ), {
      lineWidth: MAJOR_GRIDLINE_LINEWIDTH, lineCap: 'butt', lineJoin: 'bevel'
    } );

    var minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridlinesShape ), {
      lineWidth: MINOR_GRIDLINE_LINEWIDTH, lineCap: 'butt', lineJoin: 'bevel'
    } );

    // Create the one-meter double headed arrow representation
    var arrowShape = new ArrowShape( 0, 0, modelViewTransform.modelToViewDeltaX( ARROW_LENGTH ), 0, { doubleHead: true } );
    var arrowPath = new Path( arrowShape );

    // Create and add the text (legend) accompanying the double headed arrow
    var text = new Text( oneMeterString, { font: FONT } );

    // add all the nodes
    gridlinesParent.addChild( minorGridLinesPath );
    gridlinesParent.addChild( majorGridLinesPath );
    this.addChild( gridlinesParent );
    this.addChild( arrowPath );
    this.addChild( text );

    // layout
    arrowPath.top = modelViewTransform.modelToViewY( -2.20 ); // empirically determined such that the electric field arrows do not overlap with it
    arrowPath.left = modelViewTransform.modelToViewX( 2 ); // should be set to an integer value such that it spans two majorGridlines
    text.centerX = arrowPath.centerX;
    text.top = arrowPath.bottom;

    // Create links to the projector/default color scheme
    // no need to unlink, present for the lifetime of the simulation
    ChargesAndFieldsColors.gridStrokeProperty.link( function( color ) {
      minorGridLinesPath.stroke = color;
      majorGridLinesPath.stroke = color;
    } );

    ChargesAndFieldsColors.gridLengthScaleArrowStrokeProperty.link( function( color ) {
      arrowPath.stroke = color;
    } );

    ChargesAndFieldsColors.gridLengthScaleArrowFillProperty.link( function( color ) {
      arrowPath.fill = color;
    } );

    ChargesAndFieldsColors.gridTextFillProperty.link( function( color ) {
      text.fill = color;
    } );

    // Show/ Hide the arrow
    // no need to unlink, present for the lifetime of the simulation
    isValuesVisibleProperty.link( function( isVisible ) {
      arrowPath.visible = isVisible;
      text.visible = isVisible;
    } );

    // Show/ Hide the grid
    // no need to unlink, present for the lifetime of the simulation
    isGridVisibleProperty.link( function( isVisible ) {
      thisGrid.visible = isVisible;
    } );

  }

  return inherit( Node, GridNode );
} );
// Copyright 2015, University of Colorado Boulder

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
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // constants related to text
  var FONT = ChargesAndFieldsConstants.GRID_LABEL_FONT;

  // constants
  var MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
  var MAJOR_GRIDLINE_LINEWIDTH = 2;
  var MINOR_GRIDLINE_LINEWIDTH = 1;
  var ARROW_LENGTH = 1; // in model coordinates
  var ARROW_POSITION = new Vector2( 2, -2.20 ); // top left position in model coordinates

  // strings
  var oneMeterString = require( 'string!CHARGES_AND_FIELDS/oneMeter' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} boundsProperty - bounds in model coordinates
   * @param {Property.<boolean>} isGridVisibleProperty
   * @param {Property.<boolean>} areValuesVisibleProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function GridNode( modelViewTransform,
                     boundsProperty,
                     isGridVisibleProperty,
                     areValuesVisibleProperty,
                     tandem ) {

    var self = this;

    Node.call( this );

    var gridLinesParent = new Node();

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
    var isMajorGridLine; // {boolean}
    var majorGridLinesShape = new Shape();
    var minorGridLinesShape = new Shape();

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

    var majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridLinesShape ), {
      lineWidth: MAJOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColorProfile.gridStrokeProperty,
      tandem: tandem.createTandem( 'majorGridLinesPath' )
    } );

    var minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridLinesShape ), {
      lineWidth: MINOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColorProfile.gridStrokeProperty,
      tandem: tandem.createTandem( 'minorGridLinesPath' )
    } );

    // Create the one-meter double headed arrow representation
    var arrowShape = new ArrowShape( 0, 0, modelViewTransform.modelToViewDeltaX( ARROW_LENGTH ), 0, { doubleHead: true } );
    var arrowPath = new Path( arrowShape, {
      fill: ChargesAndFieldsColorProfile.gridLengthScaleArrowFillProperty,
      stroke: ChargesAndFieldsColorProfile.gridLengthScaleArrowStrokeProperty,
      tandem: tandem.createTandem( 'arrowPath' )
    } );

    // Create and add the text (legend) accompanying the double headed arrow
    var legendText = new Text( oneMeterString, {
      fill: ChargesAndFieldsColorProfile.gridTextFillProperty,
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
    areValuesVisibleProperty.link( function( isVisible ) {
      arrowPath.visible = isVisible;
      legendText.visible = isVisible;
    } );

    // Show/ Hide the grid
    // no need to unlink, present for the lifetime of the simulation
    isGridVisibleProperty.link( function( isVisible ) {
      self.visible = isVisible;
    } );

  }

  chargesAndFields.register( 'GridNode', GridNode );

  return inherit( Node, GridNode );
} );
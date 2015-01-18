// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery Node representing grid lines (located in the model) with major and minor lines.
 * A double arrow indicates the length scale of the grid.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // imports
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

  //constants
  var MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = 5;
  var MAJOR_GRIDLINE_LINEWIDTH = 2;
  var MINOR_GRIDLINE_LINEWIDTH = 1;
  var ARROW_LENGTH = 1; // in model coordinates

  // strings
  var oneMeterString = require( 'string!CHARGES_AND_FIELDS/oneMeter' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} gridIsVisibleProperty
   * @param {Property.<boolean>} valuesIsVisibleProperty
   * @constructor
   */
  function Grid( modelViewTransform, gridIsVisibleProperty, valuesIsVisibleProperty ) {

    var thisGrid = this;

    Node.call( this );

    var gridlinesParent = new Node();

    // bounds of the grid in model coordinates
    var minX = -ChargesAndFieldsConstants.WIDTH / 2;
    var maxX = ChargesAndFieldsConstants.WIDTH / 2;
    var minY = -ChargesAndFieldsConstants.HEIGHT / 2;
    var maxY = ChargesAndFieldsConstants.HEIGHT / 2;

// use bound twice times as large as the nominal screen view
//    var minX = -ChargesAndFieldsConstants.WIDTH;
//    var maxX = ChargesAndFieldsConstants.WIDTH;
//    var minY = -ChargesAndFieldsConstants.HEIGHT;
//    var maxY = ChargesAndFieldsConstants.HEIGHT;
    // separation in model coordinates of the major grid lines
    var majorDeltaX = 0.5;
    var majorDeltaY = majorDeltaX; // we want a square grid

    // separation in model coordinates of the minor grid lines
    var deltaX = majorDeltaX / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    var deltaY = majorDeltaY / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;

    var epsilon = 0.00001; // allow for floating point error
    var isMajorGridline;

    var majorGridlinesShape = new Shape();
    var minorGridlinesShape = new Shape();

    // vertical gridlines
    var x;

    for ( x = minX; x <= maxX + epsilon; x = x + deltaX ) {
      isMajorGridline = ( Math.round( x / deltaX ) % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridline ) {
        majorGridlinesShape.moveTo( x, minY ).verticalLineTo( maxY );
      }
      else {
        minorGridlinesShape.moveTo( x, minY ).verticalLineTo( maxY );
      }
    }
    // horizontal gridlines
    var y;
    for ( y = minY; y <= maxY + epsilon; y = y + deltaY ) {
      isMajorGridline = ( Math.round( y / deltaY ) % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      if ( isMajorGridline ) {
        majorGridlinesShape.moveTo( minX, y ).horizontalLineTo( maxX );
      }
      else {
        minorGridlinesShape.moveTo( minX, y ).horizontalLineTo( maxX );
      }
    }

    var majorGridLinesPath = new Path( modelViewTransform.modelToViewShape( majorGridlinesShape ), {
      lineWidth: MAJOR_GRIDLINE_LINEWIDTH, lineCap: 'butt', lineJoin: 'bevel'
    } );

    var minorGridLinesPath = new Path( modelViewTransform.modelToViewShape( minorGridlinesShape ), {
      lineWidth: MINOR_GRIDLINE_LINEWIDTH, lineCap: 'butt', lineJoin: 'bevel'
    } );

    ChargesAndFieldsColors.link( 'gridStroke', function( color ) {
      minorGridLinesPath.stroke = color;
      majorGridLinesPath.stroke = color;
    } );

    gridlinesParent.addChild( minorGridLinesPath );
    gridlinesParent.addChild( majorGridLinesPath );

    this.addChild( gridlinesParent );

    // Create and add one meter double headed arrow representation
    var arrowShape = new ArrowShape( 0, 0, modelViewTransform.modelToViewDeltaX( ARROW_LENGTH ), 0, {doubleHead: true} );
    var arrowPath = new Path( arrowShape );
    arrowPath.bottom = modelViewTransform.modelToViewY( -1.25 );
    arrowPath.left = modelViewTransform.modelToViewX( -1 );
    this.addChild( arrowPath );


    ChargesAndFieldsColors.link( 'gridLengthScaleArrowStroke', function( color ) {
      arrowPath.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'gridLengthScaleArrowFill', function( color ) {
      arrowPath.fill = color;
    } );

    // Create and add the text (legend) accompanying the double headed arrow
    var text = new Text( oneMeterString, {font: FONT} );
    this.addChild( text );
    text.centerX = arrowPath.centerX;
    text.top = arrowPath.bottom;

    ChargesAndFieldsColors.link( 'gridTextFill', function( color ) {
      text.fill = color;
    } );

    // Show/ Hide the arrow
    valuesIsVisibleProperty.link( function( isVisible ) {
      arrowPath.visible = isVisible;
      text.visible = isVisible;
    } );


    // Show/ Hide the grid
    gridIsVisibleProperty.link( function( isVisible ) {
      thisGrid.visible = isVisible;
    } );

  }

  return inherit( Node, Grid );
} )
;
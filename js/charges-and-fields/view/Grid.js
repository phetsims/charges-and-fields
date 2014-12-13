// Copyright 2002-2013, University of Colorado Boulder

/**
 * Control panel.
 *
 */
define( function( require ) {
  'use strict';

  // imports

  //   var Color = require( 'SCENERY/util/Color' );
  //   var Dimension2 = require( 'DOT/Dimension2' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );


  // constants related to text
  var FONT_SIZE = 13;
  var FONT = new PhetFont( FONT_SIZE );

  // strings
  var oneMeterString = require( 'string!CHARGES_AND_FIELDS/oneMeter' );

  function Grid( bounds, gridIsVisibleProperty ) {

    var thisGrid = this;

    Node.call( this );

    //TODO: set the grid based on the model bounds rather the view bounds

    //var horizontalLayoutLength = this.layoutBounds.maxX; //
    //var VERTICAL_LAYOUT_LENGTH = this.layoutBounds.maxY;

    var horizontalLayoutLength = bounds.maxX; //
    var verticalLayoutLength = bounds.maxY;

    //constants
    var MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = 5;
    var MINOR_GRIDLINE_SPACING = 12; //
    var MAJOR_GRIDLINE_LINEWIDTH = 2;
    var MINOR_GRIDLINE_LINEWIDTH = 1;
    var GRIDLINE_COLOR = 'orange';
    var ARROW_STROKE = 'blue';
    var ARROW_FILL = 'orange';
    var ARROW_LENGTH = '120'


    var gridlinesParent = new Node();

    var widthOfMajorGridlines = MINOR_GRIDLINES_PER_MAJOR_GRIDLINE * MINOR_GRIDLINE_SPACING;
    var numberOfMajorHorizontalGridlines = Math.round( horizontalLayoutLength / widthOfMajorGridlines );
    var numberOfMajorVerticalGridlines = Math.round( verticalLayoutLength / widthOfMajorGridlines );
    var numberOfHorizontalGridlines = numberOfMajorHorizontalGridlines * MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    var numberOfVerticalGridlines = numberOfMajorVerticalGridlines * MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    var deltaX = horizontalLayoutLength / numberOfHorizontalGridlines;
    var deltaY = verticalLayoutLength / numberOfVerticalGridlines;


    var isMajorGridline;
    var lineWidthStroke;
    // horizontal gridlines
    var i;
    for ( i = 0; i <= numberOfHorizontalGridlines; i++ ) {
      isMajorGridline = ( i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      lineWidthStroke = ( isMajorGridline ? MAJOR_GRIDLINE_LINEWIDTH : MINOR_GRIDLINE_LINEWIDTH );
      var x = ( i * deltaX );

      gridlinesParent.addChild( new Path(
        new Shape().moveTo( x, 0 ).lineTo( x, verticalLayoutLength ),
        {stroke: GRIDLINE_COLOR, lineWidth: lineWidthStroke, lineCap: 'butt', lineJoin: 'bevel'} ) );
    }

    // vertical gridlines
    for ( i = 0; i <= numberOfVerticalGridlines; i++ ) {
      isMajorGridline = ( i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
      lineWidthStroke = ( isMajorGridline ? MAJOR_GRIDLINE_LINEWIDTH : MINOR_GRIDLINE_LINEWIDTH );
      var y = ( i * deltaY );

      gridlinesParent.addChild( new Path(
        new Shape().moveTo( 0, y ).lineTo( horizontalLayoutLength, y ),
        {stroke: GRIDLINE_COLOR, lineWidth: lineWidthStroke, lineCap: 'butt', lineJoin: 'bevel'} ) );
    }
    this.addChild( gridlinesParent );


    var arrowShape = new ArrowShape( 0, 0, ARROW_LENGTH, 0, {doubleHead: true} );
    var arrowPath = new Path( arrowShape, {stroke: ARROW_STROKE, fill: ARROW_FILL} );
    arrowPath.bottom = 400;
    arrowPath.left = 120;
    this.addChild( arrowPath );


    var text = new Text( oneMeterString, {font: FONT} );
    this.addChild( text );
    text.centerX = arrowPath.centerX;
    text.top = arrowPath.bottom;

    gridIsVisibleProperty.link( function( isVisible ) {
      thisGrid.visible = isVisible;
    } );

  }

  return inherit( Node, Grid );
} );
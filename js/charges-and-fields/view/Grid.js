// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery Node representing grid lines (located in the model) with major and minor lines.
 * A double arrow indicates the length scale of the grid.
 *
 * @author Martin Veillette (Berea College)
 */

define(function (require) {
    'use strict';

    // imports

    //   var Color = require( 'SCENERY/util/Color' );
    //   var Dimension2 = require( 'DOT/Dimension2' );
    var ArrowShape = require('SCENERY_PHET/ArrowShape');
    //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var PhetFont = require('SCENERY_PHET/PhetFont');
    var Shape = require('KITE/Shape');
    var Text = require('SCENERY/nodes/Text');

    // constants related to text
    var FONT_SIZE = 13;
    var FONT = new PhetFont(FONT_SIZE);

    //constants
    var MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = 5;
    var MAJOR_GRIDLINE_LINEWIDTH = 2;
    var MINOR_GRIDLINE_LINEWIDTH = 1;
    var GRIDLINE_COLOR = 'orange';
    var ARROW_STROKE = 'blue';
    var ARROW_FILL = 'orange';
    var ARROW_LENGTH = 1; // in model coordinates

    // strings
    var oneMeterString = require('string!CHARGES_AND_FIELDS/oneMeter');

    /**
     *
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} gridIsVisibleProperty
     * @constructor
     */
    function Grid(modelViewTransform, gridIsVisibleProperty) {

        var thisGrid = this;

        Node.call(this);

        var gridlinesParent = new Node();

        // bounds of the grid in model coordinates
        var minX = -4;
        var maxX = 4;
        var minY = -2.5;
        var maxY = 2.5;

        // separation in model coordinates of the major grid lines
        var majorDeltaX = 0.5;
        var majorDeltaY = majorDeltaX; // we want a square grid

        // separation in model coordinates of the minor grid lines
        var deltaX = majorDeltaX / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
        var deltaY = majorDeltaY / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;

        var epsilon = 0.00001; // allow for floating point error
        var isMajorGridline;
        var lineWidthStroke;

        // horizontal gridlines
        var x;
        for (x = minX; x <= maxX + epsilon; x = x + deltaX) {
            isMajorGridline = ( Math.round(x / deltaX) % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
            lineWidthStroke = ( isMajorGridline ? MAJOR_GRIDLINE_LINEWIDTH : MINOR_GRIDLINE_LINEWIDTH );

            var xInView = modelViewTransform.modelToViewX(x);

            gridlinesParent.addChild(new Path(
                new Shape()
                    .moveTo(xInView, modelViewTransform.modelToViewY(minY))
                    .lineTo(xInView, modelViewTransform.modelToViewY(maxY)),
                {stroke: GRIDLINE_COLOR, lineWidth: lineWidthStroke, lineCap: 'butt', lineJoin: 'bevel'}));
        }

        // vertical gridlines
        var y;
        for (y = minY; y <= maxY + epsilon; y = y + deltaY) {
            isMajorGridline = ( Math.round(y / deltaY) % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0 );
            lineWidthStroke = ( isMajorGridline ? MAJOR_GRIDLINE_LINEWIDTH : MINOR_GRIDLINE_LINEWIDTH );

            var yInView = modelViewTransform.modelToViewY(y);

            gridlinesParent.addChild(new Path(
                new Shape()
                    .moveTo(modelViewTransform.modelToViewX(minX), yInView)
                    .lineTo(modelViewTransform.modelToViewX(maxX), yInView),
                {stroke: GRIDLINE_COLOR, lineWidth: lineWidthStroke, lineCap: 'butt', lineJoin: 'bevel'}));
        }

        this.addChild(gridlinesParent);

        // Create and add one meter double headed arrow representation (with text label)

        var arrowShape = new ArrowShape(0, 0, modelViewTransform.modelToViewDeltaX(ARROW_LENGTH), 0, {doubleHead: true});
        var arrowPath = new Path(arrowShape, {stroke: ARROW_STROKE, fill: ARROW_FILL});
        arrowPath.bottom = modelViewTransform.modelToViewY(-1.25);
        arrowPath.left = modelViewTransform.modelToViewX(-1);
        this.addChild(arrowPath);

        var text = new Text(oneMeterString, {font: FONT});
        this.addChild(text);
        text.centerX = arrowPath.centerX;
        text.top = arrowPath.bottom;

        gridIsVisibleProperty.link(function (isVisible) {
            thisGrid.visible = isVisible;
        });

    }

    return inherit(Node, Grid);
});
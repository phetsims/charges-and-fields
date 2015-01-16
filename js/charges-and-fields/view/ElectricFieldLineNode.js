// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node responsible for the drawing of the electricField lines
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules

    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
//  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
    var Shape = require('KITE/Shape');
    // var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

    /**
     *
     * @param electricFieldLinesArray
     * @param clearElectricFieldLinesProperty
     * @param {ModelViewTransform2}  modelViewTransform
     * @constructor
     */
    function ElectricFieldLineNode(electricFieldLinesArray, clearElectricFieldLinesProperty, modelViewTransform) {

        Node.call(this);

        var electricFieldLineNode = this;

        electricFieldLinesArray.addItemAddedListener(function (electricFieldLine) {
            traceElectricFieldLine(electricFieldLine);
        });

        // remove the nodes and clear the array the equipotential lines
        clearElectricFieldLinesProperty.link(function () {
            electricFieldLineNode.removeAllChildren();
            clearElectricFieldLinesProperty.value = false;
        });

        function traceElectricFieldLine(electricFieldLine) {

            //draw the electricField line
            var shape = new Shape();
            shape.moveToPoint(modelViewTransform.modelToViewPosition(electricFieldLine.positionArray [0]));

            var arrayLength = electricFieldLine.positionArray.length;
            var i;
            var L = 6;
            var alpha = Math.PI * 6.5 / 8;

            for (i = 0; i < arrayLength; i++) {
                var isArrowSegment = ( i % 50 === 2 );
                var position = modelViewTransform.modelToViewPosition(electricFieldLine.positionArray[i]);
                if (isArrowSegment) {
                    var angle = position.minus(shape.getRelativePoint()).angle();
                    shape
                        .lineToPointRelative({x: L * Math.cos(angle + alpha), y: L * Math.sin(angle + alpha)})
                        .lineToPointRelative({
                            x: 2 * L * Math.sin(alpha) * Math.sin(angle),
                            y: -2 * L * Math.sin(alpha) * Math.cos(angle)
                        })
                        .lineToPointRelative({x: -L * Math.cos(angle - alpha), y: -L * Math.sin(angle - alpha)});
                }
                shape.lineToPoint(modelViewTransform.modelToViewPosition(electricFieldLine.positionArray[i]));
            }

            electricFieldLineNode.addChild(new Path(shape, {stroke: 'orange', lineWidth: 2, pickable: false}));
        }

    }

    return inherit(Node, ElectricFieldLineNode);
});
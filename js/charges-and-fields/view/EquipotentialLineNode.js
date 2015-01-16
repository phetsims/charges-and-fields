// Copyright 2002-2015, University of Colorado Boulder

/**
 * Node responsible for the drawing of the equipotential lines
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules

    //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var PhetFont = require('SCENERY_PHET/PhetFont');
    var Shape = require('KITE/Shape');
    var StringUtils = require('PHETCOMMON/util/StringUtils');
    var Text = require('SCENERY/nodes/Text');

    // constants

    var LABEL_COLOR = 'red';
    var LABEL_FONT = new PhetFont({size: 18, weight: 'bold'});

    // strings

    var pattern_0value_1units = require('string!CHARGES_AND_FIELDS/pattern.0value.1units');
    var voltageUnitString = require('string!CHARGES_AND_FIELDS/voltageUnit');


    /**
     *
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @param {ModelViewTransform2} modelViewTransform
     * @constructor
     */

    /**
     *
     * @param {Array.<Object>} equipotentialLinesArray
     * @param {Property.<boolean>} clearEquipotentialLinesProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} valueIsVisibleProperty
     * @constructor
     */
    function EquipotentialLineNode(equipotentialLinesArray, clearEquipotentialLinesProperty, modelViewTransform, valueIsVisibleProperty) {

        Node.call(this);

        // create and add the line node
        var lineNode = new Node();
        this.addChild(lineNode);

        // create and add the equipotentialLine node for the labels
        var equipotentialLabelNode = new Node();
        this.addChild(equipotentialLabelNode);

        equipotentialLinesArray.addItemAddedListener(function (equipotentialLine) {
            traceElectricPotentialLine(equipotentialLine);

            equipotentialLinesArray.addItemRemovedListener(function removalListener(removedEquipotentialLine) {
                if (removedEquipotentialLine === equipotentialLine) {
                    lineNode.removeChild(removedEquipotentialLine.path);
                    equipotentialLinesArray.removeItemRemovedListener(removalListener);
                }
            });
        });

        //// remove the nodes and clear the array the equipotential lines
        clearEquipotentialLinesProperty.link(function () {
            equipotentialLabelNode.removeAllChildren();
            lineNode.removeAllChildren();
            clearEquipotentialLinesProperty.value = false;
        });

        // control the visibility of the number labels
        valueIsVisibleProperty.link(function (isVisible) {
            equipotentialLabelNode.visible = isVisible;
        });

        /**
         * Function that generates a label and a path/shape of the equipotential line
         * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
         */
        function traceElectricPotentialLine(equipotentialLine) {

            //add and create the label for the equipotential line
            var voltageLabelText = StringUtils.format(pattern_0value_1units, equipotentialLine.electricPotential.toFixed(1), voltageUnitString);
            var voltageLabel = new Text(voltageLabelText,
                {
                    fill: LABEL_COLOR,
                    font: LABEL_FONT,
                    pickable: false,
                    center: modelViewTransform.modelToViewPosition(equipotentialLine.position)
                });
            equipotentialLabelNode.addChild(voltageLabel);

            // create the equipotential line
            var shape = new Shape();
            shape.moveToPoint(modelViewTransform.modelToViewPosition(equipotentialLine.positionArray [0]));
            equipotentialLine.positionArray.forEach(function (position) {
                shape.lineToPoint(modelViewTransform.modelToViewPosition(position));
            });
            lineNode.addChild(new Path(shape, {stroke: 'green', lineWidth: 1, pickable: false}));
        }
    }

    return inherit(Node, EquipotentialLineNode);
});
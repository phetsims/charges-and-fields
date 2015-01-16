// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node responsible for the drawing of the equipotential lines and their accompanying voltage labels
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules
    var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
    var ChargesAndFieldsColors = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsColors');
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var PhetFont = require('SCENERY_PHET/PhetFont');
    var Shape = require('KITE/Shape');
    var StringUtils = require('PHETCOMMON/util/StringUtils');
    var Text = require('SCENERY/nodes/Text');

    // strings
    var pattern_0value_1units = require('string!CHARGES_AND_FIELDS/pattern.0value.1units');
    var voltageUnitString = require('string!CHARGES_AND_FIELDS/voltageUnit');

    /**
     *
     * @param {Array.<Object>} equipotentialLinesArray - array of models of equipotentialLine
     * @param {Property.<boolean>} clearEquipotentialLinesProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} valueIsVisibleProperty - ontrol the visibility of the voltage labels
     * @constructor
     */
    function EquipotentialLineNode(equipotentialLinesArray, clearEquipotentialLinesProperty, modelViewTransform, valueIsVisibleProperty) {

        Node.call(this);

        // Create and add the parent node for all the line nodes
        var lineNode = new Node();
        this.addChild(lineNode);

        // Create and add the parent node for the label nodes
        var labelNode = new Node();
        this.addChild(labelNode);

        // Monitor the equipotentialLineArray and create a path and label for each equipotentialLine
        equipotentialLinesArray.addItemAddedListener(function (equipotentialLine) {
            traceElectricPotentialLine(equipotentialLine);

            equipotentialLinesArray.addItemRemovedListener(function removalListener(removedEquipotentialLine) {
                if (removedEquipotentialLine === equipotentialLine) {
                    lineNode.removeChild(removedEquipotentialLine);
                    equipotentialLinesArray.removeItemRemovedListener(removalListener);
                }
            });
        });

        // Remove the nodes in the scene graph and clear the array of the equipotential lines in the model
        clearEquipotentialLinesProperty.link(function () {
            labelNode.removeAllChildren();
            lineNode.removeAllChildren();
            clearEquipotentialLinesProperty.value = false;
        });

        // Control the visibility of the value (voltage) labels
        valueIsVisibleProperty.linkAttribute(labelNode, 'visible');

        /**
         * Function that generates a label and a path/shape of the equipotential line
         * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
         */
        function traceElectricPotentialLine(equipotentialLine) {

            // Create and add the equipotential line
            var shape = new Shape();
            shape.moveToPoint(equipotentialLine.positionArray [0]);
            equipotentialLine.positionArray.forEach(function (position) {
                shape.lineToPoint(position);
            });

            var equipotentialLinePath = new Path(modelViewTransform.modelToViewShape(shape), {stroke: ChargesAndFieldsColors.equipotentialLine.toCSS()});
            lineNode.addChild(equipotentialLinePath);

            // link the stroke color for the default/projector mode
            ChargesAndFieldsColors.link('equipotentialLine', function (color) {
                equipotentialLinePath.stroke = color;
            });

            // Create and add the voltage label for the equipotential line
            var voltageLabelText = StringUtils.format(pattern_0value_1units, equipotentialLine.electricPotential.toFixed(1), voltageUnitString);
            var voltageLabel = new Text(voltageLabelText,
                {
                    fill: ChargesAndFieldsColors.voltageLabel.toCSS(),
                    font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
                    center: modelViewTransform.modelToViewPosition(equipotentialLine.position)
                });
            labelNode.addChild(voltageLabel);

            // link the fill color for the default/projector mode
            ChargesAndFieldsColors.link('voltageLabel', function (color) {
                voltageLabel.fill = color;
            });
        }
    }

    return inherit(Node, EquipotentialLineNode);
});
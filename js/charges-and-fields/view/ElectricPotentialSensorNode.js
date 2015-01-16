// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the ElectricFieldSensorNode which renders the sensor as a scenery node.
 * The sensor is draggable
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules

    //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var ElectricPotentialSensorPanel = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorPanel');
    var Circle = require('SCENERY/nodes/Circle');
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var Shape = require('KITE/Shape');
    var SimpleDragHandler = require('SCENERY/input/SimpleDragHandler');
    var StringUtils = require('PHETCOMMON/util/StringUtils');

    //constants
    var CIRCLE_RADIUS = 18;

    //strings
    var pattern_0value_1units = require('string!CHARGES_AND_FIELDS/pattern.0value.1units');
    var voltageUnitString = require('string!CHARGES_AND_FIELDS/voltageUnit');

    /**
     * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @param {SensorElement} electricPotentialSensor - model
     * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
     * @constructor
     */

    /**
     *
     * @param {SensorElement} electricPotentialSensor - model of the electric potential sensor
     * @param {Function} getColorElectricPotential
     * @param clearEquipotentialLines
     * @param {Function} addElectricPotentialLine
     * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
     * @constructor
     */
    function ElectricPotentialSensorNode(electricPotentialSensor, getColorElectricPotential, clearEquipotentialLines, addElectricPotentialLine, modelViewTransform) {

        var electricPotentialSensorNode = this;

        // Call the super constructor
        Node.call(this, {
            // Show a cursor hand over the sensor
            cursor: 'pointer'
        });

        // Add the centered circle
        var circle = new Circle(CIRCLE_RADIUS, {fill: 'green', stroke: 'white', lineWidth: 3, centerX: 0, centerY: 0});
        electricPotentialSensorNode.addChild(circle);

        // crosshair, starting from upper
        var crosshair = new Shape().moveTo(-CIRCLE_RADIUS, 0)
            .lineTo(CIRCLE_RADIUS, 0)
            .moveTo(0, -CIRCLE_RADIUS)
            .lineTo(0, CIRCLE_RADIUS);
        this.addChild(new Path(crosshair, {centerX: 0, centerY: 0, lineWidth: 1, stroke: 'white'}));

        var electricPotentialSensorPanel = new ElectricPotentialSensorPanel(clearEquipotentialLines, addElectricPotentialLine);
        electricPotentialSensorNode.addChild(electricPotentialSensorPanel);
        electricPotentialSensorPanel.centerX = circle.centerX;
        electricPotentialSensorPanel.top = circle.bottom;

        // Register for synchronization with model.
        electricPotentialSensor.positionProperty.link(function (position) {
            electricPotentialSensorNode.translation = modelViewTransform.modelToViewPosition(position);
        });

        electricPotentialSensor.electricPotentialProperty.link(function (electricPotential) {
            electricPotentialSensorPanel.voltageReading.text = StringUtils.format(pattern_0value_1units, electricPotential.toFixed(1), voltageUnitString);
            circle.fill = getColorElectricPotential(electricPotentialSensor.position, electricPotential).withAlpha(0.5);
        });

        // When dragging, move the charge
        electricPotentialSensorNode.addInputListener(new SimpleDragHandler(
            {
                // When dragging across it in a mobile device, pick it up
                allowTouchSnag: true,

                // Translate on drag events
                translate: function (args) {
                    electricPotentialSensor.position = modelViewTransform.viewToModelPosition(args.position);
                }
            }));
    }

    return inherit(Node, ElectricPotentialSensorNode);
});
// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric field sensor nodes
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules
    var ArrowNode = require('SCENERY_PHET/ArrowNode');
    //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var Circle = require('SCENERY/nodes/Circle');
    var inherit = require('PHET_CORE/inherit');
    // var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
    var Node = require('SCENERY/nodes/Node');
    var PhetFont = require('SCENERY_PHET/PhetFont');
    // var Path = require( 'SCENERY/nodes/Path' );
//  var Shape = require( 'KITE/Shape' );
    var SimpleDragHandler = require('SCENERY/input/SimpleDragHandler');
    var StringUtils = require('PHETCOMMON/util/StringUtils');
    var Text = require('SCENERY/nodes/Text');

    //constants
    var RAD_TO_DEGREES = 180 / Math.PI; //convert radians to degrees
    var CIRCLE_COLOR = 'orange';
    var CIRCLE_RADIUS = 7; //in pixels
    var ARROW_COLOR = 'white';
    var LABEL_COLOR = 'brown';
    var LABEL_FONT = new PhetFont({size: 18, weight: 'bold'});

    //strings
    var pattern_0value_1units = require('string!CHARGES_AND_FIELDS/pattern.0value.1units');
    var eFieldUnitString = require('string!CHARGES_AND_FIELDS/eFieldUnit');
    var angleUnit = require('string!CHARGES_AND_FIELDS/angleUnit');

    /**
     * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @param {SensorElement} electricFieldSensor
     * @param {ModelViewTransform2} modelViewTransform
     * @constructor
     */
    function ElectricFieldSensorNode(electricFieldSensor, modelViewTransform, valueIsVisibleProperty) {

        var electricFieldSensorNode = this;

        // Call the super constructor
        Node.call(electricFieldSensorNode, {

            // Show a cursor hand over the charge
            cursor: 'pointer'
        });

        // Add Arrow
        var arrowNode = new ArrowNode(0, 0, 40, 0, {
            fill: ARROW_COLOR,
            stroke: ARROW_COLOR,
            pickable: false,
            headWidth: 10
        });

        electricFieldSensorNode.addChild(arrowNode);
        arrowNode.left = 0;
        arrowNode.centerY = 0;

        // Add the centered circle
        var circle = new Circle(CIRCLE_RADIUS, {fill: CIRCLE_COLOR, stroke: 'black', centerX: 0, centerY: 0});
        electricFieldSensorNode.addChild(circle);
        circle.centerX = 0;
        circle.centerY = 0;

        // Add Legend
        var fieldStrengthLabelText = StringUtils.format(pattern_0value_1units, '?', eFieldUnitString);
        var fieldStrengthLabel = new Text(fieldStrengthLabelText, {
            fill: LABEL_COLOR,
            font: LABEL_FONT,
            pickable: false
        });
        //  var directionLabelText = StringUtils.format( pattern_0value_1units, '?', angleUnit );
        var directionLabel = new Text(fieldStrengthLabelText, {fill: LABEL_COLOR, font: LABEL_FONT, pickable: false});
        fieldStrengthLabel.top = circle.bottom;
        directionLabel.top = fieldStrengthLabel.bottom;
        electricFieldSensorNode.addChild(fieldStrengthLabel);
        electricFieldSensorNode.addChild(directionLabel);

        // Register for synchronization with model.
        electricFieldSensor.positionProperty.link(function (position) {
            electricFieldSensorNode.moveToFront();
            electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition(position);
            //electricFieldSensor.electricField = model.getElectricField(position);
        });

        electricFieldSensor.electricFieldProperty.link(function (electricField) {
            var electricFieldInView = modelViewTransform.modelToViewDelta(electricField);
            var magnitude = electricField.magnitude();
            var angle = electricFieldInView.angle(); // angle in the view

            //update strings
            var fieldMagnitudeString = magnitude.toFixed(0);
            fieldStrengthLabel.text = StringUtils.format(pattern_0value_1units, fieldMagnitudeString, eFieldUnitString);
            var angleString = (-1 * angle * RAD_TO_DEGREES).toFixed(0);// the angle is expressed in the model hence the minus sign;
            directionLabel.text = StringUtils.format(pattern_0value_1units, angleString, angleUnit);

            // update length and direction of the arrow
            arrowNode.setTailAndTip(0, 0, magnitude, 0);
            arrowNode.setRotation(angle);
        });

        valueIsVisibleProperty.link(function (isVisible) {
            fieldStrengthLabel.visible = isVisible;
            directionLabel.visible = isVisible;
        });

        // When dragging, move the charge
        electricFieldSensorNode.addInputListener(new SimpleDragHandler(
            {
                // When dragging across it in a mobile device, pick it up
                allowTouchSnag: true,

                // Translate on drag events and update electricField
                translate: function (args) {
                    electricFieldSensor.position = modelViewTransform.viewToModelPosition(args.position);
                }
            }));
    }

    return inherit(Node, ElectricFieldSensorNode);
});
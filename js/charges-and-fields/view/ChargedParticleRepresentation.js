// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the charged particle
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules

    var ChargesAndFieldsColors = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsColors');
    var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
    var Circle = require('SCENERY/nodes/Circle');
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var Shape = require('KITE/Shape');

    // constants
    var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS;// radius of a charged particle

    /**
     * Constructor for the scenery node of the charge
     * @param {number} charge
     * @constructor
     */
    function ChargedParticleRepresentation(charge) {

        Node.call(this, {
            // Show a cursor hand over the charge
            cursor: 'pointer'
        });

        assert && assert(charge === 1 || charge === -1, 'Charges should be +1 or -1');

        // Create and add the circle that represents the charge particle
        var circle = new Circle(CIRCLE_RADIUS, {
            stroke: 'black'
        });
        this.addChild(circle);

        // Determine the color of the charged particle based on its charge
        var colorFunction = function (color) {
            circle.fill = color;
        };
        if (charge === 1) {
            ChargesAndFieldsColors.link('positiveCharge', colorFunction);
        }
        else {
            ChargesAndFieldsColors.link('negativeCharge', colorFunction);
        }

        // Create and add a plus or minus sign on the center of the circle based on the charge of the particle

        var ratio = 0.5; // relative size of the sign shape relative to the radius of the Circle
        var pathOptions = {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'};
        if (charge === 1) {
            // plus Shape representing a positive charge
            var plusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0)
                .lineTo(CIRCLE_RADIUS * ratio, 0)
                .moveTo(0, -CIRCLE_RADIUS * ratio)
                .lineTo(0, CIRCLE_RADIUS * ratio);
            this.addChild(new Path(plusShape, pathOptions));
        }
        else {
            // minus Shape representing a negative charge
            var minusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0)
                .lineTo(CIRCLE_RADIUS * ratio, 0);
            this.addChild(new Path(minusShape, pathOptions));
        }
    }

    return inherit(Node, ChargedParticleRepresentation);
});
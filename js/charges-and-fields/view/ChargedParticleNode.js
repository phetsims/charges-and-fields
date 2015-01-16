// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the charged particle, which can be dragged to translate.
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules

    var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
    var Circle = require('SCENERY/nodes/Circle');
    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Path = require('SCENERY/nodes/Path');
    var Shape = require('KITE/Shape');
    var SimpleDragHandler = require('SCENERY/input/SimpleDragHandler');

    // constants
    var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS;// radius of charged particles.

    /**
     * Constructor for the ChargedParticleNode which renders the charge as a scenery node.
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @param {ChargedParticle} chargedParticle - the model of the charged particle
     * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
     * @constructor
     */
    function ChargedParticleNode(model, chargedParticle, modelViewTransform) {

        var chargedParticleNode = this;

        Node.call(chargedParticleNode, {
            // Show a cursor hand over the charge
            cursor: 'pointer'
        });

        // Set up the mouse and touch areas for this node so that this can still be grabbed when invisible.
        this.touchArea = this.localBounds.dilatedXY(10, 10);
        this.mouseArea = this.localBounds.dilatedXY(10, 10);

        // Add the centered circle

        var chargeColor;

        // determine the color of the charged Particle based on its charge: blue positive
        chargeColor = (chargedParticle.charge !== 1) ? 'blue' : 'red';

        var circle = new Circle(CIRCLE_RADIUS, {
            stroke: 'black',
            fill: chargeColor
        });

        chargedParticleNode.addChild(circle);

        // create and add shape for the circle based on the charge of the particle
        var ratio = 0.5; //
        if (chargedParticle.charge === 1) {
            // plus Shape representing the positive charges
            var plusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0)
                .lineTo(CIRCLE_RADIUS * ratio, 0)
                .moveTo(0, -CIRCLE_RADIUS * ratio)
                .lineTo(0, CIRCLE_RADIUS * ratio);
            chargedParticleNode.addChild(new Path(plusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'}));
        }
        else {
            // minus Shape representing the negative charges
            var minusShape = new Shape().moveTo(-CIRCLE_RADIUS * ratio, 0)
                .lineTo(CIRCLE_RADIUS * ratio, 0);
            chargedParticleNode.addChild(new Path(minusShape, {centerX: 0, centerY: 0, lineWidth: 3, stroke: 'white'}));
        }

        // Move the chargedParticle to the front of this layer when grabbed by the user.
        chargedParticle.userControlledProperty.link(function (userControlled) {
            if (userControlled) {
                chargedParticleNode.moveToFront();
            }
        });

        // Register for synchronization with model.
        chargedParticle.positionProperty.link(function (position, oldPosition) {
            chargedParticleNode.translation = modelViewTransform.modelToViewPosition(position);
        });

        // When dragging, move the charge
        chargedParticleNode.addInputListener(new SimpleDragHandler(
            {
                // When dragging across it in a mobile device, pick it up
                allowTouchSnag: true,
                start: function (event, trail) {
                    chargedParticle.userControlled = true;
                },
                // Translate on drag events
                translate: function (args) {
                    chargedParticle.position = modelViewTransform.viewToModelPosition(args.position);

                },
                end: function (event, trail) {
                    chargedParticle.userControlled = false;
                    if (model.chargeAndSensorEnclosureBounds.containsPoint(chargedParticle.position)) {
                        chargedParticle.animating = true;
                    }

                }
            }));

    }

    return inherit(Node, ChargedParticleNode);
});
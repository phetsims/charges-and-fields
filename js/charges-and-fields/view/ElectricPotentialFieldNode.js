// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the equipotential Lines
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define(function (require) {
    'use strict';

    // modules

    var inherit = require('PHET_CORE/inherit');
    var Node = require('SCENERY/nodes/Node');
    var Rectangle = require('SCENERY/nodes/Rectangle');
//  var RectangleWebGLDrawable = require( 'SCENERY/nodes/drawable/RectangleWebGLDrawable' );

//  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
//  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );

    /**
     *
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} showResolutionProperty
     * @constructor
     */
    function ElectricPotentialFieldNode(model, modelViewTransform, showResolutionProperty) {

        var electricPotentialFieldNode = this;
        // Call the super constructor
        Node.call(this);

        var vectorDisplacement = model.electricPotentialGrid.get(2).position.minus(model.electricPotentialGrid.get(1).position);
        var unitDistance = modelViewTransform.modelToViewDelta(vectorDisplacement).magnitude();

        model.electricPotentialGrid.forEach(function (electricPotentialSensor) {
            var positionInModel = electricPotentialSensor.position;
            //  var electricPotential = electricPotentialSensor.electricPotential;
            var positionInView = modelViewTransform.modelToViewPosition(positionInModel);
            var rect = new Rectangle(0, 0, unitDistance, unitDistance);
            rect.center = positionInView;
            electricPotentialFieldNode.addChild(rect);

            electricPotentialSensor.electricPotentialProperty.link(function (electricPotential) {
                var specialColor = model.getColorElectricPotential(positionInModel, electricPotential);
                rect.fill = specialColor;
                rect.stroke = specialColor;
            });

        });

        showResolutionProperty.link(function (isVisible) {
            electricPotentialFieldNode.visible = isVisible;

            // for performance reason, the electric potential is calculated and updated only if the check is set to visible
            if (isVisible) {
                model.electricPotentialGrid.forEach(function (sensorElement) {
                    sensorElement.electricPotential = model.getElectricPotential(sensorElement.position);
                });
            }
        });

    }

    return inherit(Node, ElectricPotentialFieldNode);
});
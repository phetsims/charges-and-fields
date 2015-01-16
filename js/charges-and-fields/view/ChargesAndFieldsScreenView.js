//  Copyright 2002-2015, University of Colorado Boulder

/**
 * Main screen View of the Charges and Fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules
    var Bounds2 = require('DOT/Bounds2');
    var ChargesAndFieldsColors = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsColors');
    //var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
    var ChargeAndSensorEnclosure = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargeAndSensorEnclosure');
    var ChargedParticleNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode');
    //var ChargedParticleCreatorNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleCreatorNode');
    var ControlPanel = require('CHARGES_AND_FIELDS/charges-and-fields/view/ControlPanel');
    var ElectricFieldSensorNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode');
    var ElectricPotentialSensorNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode');
    var ElectricPotentialFieldNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldNode');
    //var ElectricPotentialFieldWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldWebGLNode' );
    var ElectricFieldGridNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldGridNode');
    var EquipotentialLineNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/EquipotentialLineNode');
    var ElectricFieldLineNode = require('CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldLineNode');
    var Grid = require('CHARGES_AND_FIELDS/charges-and-fields/view/Grid');
    var HSlider = require('SUN/HSlider');
    var Image = require('SCENERY/nodes/Image');
    var inherit = require('PHET_CORE/inherit');
    var MeasuringTape = require('SCENERY_PHET/MeasuringTape');
    var ModelViewTransform2 = require('PHETCOMMON/view/ModelViewTransform2');
    var Node = require('SCENERY/nodes/Node');
    var Property = require('AXON/Property');
//  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
    // var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    var ResetAllButton = require('SCENERY_PHET/buttons/ResetAllButton');
    var ScreenView = require('JOIST/ScreenView');
//  var Shape = require( 'KITE/Shape' );
//  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
//  var Text = require( 'SCENERY/nodes/Text' );
    var Util = require('SCENERY/util/Util');
    var Vector2 = require('DOT/Vector2');

    //constants

//  var LABEL_COLOR = 'brown';
//  var LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );

    //strings

//  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
//  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

    // images
    var mockup01Image = require('image!CHARGES_AND_FIELDS/mockup01.png');
    var mockup02Image = require('image!CHARGES_AND_FIELDS/mockup02.png');

    /**
     *
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @constructor
     */
    function ChargesAndFieldsScreenView(model) {

        ScreenView.call(this, {renderer: 'svg', layoutBounds: new Bounds2(0, 0, 1024, 618)});
        var thisView = this;

        //model View transform : The origin of the model is sets in the middle of the screen
        // there are 5 meters across the height of the sim.
        var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
            Vector2.ZERO,
            new Vector2(thisView.layoutBounds.width / 2, thisView.layoutBounds.height / 2),
            thisView.layoutBounds.height / 5);

        // Check to see if WebGL was prevented by a query parameter
        var allowWebGL = window.phetcommon.getQueryParameter('webgl') !== 'false';
        var webGLSupported = Util.isWebGLSupported && allowWebGL;
        var renderer = webGLSupported ? 'webgl' : 'svg';
        // create and add the electric Potential field Node responsible for the electric potential field
        var electricPotentialFieldNode = (renderer === 'webgl') ? new ElectricPotentialFieldNode(model.electricPotentialGrid, model.getColorElectricPotential.bind(model), modelViewTransform, model.showResolutionProperty) :
            new ElectricPotentialFieldNode(model.electricPotentialGrid, model.getColorElectricPotential.bind(model), modelViewTransform, model.showResolutionProperty);
        this.addChild(electricPotentialFieldNode);

        // Create and add the visual grid on the view
        var grid = new Grid(modelViewTransform, model.gridIsVisibleProperty);
        this.addChild(grid);

        // create and add the grid with electric field arrow sensors
        var electricFieldGridNode = new ElectricFieldGridNode(model.electricFieldSensorGrid, model.getColorElectricFieldMagnitude.bind(model), modelViewTransform, model.eFieldIsVisibleProperty);
        this.addChild(electricFieldGridNode);

        // Create
        var equipotentialLineNode = new EquipotentialLineNode(model.equipotentialLinesArray, model.clearEquipotentialLinesProperty, modelViewTransform, model.valueIsVisibleProperty);

        this.addChild(equipotentialLineNode);

        // Create
        var electricFieldLineNode = new ElectricFieldLineNode(model.electricFieldLinesArray, model.clearElectricFieldLinesProperty, modelViewTransform);
        this.addChild(electricFieldLineNode);

        // create and add the Measuring Tape
        var tape_options = {
            textColor: 'white',
            dragBounds: thisView.layoutBounds.eroded(5),
            modelViewTransform: modelViewTransform
        };

        var measuringTape = new MeasuringTape(model.tapeMeasureUnitsProperty, model.tapeMeasureIsVisibleProperty,
            tape_options);
        this.addChild(measuringTape);

        // Create and add the Reset All Button in the bottom right, which resets the model
        var resetAllButton = new ResetAllButton({
            listener: function () {
                thisView.reset();
                model.reset();
                measuringTape.reset();
                equipotentialLineNode.removeAllChildren();
                electricFieldLineNode.removeAllChildren();
            },
            right: this.layoutBounds.maxX - 10,
            bottom: this.layoutBounds.maxY - 10
        });
        this.addChild(resetAllButton);

        ChargesAndFieldsColors.linkAttribute('controlPanelText', resetAllButton, 'fill');

        // Create the nodes that will be used to layer things visually.
        var backLayer = new Node();
        this.addChild(backLayer);
//    Create the layer where the points will be placed. They are maintained in a separate layer so that they are over
//     all of the point placement graphs in the z-order.
        var chargedParticlesLayer = new Node({layerSplit: true}); // Force the moving dataPoint into a separate layer for performance reasons.

        // Handle the comings and goings of  dataPoints.
        model.chargedParticles.addItemAddedListener(function (addedChargedParticle) {

            // Create and add the view representation for this chargedParticle.
            var chargedParticleNode = new ChargedParticleNode(model, addedChargedParticle, modelViewTransform);
            chargedParticlesLayer.addChild(chargedParticleNode);

            // Add the removal listener for if and when this chargedParticle is removed from the model.
            model.chargedParticles.addItemRemovedListener(function removalListener(removedChargedParticle) {
                if (removedChargedParticle === addedChargedParticle) {
                    chargedParticlesLayer.removeChild(chargedParticleNode);
                    model.chargedParticles.removeItemRemovedListener(removalListener);
                }
            });
        });

        // Create and add the control panel
        var controlPanel = new ControlPanel(model);
        this.addChild(controlPanel);

        // Create and add the electric potential sensor node (with panel)
        var electricPotentialSensorNode = new ElectricPotentialSensorNode(model.electricPotentialSensor,
                model.getColorElectricPotential.bind(model), model.clearEquipotentialLines, model.addElectricPotentialLine.bind(model), modelViewTransform
            )
            ;
        this.addChild(electricPotentialSensorNode);

        // create and add the electric Field sensors
        var parentElectricFieldSensorsNode = new Node();
        model.electricFieldSensors.forEach(function (electricFieldSensor) {
            parentElectricFieldSensorsNode.addChild(new ElectricFieldSensorNode(electricFieldSensor, modelViewTransform, model.valueIsVisibleProperty));
        });
        this.addChild(parentElectricFieldSensorsNode);
        this.addChild(chargedParticlesLayer);

        // Create and add the control panel
        controlPanel.right = thisView.layoutBounds.maxX - 20;
        controlPanel.top = 20;

        grid.centerX = thisView.layoutBounds.centerX;
        grid.centerY = thisView.layoutBounds.centerY;

        //TODO: Delete when done with the layout
        ////////////////////////////////////////////////////////////////
        //Show the mock-up and a slider to change its transparency
        //////////////////////////////////////////////////////////////
        var mockup01OpacityProperty = new Property(0.02);
        var mockup02OpacityProperty = new Property(0.02);

        var image01 = new Image(mockup01Image, {pickable: false});
        var image02 = new Image(mockup02Image, {pickable: false});

        image01.scale(this.layoutBounds.height / image01.height);
        image02.scale(this.layoutBounds.height / image02.height);

        mockup01OpacityProperty.linkAttribute(image01, 'opacity');
        mockup02OpacityProperty.linkAttribute(image02, 'opacity');
        this.addChild(image01);
        this.addChild(image02);

        this.addChild(new HSlider(mockup02OpacityProperty, {min: 0, max: 1}, {top: 200, left: 20}));
        this.addChild(new HSlider(mockup01OpacityProperty, {min: 0, max: 1}, {top: 300, left: 20}));
        /////////////////////////////////////////////////////////////////////////

        // Create and add the charge and sensor enclosure (including the charges and sensors)
        var chargeAndSensorEnclosure = new ChargeAndSensorEnclosure(model, model.chargeAndSensorEnclosureBounds, modelViewTransform);
        backLayer.addChild(chargeAndSensorEnclosure);

    }

    return inherit(ScreenView, ChargesAndFieldsScreenView, {
        reset: function () {
        }
    });
});
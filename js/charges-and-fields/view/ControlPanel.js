// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the Sim
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // imports
    var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
    var inherit = require('PHET_CORE/inherit');
    var Panel = require('SUN/Panel');
    var Text = require('SCENERY/nodes/Text');
    var VerticalCheckBoxGroup = require('SUN/VerticalCheckBoxGroup');

    // strings
    var electricFieldString = require('string!CHARGES_AND_FIELDS/electricField');
    var directionOnlyString = require('string!CHARGES_AND_FIELDS/directionOnly');
    var voltageString = require('string!CHARGES_AND_FIELDS/voltage');
    var gridString = require('string!CHARGES_AND_FIELDS/grid');
    var valuesString = require('string!CHARGES_AND_FIELDS/values');
    var tapeMeasureString = require('string!CHARGES_AND_FIELDS/tapeMeasure');

    /**
     * Control panel constructor
     * @param {ChargesAndFieldsModel} model - main model of the simulation
     * @constructor
     */
    function ControlPanel(model) {

        var checkBoxTextOptions = {
            font: ChargesAndFieldsConstants.CHECK_BOX_FONT,
            fill: ChargesAndFieldsConstants.CHECK_BOX_TEXT_FILL
        };

        var checkBoxGroup = new VerticalCheckBoxGroup([
            {
                content: new Text(electricFieldString, checkBoxTextOptions),
                property: model.eFieldIsVisibleProperty,
                indent: 0
            },
            {
                content: new Text(directionOnlyString, checkBoxTextOptions),
                property: model.directionOnlyIsVisibleProperty,
                indent: 20
            },
            {
                content: new Text(voltageString, checkBoxTextOptions),
                property: model.showResolutionProperty,
                indent: 0
            },
            {
                content: new Text(valuesString, checkBoxTextOptions),
                property: model.showNumbersIsVisibleProperty,
                indent: 0
            },
            {
                content: new Text(gridString, checkBoxTextOptions),
                property: model.gridIsVisibleProperty,
                indent: 0
            },
            {
                content: new Text(tapeMeasureString, checkBoxTextOptions),
                property: model.tapeMeasureIsVisibleProperty,
                indent: 0
            }
        ], {
            spacing: 15, // vertical spacing
            padding: 12, // padding to the left,
            boxWidth: 28,
            checkBoxColor: 'white',
            checkBoxColorDisabled: 'gray',
            checkBoxColorBackground: 'black'
        });

        model.eFieldIsVisibleProperty.link(function (visible) {

        });

        Panel.call(this, checkBoxGroup, {
            fill: ChargesAndFieldsConstants.PANEL_FILL,
            stroke: ChargesAndFieldsConstants.PANEL_STROKE,
            lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
            xMargin: 10,
            yMargin: 5
        });

    }

    return inherit(Panel, ControlPanel);

});
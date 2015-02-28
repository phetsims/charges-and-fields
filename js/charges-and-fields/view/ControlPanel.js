// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // imports
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var CheckBox = require( 'SUN/CheckBox' );
  var HStrut = require( 'SUN/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var electricFieldString = require( 'string!CHARGES_AND_FIELDS/electricField' );
  var directionOnlyString = require( 'string!CHARGES_AND_FIELDS/directionOnly' );
  var voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );
  var equipotentialSensorString = require( 'string!CHARGES_AND_FIELDS/equipotentialSensor' );
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var valuesString = require( 'string!CHARGES_AND_FIELDS/values' );
  var tapeMeasureString = require( 'string!CHARGES_AND_FIELDS/tapeMeasure' );

  /**
   * Control panel constructor
   * @param {Property.<boolean>} isElectricFieldGridVisibleProperty
   * @param {Property.<boolean>} isDirectionOnlyElectricFieldGridVisibleProperty
   * @param {Property.<boolean>} isElectricPotentialGridVisibleProperty
   * @param {Property.<boolean>} isElectricPotentialSensorVisibleProperty
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @param {Property.<boolean>} isGridVisibleProperty
   * @param {Property.<boolean>} isTapeMeasureVisibleProperty
   * @constructor
   */
  function ControlPanel( isElectricFieldGridVisibleProperty,
                         isDirectionOnlyElectricFieldGridVisibleProperty,
                         isElectricPotentialGridVisibleProperty,
                         isElectricPotentialSensorVisibleProperty,
                         isValuesVisibleProperty,
                         isGridVisibleProperty,
                         isTapeMeasureVisibleProperty ) {

    var controlPanel = this;

    var textOptions = {
      font: ChargesAndFieldsConstants.CHECK_BOX_FONT
    };

    var checkBoxOptions = {
      boxWidth: 25,
      spacing: 7
    };

    var panelOptions = {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10
    };

    var electricFieldText = new Text( electricFieldString, textOptions );
    var directionOnlyText = new Text( directionOnlyString, textOptions );
    var voltageText = new Text( voltageString, textOptions );
    var equipotentialSensorText = new Text( equipotentialSensorString, textOptions );
    var valuesText = new Text( gridString, textOptions );
    var gridText = new Text( valuesString, textOptions );
    var tapeMeasureText = new Text( tapeMeasureString, textOptions );

    var electricFieldCheckBox = new CheckBox( electricFieldText, isElectricFieldGridVisibleProperty, checkBoxOptions );
    var directionOnlyCheckBox = new CheckBox( directionOnlyText, isDirectionOnlyElectricFieldGridVisibleProperty, checkBoxOptions );
    var voltageCheckBox = new CheckBox( voltageText, isElectricPotentialGridVisibleProperty, checkBoxOptions );
    var equipotentialSensorCheckBox = new CheckBox( equipotentialSensorText, isElectricPotentialSensorVisibleProperty, checkBoxOptions );
    var valuesCheckBox = new CheckBox( gridText, isValuesVisibleProperty, checkBoxOptions );
    var gridCheckBox = new CheckBox( valuesText, isGridVisibleProperty, checkBoxOptions );
    var tapeMeasureCheckBox = new CheckBox( tapeMeasureText, isTapeMeasureVisibleProperty, checkBoxOptions );

    var directionOnlyGroup = new Node();
    var hStrut = new HStrut( 25 );
    directionOnlyCheckBox.left = hStrut.right;
    directionOnlyGroup.addChild( hStrut );
    directionOnlyGroup.addChild( directionOnlyCheckBox );

    isElectricFieldGridVisibleProperty.link( function( enabled ) {
      directionOnlyCheckBox.enabled = enabled;
      directionOnlyText.fill = enabled ? ChargesAndFieldsColors.controlPanelText : ChargesAndFieldsColors.controlPanelTextDisabled;
    } );

    var checkBoxGroup = new VBox( {
      spacing: 12, children: [
        electricFieldCheckBox,
        directionOnlyGroup,
        voltageCheckBox,
        equipotentialSensorCheckBox,
        valuesCheckBox,
        gridCheckBox,
        tapeMeasureCheckBox
      ], align: 'left'
    } );

    Panel.call( this, checkBoxGroup, panelOptions );

    ChargesAndFieldsColors.link( 'controlPanelFill', function( color ) {
      controlPanel.background.fill = color;
    } );

    ChargesAndFieldsColors.link( 'controlPanelBorder', function( color ) {
      controlPanel.stroke = color;
    } );

    //ChargesAndFieldsColors.link( 'controlPanelTextDisabled', function( color ) {
    //  electricFieldText.fillDisabled = color;
    //  directionOnlyText.fillDisable = color;
    //  voltageText.fillDisabled = color;
    //  valuesText.fillDisabled = color;
    //  gridText.fillDisable = color;
    //  tapeMeasureText.fillDisabled = color;
    //} );

    ChargesAndFieldsColors.link( 'controlPanelText', function( color ) {
      electricFieldText.fill = color;
      // TODO another hack
      directionOnlyText.fill = isElectricFieldGridVisibleProperty.value ? color : ChargesAndFieldsColors.controlPanelTextDisabled;
      voltageText.fill = color;
      equipotentialSensorText.fill = color;
      valuesText.fill = color;
      gridText.fill = color;
      tapeMeasureText.fill = color;
    } );

    ChargesAndFieldsColors.link( 'checkBox', function( color ) {
      electricFieldCheckBox.checkBoxColor = color;
      directionOnlyCheckBox.checkBoxColor = color;
      voltageCheckBox.checkBoxColor = color;
      equipotentialSensorCheckBox.checkBoxColor = color;
      valuesCheckBox.checkBoxColor = color;
      gridCheckBox.checkBoxColor = color;
      tapeMeasureCheckBox.checkBoxColor = color;
    } );

    ChargesAndFieldsColors.link( 'checkBoxDisabled', function( color ) {
      electricFieldCheckBox.checkBoxColorDisabled = color;
      directionOnlyCheckBox.checkBoxColorDisabled = color;
      voltageCheckBox.checkBoxColorDisabled = color;
      equipotentialSensorCheckBox.checkBoxColorDisabled = color;
      valuesCheckBox.checkBoxColorDisabled = color;
      gridCheckBox.checkBoxColorDisabled = color;
      tapeMeasureCheckBox.checkBoxColorDisabled = color;
    } );

    ChargesAndFieldsColors.link( 'checkBoxBackground', function( color ) {
      electricFieldCheckBox.checkBoxColorBackground = color;
      directionOnlyCheckBox.checkBoxColorBackground = color;
      voltageCheckBox.checkBoxColorBackground = color;
      equipotentialSensorCheckBox.checkBoxColorBackground = color;
      valuesCheckBox.checkBoxColorBackground = color;
      gridCheckBox.checkBoxColorBackground = color;
      tapeMeasureCheckBox.checkBoxColorBackground = color;
    } );

  }

  return inherit( Panel, ControlPanel );

} )
;
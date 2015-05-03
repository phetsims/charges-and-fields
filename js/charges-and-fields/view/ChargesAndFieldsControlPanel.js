// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
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
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var valuesString = require( 'string!CHARGES_AND_FIELDS/values' );

  /**
   * Control panel constructor
   * @param {Property.<boolean>} isElectricFieldGridVisibleProperty
   * @param {Property.<boolean>} isDirectionOnlyElectricFieldGridVisibleProperty
   * @param {Property.<boolean>} isElectricPotentialGridVisibleProperty
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @param {Property.<boolean>} isGridVisibleProperty
   * @constructor
   */
  function ChargesAndFieldsControlPanel( isElectricFieldGridVisibleProperty,
                                         isDirectionOnlyElectricFieldGridVisibleProperty,
                                         isElectricPotentialGridVisibleProperty,
                                         isValuesVisibleProperty,
                                         isGridVisibleProperty ) {

    var controlPanel = this;

    // various options for text, checkbox and panel
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

    // create text nodes for the checkboxes
    var electricFieldText = new Text( electricFieldString, textOptions );
    var directionOnlyText = new Text( directionOnlyString, textOptions );
    var voltageText = new Text( voltageString, textOptions );
    var valuesText = new Text( gridString, textOptions );
    var gridText = new Text( valuesString, textOptions );

    // create checkboxes
    var electricFieldCheckBox = new CheckBox( electricFieldText, isElectricFieldGridVisibleProperty, checkBoxOptions );
    var directionOnlyCheckBox = new CheckBox( directionOnlyText, isDirectionOnlyElectricFieldGridVisibleProperty, checkBoxOptions );
    var voltageCheckBox = new CheckBox( voltageText, isElectricPotentialGridVisibleProperty, checkBoxOptions );
    var valuesCheckBox = new CheckBox( gridText, isValuesVisibleProperty, checkBoxOptions );
    var gridCheckBox = new CheckBox( valuesText, isGridVisibleProperty, checkBoxOptions );

    // the checkbox 'direction only' needs to be indented with respect to the other checkboxes
    var directionOnlyGroup = new Node();
    var hStrut = new HStrut( 25 ); // some arbitrary number that looks good.
    directionOnlyCheckBox.left = hStrut.right;
    directionOnlyGroup.addChild( hStrut );
    directionOnlyGroup.addChild( directionOnlyCheckBox );

    var checkBoxGroup = new VBox( {
      spacing: 12, children: [
        electricFieldCheckBox,
        directionOnlyGroup, // contains the directionOnlyCheckBox
        voltageCheckBox,
        valuesCheckBox,
        gridCheckBox
      ], align: 'left'
    } );

    // add the checkbox group to the panel
    Panel.call( this, checkBoxGroup, panelOptions );

    //---------------
    //  Apply the projector/default color scheme to the components of the control panel
    //--------------

    ChargesAndFieldsColors.controlPanelFillProperty.link( function( color ) {
      controlPanel.background.fill = color;
    } );

    ChargesAndFieldsColors.controlPanelBorderProperty.link( function( color ) {
      controlPanel.stroke = color;
    } );

    // update the text fill of all the check boxes
    ChargesAndFieldsColors.controlPanelTextProperty.link( function( color ) {
      electricFieldText.fill = color;
      directionOnlyText.fill = color;
      voltageText.fill = color;
      valuesText.fill = color;
      gridText.fill = color;
    } );

    isElectricFieldGridVisibleProperty.link( function( enabled ) {
      directionOnlyCheckBox.enabled = enabled;
    } );

    // convenience variable, includes all the checkBoxes
    var checkBoxArray = [
      electricFieldCheckBox,
      directionOnlyCheckBox,
      voltageCheckBox,
      valuesCheckBox,
      gridCheckBox
    ];

    ChargesAndFieldsColors.checkBoxProperty.link( function( color ) {
      checkBoxArray.forEach( function( checkBox ) {
        checkBox.checkBoxColor = color;
      } );
    } );

    ChargesAndFieldsColors.checkBoxBackgroundProperty.link( function( color ) {
      checkBoxArray.forEach( function( checkBox ) {
        checkBox.checkBoxColorBackground = color;
      } );
    } );

  }

  return inherit( Panel, ChargesAndFieldsControlPanel );

} );
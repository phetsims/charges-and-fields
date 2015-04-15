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
  var DerivedProperty = require( 'AXON/DerivedProperty' );
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
                         isGridVisibleProperty) {

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
    var valuesText = new Text( gridString, textOptions );
    var gridText = new Text( valuesString, textOptions );

    var electricFieldCheckBox = new CheckBox( electricFieldText, isElectricFieldGridVisibleProperty, checkBoxOptions );
    var directionOnlyCheckBox = new CheckBox( directionOnlyText, isDirectionOnlyElectricFieldGridVisibleProperty, checkBoxOptions );
    var voltageCheckBox = new CheckBox( voltageText, isElectricPotentialGridVisibleProperty, checkBoxOptions );
    var valuesCheckBox = new CheckBox( gridText, isValuesVisibleProperty, checkBoxOptions );
    var gridCheckBox = new CheckBox( valuesText, isGridVisibleProperty, checkBoxOptions );

    var directionOnlyGroup = new Node();
    var hStrut = new HStrut( 25 );
    directionOnlyCheckBox.left = hStrut.right;
    directionOnlyGroup.addChild( hStrut );
    directionOnlyGroup.addChild( directionOnlyCheckBox );

    var checkBoxGroup = new VBox( {
      spacing: 12, children: [
        electricFieldCheckBox,
        directionOnlyGroup,
        voltageCheckBox,
        valuesCheckBox,
        gridCheckBox,
      ], align: 'left'
    } );

    Panel.call( this, checkBoxGroup, panelOptions );

    ChargesAndFieldsColors.controlPanelFillProperty.link( function( color ) {
      controlPanel.background.fill = color;
    } );

    ChargesAndFieldsColors.controlPanelBorderProperty.link( function( color ) {
      controlPanel.stroke = color;
    } );

    // update the text fill of all the check boxes except directionOnlyCheckBox
    ChargesAndFieldsColors.controlPanelTextProperty.link( function( color ) {
      electricFieldText.fill = color;
      voltageText.fill = color;
      valuesText.fill = color;
      gridText.fill = color;
    } );

    // create a derived property to be used for the content of directionOnlyCheckBox
    var directionOnlyTextFillProperty = new DerivedProperty( [
        isElectricFieldGridVisibleProperty,
        ChargesAndFieldsColors.controlPanelTextProperty,
        ChargesAndFieldsColors.controlPanelTextDisabledProperty ],
      function( isElectricFieldGridVisible, controlPanelText, controlPanelDisabledText ) {
        if ( isElectricFieldGridVisible ) {
          return controlPanelText;
        }
        else {
          return controlPanelDisabledText;
        }
      } );

    // update the text fill of the directionOnlyCheckBox checkBox
    directionOnlyTextFillProperty.link( function( directionOnlyTextFill ) {
      directionOnlyText.fill = directionOnlyTextFill;
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
      gridCheckBox,
    ];

    ChargesAndFieldsColors.checkBoxProperty.link( function( color ) {
      checkBoxArray.forEach( function( checkBox ) {
        checkBox.checkBoxColor = color;
      } );
    } );

    ChargesAndFieldsColors.checkBoxDisabledProperty.link( function( color ) {
      checkBoxArray.forEach( function( checkBox ) {
        checkBox.checkBoxColorDisabled = color;
      } );
    } );

    ChargesAndFieldsColors.checkBoxBackgroundProperty.link( function( color ) {
      checkBoxArray.forEach( function( checkBox ) {
        checkBox.checkBoxColorBackground = color;
      } );
    } );

    // this will only work on change of profile, not for the initialization...
    //ChargesAndFieldsColors.on( 'profileChanged', function() {
    //  checkBoxArray.forEach( function( checkBox ) {
    //    checkBox.checkBoxColor = ChargesAndFieldsColors.checkBox;
    //    checkBox.checkBoxColorBackground = ChargesAndFieldsColors.checkBoxBackground;
    //    checkBox.checkBoxColorDisabled = ChargesAndFieldsColors.checkBoxDisabled;
    //  } )
    //} );

  }

  return inherit( Panel, ChargesAndFieldsControlPanel );

} )
;
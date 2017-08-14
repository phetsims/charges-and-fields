// Copyright 2014-2015, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Panel = require( 'SUN/Panel' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // strings
  var electricFieldString = require( 'string!CHARGES_AND_FIELDS/electricField' );
  var directionOnlyString = require( 'string!CHARGES_AND_FIELDS/directionOnly' );
  var voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var valuesString = require( 'string!CHARGES_AND_FIELDS/values' );
  var snapToGridString = require( 'string!CHARGES_AND_FIELDS/snapToGrid' );

  /**
   * @constructor
   *
   * @param {ChargesAndFieldsModel} model
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsControlPanel( model, tandem ) {

    // @private
    this.model = model;

    /**
     * checkbox factory
     * @param tandemId
     * @param {string} string
     * @param {Property.<boolean>} property
     * @returns {CheckBox}
     */
    function createCheckBox( tandemId, string, property ) {
      var text = new Text( string, {
        font: ChargesAndFieldsConstants.CHECK_BOX_FONT,
        fill: ChargesAndFieldsColorProfile.controlPanelTextProperty,
        maxWidth: 250
      } );

      return new CheckBox( text, property, {
        tandem: tandem.createTandem( tandemId ),
        boxWidth: 25,
        spacing: 7,
        checkBoxColor: ChargesAndFieldsColorProfile.checkBoxProperty,
        checkBoxColorBackground: ChargesAndFieldsColorProfile.checkBoxBackgroundProperty
      } );
    }

    /**
     * indent the checkbox
     * @param {CheckBox} checkBox
     * @returns {Node}
     */
    function createIndentedNode( checkBox ) {
      var node = new Node();
      var hStrut = new HStrut( 25 ); // some arbitrary number that looks good.
      checkBox.left = hStrut.right;
      node.setChildren( [ hStrut, checkBox ] );
      return node;
    }

    // create checkboxes
    var electricFieldCheckBox = createCheckBox( 'electricFieldCheckBox', electricFieldString, model.isElectricFieldVisibleProperty );
    var directionOnlyCheckBox = createCheckBox( 'directionOnlyCheckBox', directionOnlyString, model.isElectricFieldDirectionOnlyProperty );
    var voltageCheckBox = createCheckBox( 'voltageCheckBox', voltageString, model.isElectricPotentialVisibleProperty );
    var valuesCheckBox = createCheckBox( 'valuesCheckBox', valuesString, model.areValuesVisibleProperty );
    var gridCheckBox = createCheckBox( 'gridCheckBox', gridString, model.isGridVisibleProperty );
    var snapToGridCheckBox = createCheckBox( 'snapToGridCheckBox', snapToGridString, model.snapToGridProperty );

    // some of the checkboxes need to be indented with respect to the other checkboxes
    var directionOnlyGroup = createIndentedNode( directionOnlyCheckBox );
    var snapToGridGroup = createIndentedNode( snapToGridCheckBox );

    // @private
    this.toggleNodes = [
      electricFieldCheckBox,
      directionOnlyGroup,
      voltageCheckBox,
      valuesCheckBox,
      gridCheckBox,
      snapToGridGroup
    ];

    // @private
    this.checkBoxGroup = new VBox( {
      spacing: 12,
      children: this.toggleNodes,
      align: 'left'
    } );

    // add the checkbox group to the panel
    Panel.call( this, this.checkBoxGroup, {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10,
      fill: ChargesAndFieldsColorProfile.controlPanelFillProperty,
      stroke: ChargesAndFieldsColorProfile.controlPanelBorderProperty,
      tandem: tandem
    } );

    model.isElectricFieldVisibleProperty.linkAttribute( directionOnlyCheckBox, 'enabled' );

    model.isGridVisibleProperty.linkAttribute( snapToGridCheckBox, 'enabled' );
  }

  chargesAndFields.register( 'ChargesAndFieldsControlPanel', ChargesAndFieldsControlPanel );

  return inherit( Panel, ChargesAndFieldsControlPanel );
} );

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
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // phet-io modules
  var TPanel = require( 'ifphetio!PHET_IO/types/sun/TPanel' );

  // strings
  var electricFieldString = require( 'string!CHARGES_AND_FIELDS/electricField' );
  var directionOnlyString = require( 'string!CHARGES_AND_FIELDS/directionOnly' );
  var voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var valuesString = require( 'string!CHARGES_AND_FIELDS/values' );

  /**
   * @constructor
   *
   * @param {ChargesAndFieldsModel} model
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsControlPanel( model, tandem ) {

    // @private
    this.model = model;

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

    // create checkboxes
    var electricFieldCheckBox = createCheckBox( 'electricFieldCheckBox', electricFieldString, model.isElectricFieldVisibleProperty );
    var directionOnlyCheckBox = createCheckBox( 'directionOnlyCheckBox', directionOnlyString, model.isElectricFieldDirectionOnlyProperty );
    var voltageCheckBox = createCheckBox( 'voltageCheckBox', voltageString, model.isElectricPotentialVisibleProperty );
    var valuesCheckBox = createCheckBox( 'valuesCheckBox', valuesString, model.areValuesVisibleProperty );
    var gridCheckBox = createCheckBox( 'gridCheckBox', gridString, model.isGridVisibleProperty );

    // the checkbox 'direction only' needs to be indented with respect to the other checkboxes
    var directionOnlyGroup = new Node();
    var hStrut = new HStrut( 25 ); // some arbitrary number that looks good.
    directionOnlyCheckBox.left = hStrut.right;
    directionOnlyGroup.addChild( hStrut );
    directionOnlyGroup.addChild( directionOnlyCheckBox );

    electricFieldCheckBox.hideTogglingProperty = model.hideTogglingElectricFieldVisibilityProperty;
    directionOnlyGroup.hideTogglingProperty = new DerivedProperty( [
      model.hideTogglingElectricFieldVisibilityProperty,
      model.hideTogglingElectricFieldDirectionOnlyProperty ],
      function( hideEF, hideDirectionOnly ) { return hideEF || hideDirectionOnly; } ); // NOTE: set on group
    voltageCheckBox.hideTogglingProperty = model.hideTogglingElectricPotentialVisibilityProperty;
    valuesCheckBox.hideTogglingProperty = model.hideTogglingValuesVisibilityProperty;
    gridCheckBox.hideTogglingProperty = model.hideTogglingGridVisibilityProperty;

    // @private
    this.toggleNodes = [
      electricFieldCheckBox,
      directionOnlyGroup,
      voltageCheckBox,
      valuesCheckBox,
      gridCheckBox
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
      stroke: ChargesAndFieldsColorProfile.controlPanelBorderProperty
    } );

    model.isElectricFieldVisibleProperty.linkAttribute( directionOnlyCheckBox, 'enabled' );

    // Ensure that we remove children that should be hidden
    model.multilink( [
      'hideTogglingElectricFieldVisibility',
      'hideTogglingElectricFieldDirectionOnly',
      'hideTogglingElectricPotentialVisibility',
      'hideTogglingValuesVisibility',
      'hideTogglingGridVisibility'
    ], this.updateHiddenChildren.bind( this ) );

    tandem.addInstance( this, TPanel );
  }

  chargesAndFields.register( 'ChargesAndFieldsControlPanel', ChargesAndFieldsControlPanel );

  return inherit( Panel, ChargesAndFieldsControlPanel, {
    /**
     * Removes children that should be hidden
     * @private
     */
    updateHiddenChildren: function() {
      this.checkBoxGroup.children = this.toggleNodes.filter( function( toggleNode ) {
        return !toggleNode.hideTogglingProperty.value;
      } );

      this.visible = this.model.isElectricFieldVisible ||
                     this.model.isElectricPotentialVisible ||
                     this.model.areValuesVisible ||
                     this.model.isGridVisible;
    }
  } );

} );
// Copyright 2014-2017, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Checkbox = require( 'SUN/Checkbox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var directionOnlyString = require( 'string!CHARGES_AND_FIELDS/directionOnly' );
  var electricFieldString = require( 'string!CHARGES_AND_FIELDS/electricField' );
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var snapToGridString = require( 'string!CHARGES_AND_FIELDS/snapToGrid' );
  var valuesString = require( 'string!CHARGES_AND_FIELDS/values' );
  var voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );

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
     * @returns {Checkbox}
     */
    function createCheckbox( tandemId, string, property ) {
      var text = new Text( string, {
        font: ChargesAndFieldsConstants.CHECK_BOX_FONT,
        fill: ChargesAndFieldsColorProfile.controlPanelTextProperty,
        maxWidth: 250
      } );

      return new Checkbox( text, property, {
        tandem: tandem.createTandem( tandemId ),
        boxWidth: 25,
        spacing: 7,
        checkboxColor: ChargesAndFieldsColorProfile.checkboxProperty,
        checkboxColorBackground: ChargesAndFieldsColorProfile.checkboxBackgroundProperty
      } );
    }

    /**
     * indent the checkbox
     * @param {Checkbox} checkbox
     * @returns {Node}
     */
    function createIndentedNode( checkbox ) {
      var node = new Node();
      var hStrut = new HStrut( 25 ); // some arbitrary number that looks good.
      checkbox.left = hStrut.right;
      node.setChildren( [ hStrut, checkbox ] );
      return node;
    }

    // create checkboxes
    var electricFieldCheckbox = createCheckbox( 'electricFieldCheckbox', electricFieldString, model.isElectricFieldVisibleProperty );
    var directionOnlyCheckbox = createCheckbox( 'directionOnlyCheckbox', directionOnlyString, model.isElectricFieldDirectionOnlyProperty );
    var voltageCheckbox = createCheckbox( 'voltageCheckbox', voltageString, model.isElectricPotentialVisibleProperty );
    var valuesCheckbox = createCheckbox( 'valuesCheckbox', valuesString, model.areValuesVisibleProperty );
    var gridCheckbox = createCheckbox( 'gridCheckbox', gridString, model.isGridVisibleProperty );
    var snapToGridCheckbox = createCheckbox( 'snapToGridCheckbox', snapToGridString, model.snapToGridProperty );

    // some of the checkboxes need to be indented with respect to the other checkboxes
    var directionOnlyGroup = createIndentedNode( directionOnlyCheckbox );
    var snapToGridGroup = createIndentedNode( snapToGridCheckbox );

    // @private
    this.toggleNodes = [
      electricFieldCheckbox,
      directionOnlyGroup,
      voltageCheckbox,
      valuesCheckbox,
      gridCheckbox,
      snapToGridGroup
    ];

    // @private
    this.checkboxGroup = new VBox( {
      spacing: 12,
      children: this.toggleNodes,
      align: 'left'
    } );

    // add the checkbox group to the panel
    Panel.call( this, this.checkboxGroup, {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10,
      fill: ChargesAndFieldsColorProfile.controlPanelFillProperty,
      stroke: ChargesAndFieldsColorProfile.controlPanelBorderProperty,
      tandem: tandem
    } );

    model.isElectricFieldVisibleProperty.linkAttribute( directionOnlyCheckbox, 'enabled' );

    model.isGridVisibleProperty.linkAttribute( snapToGridCheckbox, 'enabled' );
  }

  chargesAndFields.register( 'ChargesAndFieldsControlPanel', ChargesAndFieldsControlPanel );

  return inherit( Panel, ChargesAndFieldsControlPanel );
} );

// Copyright 2014-2019, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const Checkbox = require( 'SUN/Checkbox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const directionOnlyString = require( 'string!CHARGES_AND_FIELDS/directionOnly' );
  const electricFieldString = require( 'string!CHARGES_AND_FIELDS/electricField' );
  const gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  const snapToGridString = require( 'string!CHARGES_AND_FIELDS/snapToGrid' );
  const valuesString = require( 'string!CHARGES_AND_FIELDS/values' );
  const voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );

  class ChargesAndFieldsControlPanel extends Panel {

    /**
     * @param {ChargesAndFieldsModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      /**
       * checkbox factory
       * @param tandemId
       * @param {string} string
       * @param {Property.<boolean>} property
       * @returns {Checkbox}
       */
      function createCheckbox( tandemId, string, property ) {
        const text = new Text( string, {
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
        const node = new Node();
        const hStrut = new HStrut( 25 ); // some arbitrary number that looks good.
        checkbox.left = hStrut.right;
        node.setChildren( [ hStrut, checkbox ] );
        return node;
      }

      // create checkboxes
      const electricFieldCheckbox = createCheckbox( 'electricFieldCheckbox', electricFieldString, model.isElectricFieldVisibleProperty );
      const directionOnlyCheckbox = createCheckbox( 'directionOnlyCheckbox', directionOnlyString, model.isElectricFieldDirectionOnlyProperty );
      const voltageCheckbox = createCheckbox( 'voltageCheckbox', voltageString, model.isElectricPotentialVisibleProperty );
      const valuesCheckbox = createCheckbox( 'valuesCheckbox', valuesString, model.areValuesVisibleProperty );
      const gridCheckbox = createCheckbox( 'gridCheckbox', gridString, model.isGridVisibleProperty );
      const snapToGridCheckbox = createCheckbox( 'snapToGridCheckbox', snapToGridString, model.snapToGridProperty );

      // some of the checkboxes need to be indented with respect to the other checkboxes
      const directionOnlyGroup = createIndentedNode( directionOnlyCheckbox );
      const snapToGridGroup = createIndentedNode( snapToGridCheckbox );

      // @private
      const toggleNodes = [
        electricFieldCheckbox,
        directionOnlyGroup,
        voltageCheckbox,
        valuesCheckbox,
        gridCheckbox,
        snapToGridGroup
      ];

      // @private
      const checkboxGroup = new VBox( {
        spacing: 12,
        children: toggleNodes,
        align: 'left'
      } );

      // add the checkbox group to the panel
      super( checkboxGroup, {
        lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
        xMargin: 12,
        yMargin: 10,
        fill: ChargesAndFieldsColorProfile.controlPanelFillProperty,
        stroke: ChargesAndFieldsColorProfile.controlPanelBorderProperty,
        tandem: tandem
      } );

      // @private
      this.model = model;

      model.isElectricFieldVisibleProperty.linkAttribute( directionOnlyCheckbox, 'enabled' );
      model.isGridVisibleProperty.linkAttribute( snapToGridCheckbox, 'enabled' );
    }
  }

  return chargesAndFields.register( 'ChargesAndFieldsControlPanel', ChargesAndFieldsControlPanel );
} );

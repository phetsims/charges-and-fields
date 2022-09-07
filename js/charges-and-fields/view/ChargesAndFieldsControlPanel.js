// Copyright 2014-2022, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
 *
 * @author Martin Veillette (Berea College)
 */

import { HStrut, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

const directionOnlyString = ChargesAndFieldsStrings.directionOnly;
const electricFieldString = ChargesAndFieldsStrings.electricField;
const gridString = ChargesAndFieldsStrings.grid;
const snapToGridString = ChargesAndFieldsStrings.snapToGrid;
const valuesString = ChargesAndFieldsStrings.values;
const voltageString = ChargesAndFieldsStrings.voltage;

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
        font: ChargesAndFieldsConstants.CHECKBOX_FONT,
        fill: ChargesAndFieldsColors.controlPanelTextProperty,
        maxWidth: 250
      } );

      return new Checkbox( property, text, {
        tandem: tandem.createTandem( tandemId ),
        boxWidth: 25,
        spacing: 7,
        checkboxColor: ChargesAndFieldsColors.checkboxProperty,
        checkboxColorBackground: ChargesAndFieldsColors.checkboxBackgroundProperty
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
      fill: ChargesAndFieldsColors.controlPanelFillProperty,
      stroke: ChargesAndFieldsColors.controlPanelBorderProperty,
      tandem: tandem
    } );

    // @private
    this.model = model;

    model.isElectricFieldVisibleProperty.linkAttribute( directionOnlyCheckbox, 'enabled' );
    model.isGridVisibleProperty.linkAttribute( snapToGridCheckbox, 'enabled' );
  }
}

chargesAndFields.register( 'ChargesAndFieldsControlPanel', ChargesAndFieldsControlPanel );
export default ChargesAndFieldsControlPanel;
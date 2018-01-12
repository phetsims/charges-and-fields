// Copyright 2015-2017, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var Checkbox = require( 'SUN/Checkbox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var optionsProjectorColorsString = require( 'string!CHARGES_AND_FIELDS/options.projectorColors' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function GlobalOptionsNode( tandem ) {

    // Static tandems are needed here because it is called before the sim is launched
    var checkboxText = new Text( optionsProjectorColorsString, {
      font: OptionsDialog.DEFAULT_FONT,
      tandem: tandem.createTandem( 'projectorCheckboxString' )
    } );

    var projectorCheckbox = new Checkbox( checkboxText, ChargesAndFieldsGlobals.projectorColorsProperty, {
      tandem: tandem.createTandem( 'projectorCheckbox' )
    } );

    LayoutBox.call( this, _.extend( {
      children: [ projectorCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left',
      tandem: tandem
    } ) );
  }

  chargesAndFields.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( LayoutBox, GlobalOptionsNode );
} );


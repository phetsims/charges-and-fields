// Copyright 2015, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var CheckBox = require( 'SUN/CheckBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var Text = require( 'SCENERY/nodes/Text' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // strings
  var optionsProjectorColorsString = require( 'string!CHARGES_AND_FIELDS/options.projectorColors' );

  /**
   *
   * @constructor
   */
  function GlobalOptionsNode( tandem ) {

    tandem.createTandem( 'projectorColors' ).addInstance( ChargesAndFieldsGlobals.projectorColorsProperty );

    var projectorCheckBox = new CheckBox( new Text( optionsProjectorColorsString, { font: OptionsDialog.DEFAULT_FONT } ),
      ChargesAndFieldsGlobals.projectorColorsProperty );

    LayoutBox.call( this, _.extend( {
      children: [ projectorCheckBox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  chargesAndFields.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( LayoutBox, GlobalOptionsNode );
} );
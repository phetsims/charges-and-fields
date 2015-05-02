// Copyright 2002-2015, University of Colorado Boulder

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

  // strings
  var electricFieldLinesString = require( 'string!CHARGES_AND_FIELDS/options.electricFieldLines' );
  var projectorColorsString = require( 'string!CHARGES_AND_FIELDS/options.projectorColors' );

  /**
   *
   * @param {boolean} isEnhancedVersion
   * @constructor
   */
  function GlobalOptionsNode( isEnhancedVersion ) {
    var children = [];

    if ( isEnhancedVersion ) {
      children.push( new CheckBox( new Text( electricFieldLinesString, { font: OptionsDialog.DEFAULT_FONT } ),
        ChargesAndFieldsGlobals.isElectricFieldLinesSupportedProperty, {} ) );
    }
    children.push( new CheckBox( new Text( projectorColorsString, { font: OptionsDialog.DEFAULT_FONT } ),
      ChargesAndFieldsGlobals.projectorColorsProperty, {} ) );

    LayoutBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  return inherit( LayoutBox, GlobalOptionsNode );
} );
//  Copyright 2002-2014, University of Colorado Boulder

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
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var chargedLinesString = require( 'string!CHARGES_AND_FIELDS/options.chargedLines' );
  var projectorColorsString = require( 'string!CHARGES_AND_FIELDS/options.projectorColors' );

  function GlobalOptionsNode( isBasicsVersion ) {
    var children = [];

    if ( !isBasicsVersion ) {
      children.push( new CheckBox( new Text( chargedLinesString, { font: OptionsDialog.DEFAULT_FONT } ),
        ChargesAndFieldsGlobals.chargedLinesProperty, {} ) );
    }
    children.push( new CheckBox( new Text( projectorColorsString, { font: OptionsDialog.DEFAULT_FONT } ),
      ChargesAndFieldsGlobals.projectorColorsProperty, {} ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  return inherit( VBox, GlobalOptionsNode );
} );
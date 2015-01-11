//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CheckBox = require( 'SUN/CheckBox' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );

  // strings
  var showOuterLonePairsString = require( 'string!CHARGES_AND_FIELDS/options.showOuterLonePairs' );
  var projectorColorsString = require( 'string!CHARGES_AND_FIELDS/options.projectorColors' );

  function GlobalOptionsNode( isBasicsVersion ) {
    var children = [];

    if ( !isBasicsVersion ) {
      children.push( new CheckBox( new Text( showOuterLonePairsString, {font: OptionsDialog.DEFAULT_FONT} ),
        ChargesAndFieldsGlobals.showOuterLonePairsProperty, {} ) );
    }
    children.push( new CheckBox( new Text( projectorColorsString, {font: OptionsDialog.DEFAULT_FONT} ),
      ChargesAndFieldsGlobals.projectorColorsProperty, {} ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  return inherit( VBox, GlobalOptionsNode );
} );
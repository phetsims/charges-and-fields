// Copyright 2014-2015, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var chargesAndFieldsTitleString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.title' );

  /**
   * @constructor
   */
  function ChargesAndFieldsScreen() {

    var screen = this;

    // If this is a single-screen sim, then no icon is necessary.
    var icon = null;

    Screen.call( this, chargesAndFieldsTitleString, icon,
      function() {
        return new ChargesAndFieldsModel();
      },
      function( model ) {
        return new ChargesAndFieldsScreenView( model );
      },
      { backgroundColor: ChargesAndFieldsColors.background.toCSS() }
    );

    ChargesAndFieldsColors.link( 'background', function( color ) {
      screen.backgroundColor = color;
    } );

  }

  return inherit( Screen, ChargesAndFieldsScreen );
} );
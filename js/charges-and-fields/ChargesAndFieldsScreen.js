//  Copyright 2002-2015, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var chargesAndFieldsSimString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.name' );

  /**
   * @constructor
   */
  function ChargesAndFieldsScreen() {

    var screen = this;

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, chargesAndFieldsSimString, icon,
      function() {
        return new ChargesAndFieldsModel();
      },
      function( model ) {
        return new ChargesAndFieldsScreenView( model );
      },
      { backgroundColor: ChargesAndFieldsColors.background.toCSS() }
    );

    var colorFunction = function( color ) {
      screen.backgroundColor = color;
    };

    ChargesAndFieldsColors.link( 'background', colorFunction );


  }

  return inherit( Screen, ChargesAndFieldsScreen );
} );
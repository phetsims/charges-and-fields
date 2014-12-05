//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var chargesAndFieldsSimString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.name' );

  /**
   * @constructor
   */
  function ChargesAndFieldsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, chargesAndFieldsSimString, icon,
      function() { return new ChargesAndFieldsModel(); },
      function( model ) { return new ChargesAndFieldsScreenView( model ); },
      //{ backgroundColor: '#FFFFB7' } //yellowish color
      {backgroundColor: 'black'}
    );
  }

  return inherit( Screen, ChargesAndFieldsScreen );
} );
// Copyright 2014-2015, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsScreen( tandem ) {
    var options = {
      backgroundColorProperty: ChargesAndFieldsColorProfile.backgroundProperty,
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new ChargesAndFieldsModel( tandem.createTandem( 'model' ) );
      },
      function( model ) {
        return new ChargesAndFieldsScreenView( model, tandem.createTandem( 'view' ) );
      },
      options );
  }

  chargesAndFields.register( 'ChargesAndFieldsScreen', ChargesAndFieldsScreen );

  return inherit( Screen, ChargesAndFieldsScreen );
} );
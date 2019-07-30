// Copyright 2014-2019, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  const ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  const Screen = require( 'JOIST/Screen' );

  class ChargesAndFieldsScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {
      const options = {
        backgroundColorProperty: ChargesAndFieldsColorProfile.backgroundProperty,
        tandem: tandem
      };

      super(
        function() {
          return new ChargesAndFieldsModel( tandem.createTandem( 'model' ) );
        },
        function( model ) {
          return new ChargesAndFieldsScreenView( model, tandem.createTandem( 'view' ) );
        },
        options );
    }
  }

  return chargesAndFields.register( 'ChargesAndFieldsScreen', ChargesAndFieldsScreen );
} );
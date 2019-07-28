// Copyright 2014-2017, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsModel = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModel' );
  const ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Screen = require( 'JOIST/Screen' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsScreen( tandem ) {
    const options = {
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
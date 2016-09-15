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
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsScreen( tandem ) {

    var self = this;

    var options = {
      backgroundColor: ChargesAndFieldsColors.background.toCSS(),
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

    ChargesAndFieldsColors.link( 'background', function( color ) {
      self.backgroundColor = color;
    } );

  }

  chargesAndFields.register( 'ChargesAndFieldsScreen', ChargesAndFieldsScreen );

  return inherit( Screen, ChargesAndFieldsScreen );
} );
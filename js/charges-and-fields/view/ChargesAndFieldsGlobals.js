// Copyright 2015-2019, University of Colorado Boulder

/**
 * Global settings
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );

  var ChargesAndFieldsGlobals = {
    projectorColorsProperty: new BooleanProperty( phet.chipper.queryParameters.colorProfile === 'projector', {
      tandem: ChargesAndFieldsConstants.GLOBALS_TANDEM.createTandem( 'projectorColorsProperty' )
    } )
  };

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return ChargesAndFieldsGlobals;
} );
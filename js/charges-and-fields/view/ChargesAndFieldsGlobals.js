// Copyright 2015-2018, University of Colorado Boulder

/**
 * Global settings
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanIO = require( 'TANDEM/types/BooleanIO' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );

  var ChargesAndFieldsGlobals = {
    projectorColorsProperty: new Property( phet.chipper.queryParameters.colorProfile === 'projector', {
      tandem: ChargesAndFieldsConstants.GLOBALS_TANDEM.createTandem( 'projectorColorsProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } )
  };

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return ChargesAndFieldsGlobals;
} );
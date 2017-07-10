// Copyright 2015, University of Colorado Boulder

/**
 * Global settings
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );

  var ChargesAndFieldsGlobals = {
    projectorColorsProperty: new Property( phet.chipper.queryParameters.colorProfile === 'projector', {
      tandem: ChargesAndFieldsConstants.GLOBALS_TANDEM.createTandem( 'projectorColorsProperty' ),
      phetioValueType: TBoolean
    } )
  };

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return ChargesAndFieldsGlobals;
} );
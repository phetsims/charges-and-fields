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
  var Tandem = require( 'TANDEM/Tandem' );

  var ChargesAndFieldsGlobals = {
    projectorColorsProperty: new BooleanProperty( phet.chipper.queryParameters.colorProfile === 'projector', {
      tandem: Tandem.globalTandem.createTandem( 'projectorColorsProperty' )
    } )
  };

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return ChargesAndFieldsGlobals;
} );
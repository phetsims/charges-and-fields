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

  var ChargesAndFieldsGlobals = {
    projectorColorsProperty: new Property( phet.chipper.queryParameters.colorProfile === 'projector' )
  };

  chargesAndFields.register( 'ChargesAndFieldsGlobals', ChargesAndFieldsGlobals );

  return ChargesAndFieldsGlobals;
} );
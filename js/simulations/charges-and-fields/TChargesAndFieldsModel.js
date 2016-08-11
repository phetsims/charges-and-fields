// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TObject = require( 'PHET_IO/types/TObject' );

  // Instrumented to help restore charged particles.
  var TChargesAndFieldsModel = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ChargesAndFieldsModel );
    TObject.call( this, instance, phetioID );
  };

  phetioInherit( TObject, 'TChargesAndFieldsModel', TChargesAndFieldsModel, {}, {} );

  phetioNamespace.register( 'TChargesAndFieldsModel', TChargesAndFieldsModel );

  return TChargesAndFieldsModel;
} );


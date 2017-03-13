// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/TModelElement' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  var TElectricPotentialLine = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ElectricPotentialLine );
    TObject.call( this, instance, phetioID );
  };

  phetioInherit( TModelElement, 'TElectricPotentialLine', TElectricPotentialLine, {}, {

    fromStateObject: function( stateObject ) {
      return {};
    },

    toStateObject: function( value ) {
      return { position: TVector2.toStateObject( value.position ) };
    }
  } );

  chargesAndFields.register( 'TElectricPotentialLine', TElectricPotentialLine );

  return TElectricPotentialLine;
} );


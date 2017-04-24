// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/TModelElement' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVoid = require( 'ifphetio!PHET_IO/types/TVoid' );
  var TVector2 = require( 'DOT/TVector2' );

  var TChargedParticle = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ChargedParticle );
    TModelElement.call( this, instance, phetioID );
  };

  phetioInherit( TModelElement, 'TChargedParticle', TChargedParticle, {
    setCharge: {
      returnType: TVoid,
      parameterTypes: [ TNumber() ],
      implementation: function( value ) {
        this.instance.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)'
    }

  }, {
    documentation: 'A Charged Particle',

    fromStateObject: function( stateObject ) {
      return {
        charge: stateObject.charge,
        initialPosition: stateObject.initialPosition ? TVector2.fromStateObject( stateObject.initialPosition ) : null
      };
    },

    toStateObject: function( value ) {
      return {
        charge: value.charge,
        initialPosition: value.initialPosition ? TVector2.toStateObject( value.initialPosition ) : null
      };
    },

    setValue: function( instance, value ) {
      instance.charge = value.charge;
      instance.initialPosition = value.initialPosition;
    }
  } );

  chargesAndFields.register( 'TChargedParticle', TChargedParticle );

  return TChargedParticle;
} );


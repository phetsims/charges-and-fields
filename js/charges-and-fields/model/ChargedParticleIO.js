// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var NumberIO = require( 'ifphetio!PHET_IO/types/NumberIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var Vector2IO = require( 'DOT/Vector2IO' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   *
   * @param chargedParticle
   * @param phetioID
   * @constructor
   */
  function ChargedParticleIO( chargedParticle, phetioID ) {
    assert && assertInstanceOf( chargedParticle, phet.chargesAndFields.ChargedParticle );
    ModelElementIO.call( this, chargedParticle, phetioID );
  }

  phetioInherit( ModelElementIO, 'ChargedParticleIO', ChargedParticleIO, {
    setCharge: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
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
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    },

    toStateObject: function( chargedParticle ) {
      assert && assertInstanceOf( chargedParticle, phet.chargesAndFields.ChargedParticle );
      return {
        charge: chargedParticle.charge,
        initialPosition: chargedParticle.initialPosition ? Vector2IO.toStateObject( chargedParticle.initialPosition ) : null
      };
    },

    setValue: function( chargedParticle, value ) {
      assert && assertInstanceOf( chargedParticle, phet.chargesAndFields.ChargedParticle );
      chargedParticle.charge = value.charge;
      chargedParticle.initialPosition = value.initialPosition;
    }
  } );

  chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );

  return ChargedParticleIO;
} );


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
   * @param instance
   * @param phetioID
   * @constructor
   */
  function ChargedParticleIO( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ChargedParticle );
    ModelElementIO.call( this, instance, phetioID );
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

    toStateObject: function( value ) {
      return {
        charge: value.charge,
        initialPosition: value.initialPosition ? Vector2IO.toStateObject( value.initialPosition ) : null
      };
    },

    setValue: function( instance, value ) {
      instance.charge = value.charge;
      instance.initialPosition = value.initialPosition;
    }
  } );

  chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );

  return ChargedParticleIO;
} );


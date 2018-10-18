// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for ChargedParticle
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var NumberIO = require( 'TANDEM/types/NumberIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var VoidIO = require( 'TANDEM/types/VoidIO' );

  /**
   * @param {ChargedParticle} chargedParticle
   * @param {string} phetioID
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
      documentation: 'Set charge (in units of e)',
      invocableForReadOnlyInstances: false
    }

  }, {
    documentation: 'A Charged Particle',

    /**
     * @param {ChargedParticle} chargedParticle
     * @returns {Object}
     * @override
     */
    toStateObject: function( chargedParticle ) {
      assert && assertInstanceOf( chargedParticle, phet.chargesAndFields.ChargedParticle );
      return {
        charge: chargedParticle.charge,
        initialPosition: chargedParticle.initialPosition ? Vector2IO.toStateObject( chargedParticle.initialPosition ) : null
      };
    },

    /**
     * @param {Object} stateObject
     * @returns {Object}
     * @override
     */
    fromStateObject: function( stateObject ) {
      return {
        charge: stateObject.charge,
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    },

    setValue: function( chargedParticle, fromStateObject ) {
      assert && assertInstanceOf( chargedParticle, phet.chargesAndFields.ChargedParticle );
      chargedParticle.charge = fromStateObject.charge;
      chargedParticle.initialPosition = fromStateObject.initialPosition;
    }
  } );

  chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );

  return ChargedParticleIO;
} );


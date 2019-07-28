// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ChargedParticle
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const NumberIO = require( 'TANDEM/types/NumberIO' );
  const phetioInherit = require( 'TANDEM/phetioInherit' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const VoidIO = require( 'TANDEM/types/VoidIO' );
  const validate = require( 'AXON/validate' );

  /**
   * @param {ChargedParticle} chargedParticle
   * @param {string} phetioID
   * @constructor
   */
  function ChargedParticleIO( chargedParticle, phetioID ) {
    ModelElementIO.call( this, chargedParticle, phetioID );
  }

  phetioInherit( ModelElementIO, 'ChargedParticleIO', ChargedParticleIO, {
    setCharge: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( value ) {
        this.phetioObject.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)',
      invocableForReadOnlyElements: false
    }

  }, {
    documentation: 'A Charged Particle',
    validator: { isValidValue: v => v instanceof phet.chargesAndFields.ChargedParticle },

    /**
     * @param {ChargedParticle} chargedParticle
     * @returns {Object}
     * @override
     */
    toStateObject: function( chargedParticle ) {
      validate( chargedParticle, this.validator );
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
      validate( chargedParticle, this.validator );
      chargedParticle.charge = fromStateObject.charge;
      chargedParticle.initialPosition = fromStateObject.initialPosition;
    }
  } );

  chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );

  return ChargedParticleIO;
} );


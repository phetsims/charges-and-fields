// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ChargedParticle
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const NumberIO = require( 'TANDEM/types/NumberIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const VoidIO = require( 'TANDEM/types/VoidIO' );
  const validate = require( 'AXON/validate' );

  class ChargedParticleIO extends ModelElementIO {


    /**
     * @param {ChargedParticle} chargedParticle
     * @returns {Object}
     * @override
     */
    static toStateObject( chargedParticle ) {
      validate( chargedParticle, this.validator );
      return {
        charge: chargedParticle.charge,
        initialPosition: chargedParticle.initialPosition ? Vector2IO.toStateObject( chargedParticle.initialPosition ) : null
      };
    }

    /**
     * @param {Object} stateObject
     * @returns {Object}
     * @override
     */
    static fromStateObject( stateObject ) {
      return {
        charge: stateObject.charge,
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    }

    static setValue( chargedParticle, fromStateObject ) {
      validate( chargedParticle, this.validator );
      chargedParticle.charge = fromStateObject.charge;
      chargedParticle.initialPosition = fromStateObject.initialPosition;
    }
  }

  ChargedParticleIO.methods = {
    setCharge: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( value ) {
        this.phetioObject.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)',
      invocableForReadOnlyElements: false
    }
  };
  ChargedParticleIO.documentation = 'A Charged Particle';
  ChargedParticleIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ChargedParticle };
  ChargedParticleIO.typeName = 'ChargedParticleIO';
  ObjectIO.validateSubtype( ChargedParticleIO );

  return chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );
} );


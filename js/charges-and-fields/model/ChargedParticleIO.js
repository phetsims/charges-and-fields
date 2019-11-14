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
      const parentStateObject = ModelElementIO.toStateObject( chargedParticle );
      parentStateObject.charge = chargedParticle.charge;
      return parentStateObject;
    }

    /**
     * @param {Object} stateObject
     * @returns {Object}
     * @public
     */
    static fromStateObject( stateObject ) {
      const state = ModelElementIO.fromStateObject( stateObject );
      state.charge = stateObject.charge;
      return state;
    }

    /**
     * @override
     * @param {Object} state - see ChargedParticleIO.toStateObject
     * @returns {Array.<*>}
     * @public
     */
    static stateToArgs( state ) {

      // Put charge first for the ChargedParticle Group create function api.
      return [ state.charge ].concat( ModelElementIO.stateToArgs( state ) );
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


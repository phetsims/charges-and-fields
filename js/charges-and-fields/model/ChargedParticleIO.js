// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for ChargedParticle
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElementIO from './ModelElementIO.js';

class ChargedParticleIO extends ModelElementIO {

  /**
   * @public
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
  static stateToArgsForConstructor( state ) {

    // Put charge first for the ChargedParticle Group create function api.
    return [ state.charge ].concat( ModelElementIO.stateToArgsForConstructor( state ) );
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

chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );
export default ChargedParticleIO;
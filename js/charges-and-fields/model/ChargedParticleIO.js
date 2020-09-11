// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for ChargedParticle
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
   * @override
   * @param {Object} stateObject - see ChargedParticleIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {

    // Put charge first for the chargedParticleGroup create function api.
    return [ stateObject.charge ].concat( ModelElementIO.stateToArgsForConstructor( stateObject ) );
  }
}

ChargedParticleIO.methods = {
  setCharge: {
    returnType: VoidIO,
    parameterTypes: [ NumberIO ],
    implementation: function( value ) {
      this.charge = value.charge;
    },
    documentation: 'Set charge (in units of e)',
    invocableForReadOnlyElements: false
  }
};
ChargedParticleIO.documentation = 'A Charged Particle';
ChargedParticleIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ChargedParticle };
ChargedParticleIO.typeName = 'ChargedParticleIO';
ObjectIO.validateIOType( ChargedParticleIO );

chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );
export default ChargedParticleIO;
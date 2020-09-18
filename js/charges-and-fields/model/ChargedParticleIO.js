// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for ChargedParticle
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElementIO from './ModelElementIO.js';

const ChargedParticleIO = new IOType( 'ChargedParticleIO', {
  isValidValue: v => v instanceof phet.chargesAndFields.ChargedParticle,
  supertype: ModelElementIO,
  methods: {
    setCharge: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( value ) {
        this.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)',
      invocableForReadOnlyElements: false
    }
  },

  /**
   * @public
   * @param {ChargedParticle} chargedParticle
   * @returns {Object}
   * @override
   */
  toStateObject( chargedParticle ) {
    const parentStateObject = ModelElementIO.toStateObject( chargedParticle );
    parentStateObject.charge = chargedParticle.charge;
    return parentStateObject;
  },

  /**
   * @override
   * @param {Object} stateObject - see ChargedParticleIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  stateToArgsForConstructor( stateObject ) {

    // Put charge first for the chargedParticleGroup create function api.
    return [ stateObject.charge ].concat( ModelElementIO.stateToArgsForConstructor( stateObject ) );
  }
} );

chargesAndFields.register( 'ChargedParticleIO', ChargedParticleIO );
export default ChargedParticleIO;
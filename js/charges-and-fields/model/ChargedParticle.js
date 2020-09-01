// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type of a charged particle, which has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElement from './ModelElement.js';

class ChargedParticle extends ModelElement {

  /**
   * @param {number} charge - (positive=+1 or negative=-1)
   * @param {Vector2} initialPosition
   * @param {Object} [options]
   * @private - see createGroup
   */
  constructor( charge, initialPosition, options ) {
    options = merge( {

      // {Tandem}
      tandem: Tandem.REQUIRED,
      phetioType: ChargedParticle.ChargedParticleIO,
      phetioDynamicElement: true
    }, options );
    super( initialPosition, options );
    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public (read-only) {number} - a charge of one corresponds to one nano Coulomb
    this.charge = charge;
  }

  // @public
  applyState( stateObject ) {
    super.applyState( stateObject );
    this.charge = stateObject.charge;
  }

  /**
   * @public
   * @returns {Object}
   * @override
   */
  toStateObject() {
    const parentStateObject = super.toStateObject();
    parentStateObject.charge = this.charge;
    return parentStateObject;
  }

  /**
   * @override
   * @param {Object} stateObject - see ChargedParticleIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
    assert && assert( stateObject.charge === 1 || stateObject.charge === -1 );
    // Put charge first for the chargedParticleGroup create function api.
    return [ stateObject.charge ].concat( ModelElement.ModelElementIO.stateToArgsForConstructor( stateObject ) );
  }
}

ChargedParticle.ChargedParticleIO = PhetioObject.createIOType( ChargedParticle, 'ChargedParticleIO', ModelElement.ModelElementIO, {
  documentation: 'A Charged Particle',
  methods: {
    setCharge: {
      returnType: VoidIO,
      parameterTypes: [ NumberIO ],
      implementation: function( value ) {
        this.phetioObject.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)',
      invocableForReadOnlyElements: false
    }
  }
} );

chargesAndFields.register( 'ChargedParticle', ChargedParticle );
export default ChargedParticle;
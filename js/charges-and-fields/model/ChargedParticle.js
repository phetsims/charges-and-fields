// Copyright 2014-2023, University of Colorado Boulder

/**
 * Type of a charged particle, which has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */

import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
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
}

ChargedParticle.ChargedParticleIO = new IOType( 'ChargedParticleIO', {
  valueType: ChargedParticle,
  supertype: ModelElement.ModelElementIO,
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
  stateSchema: {
    charge: NumberIO
  },
  toStateObject: chargedParticle => {
    const parentStateObject = ModelElement.ModelElementIO.toStateObject( chargedParticle );
    parentStateObject.charge = chargedParticle.charge;
    return parentStateObject;
  },
  // Put charge first for the chargedParticleGroup create function API.
  stateObjectToCreateElementArguments: stateObject => [ stateObject.charge ].concat( ModelElement.ModelElementIO.stateObjectToCreateElementArguments( stateObject ) )
} );

chargesAndFields.register( 'ChargedParticle', ChargedParticle );
export default ChargedParticle;
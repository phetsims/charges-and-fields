// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type of a charged particle, which has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */

import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargedParticleIO from './ChargedParticleIO.js';
import ModelElement from './ModelElement.js';

class ChargedParticle extends ModelElement {

  /**
   * @param {number} charge - (positive=+1 or negative=-1)
   * @param {Vector2} initialPosition
   * @param {Object} config - required actually to supply tandem
   * @private - see createGroup
   */
  constructor( charge, initialPosition, config ) {
    config = merge( {

      // {Tandem}
      tandem: required( Tandem.REQUIRED ),
      phetioType: ChargedParticleIO,
      phetioDynamicElement: true
    }, config );
    super( initialPosition, config );
    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public (read-only) {number} - a charge of one corresponds to one nano Coulomb
    this.charge = charge;
  }
}

chargesAndFields.register( 'ChargedParticle', ChargedParticle );
export default ChargedParticle;
// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricPotentialLine
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElementIO from './ModelElementIO.js';

class ElectricPotentialLineIO extends ModelElementIO {

  /**
   * @param {ElectricPotentialLine} electricPotentialLine
   * @returns {Object}
   * @override
   */
  static toStateObject( electricPotentialLine ) {
    validate( electricPotentialLine, this.validator );
    return { position: Vector2IO.toStateObject( electricPotentialLine.position ) };
  }

  /**
   * @param {Object} stateObject
   * @returns {Object}
   * @override
   */
  static fromStateObject( stateObject ) {
    return { position: Vector2IO.fromStateObject( stateObject.position ) };
  }

  /**
   * @override
   * @param {Object} state
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.position ];
  }
}

ElectricPotentialLineIO.documentation = 'The vector that shows the charge strength and direction.';
ElectricPotentialLineIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricPotentialLine };
ElectricPotentialLineIO.typeName = 'ElectricPotentialLineIO';
ObjectIO.validateSubtype( ElectricPotentialLineIO );

chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );
export default ElectricPotentialLineIO;
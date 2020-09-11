// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for ElectricPotentialLine
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElement from './ModelElement.js';

class ElectricPotentialLineIO extends ModelElement.ModelElementIO {

  /**
   * @public
   * @param {ElectricPotentialLine} electricPotentialLine
   * @returns {Object}
   * @override
   */
  static toStateObject( electricPotentialLine ) {
    validate( electricPotentialLine, this.validator );
    return { position: Vector2IO.toStateObject( electricPotentialLine.position ) };
  }

  /**
   * @public
   * @override
   * @param {Object} stateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( stateObject ) {
    return [ Vector2IO.fromStateObject( stateObject.position ) ];
  }
}

ElectricPotentialLineIO.documentation = 'The vector that shows the charge strength and direction.';
ElectricPotentialLineIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricPotentialLine };
ElectricPotentialLineIO.typeName = 'ElectricPotentialLineIO';
ObjectIO.validateSubtype( ElectricPotentialLineIO );

chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );
export default ElectricPotentialLineIO;
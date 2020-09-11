// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import chargesAndFields from '../../chargesAndFields.js';

const NullableIOVector2IO = NullableIO( Vector2IO );

class ModelElementIO extends ObjectIO {

  /**
   * @public
   * @param {ModelElement} modelElement
   * @returns {Object}
   * @override
   */
  static toStateObject( modelElement ) {
    validate( modelElement, this.validator );
    return {
      initialPosition: NullableIOVector2IO.toStateObject( modelElement.initialPosition )
    };
  }

  /**
   * @public
   * @override
   * @param {Object} stateObject - see ModelElementIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( stateObject ) {
    return [ NullableIOVector2IO.fromStateObject( stateObject.initialPosition ) ];
  }
}

ModelElementIO.validator = { isValidValue: e => e instanceof phet.chargesAndFields.ModelElement };
ModelElementIO.documentation = 'A Model Element';
ModelElementIO.typeName = 'ModelElementIO';
ObjectIO.validateSubtype( ModelElementIO );

chargesAndFields.register( 'ModelElementIO', ModelElementIO );
export default ModelElementIO;
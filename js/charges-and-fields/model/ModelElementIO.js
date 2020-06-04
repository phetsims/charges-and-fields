// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import chargesAndFields from '../../chargesAndFields.js';

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
      initialPosition: modelElement.initialPosition ? Vector2IO.toStateObject( modelElement.initialPosition ) : null
    };
  }

  /**
   * @public
   * @param {Object} stateObject
   * @returns {Object}
   * @override
   */
  static fromStateObject( stateObject ) {
    return {
      initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
    };
  }

  /**
   * @public
   * @override
   * @param {Object} state - see ModelElementIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.initialPosition ? state.initialPosition : null ];
  }
}

ModelElementIO.validator = { isValidValue: e => e instanceof phet.chargesAndFields.ModelElement };
ModelElementIO.documentation = 'A Model Element';
ModelElementIO.typeName = 'ModelElementIO';
ObjectIO.validateSubtype( ModelElementIO );

chargesAndFields.register( 'ModelElementIO', ModelElementIO );
export default ModelElementIO;
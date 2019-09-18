// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );
  const Vector2IO = require( 'DOT/Vector2IO' );

  class ModelElementIO extends ObjectIO {

    /**
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
     * @override
     * @param {Object} stateObject - see ModelElementIO.toStateObject
     * @returns {Array.<*>}
     */
    static stateObjectToArgs( stateObject ) {
      return [ stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null ];
    }
  }

  ModelElementIO.validator = { isValidValue: e => e instanceof phet.chargesAndFields.ModelElement };
  ModelElementIO.documentation = 'A Model Element';
  ModelElementIO.typeName = 'ModelElementIO';
  ObjectIO.validateSubtype( ModelElementIO );

  return chargesAndFields.register( 'ModelElementIO', ModelElementIO );
} );


// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricFieldSensorNode and ChargedParticleNode
 * TODO: do we want to create two different IO Types and copy this code to both?
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );

  // TODO: actually we can probably delete these because the Nodes don't hold state
  class ModelElementNodeIO extends NodeIO {

    /**
     * @param {ModelElementNode} modelElementNode
     * @returns {Object}
     * @override
     */
    static toStateObject( modelElementNode ) {
      validate( modelElementNode, this.validator );
      return {
        modelPhetioID: modelElementNode.modelElement.tandem.phetioID
      };
    }

    /**
     * @override
     * @param {Object} stateObject - see ModelElementNodeIO.toStateObject
     * @returns {Array.<*>}
     */
    static stateObjectToArgs( stateObject ) {
      return phet.phetIo.phetioEngine.hasPhetioObject( stateObject.modelPhetioID ) ?
        [ phet.phetIo.phetioEngine.getPhetioObject( stateObject.modelPhetioID ) ] : null;
    }
  }

  ModelElementNodeIO.documentation = 'The view of the sensor that detects the charge direction and strength.';
  ModelElementNodeIO.validator = {
    isValidValue: v => v instanceof phet.chargesAndFields.ElectricFieldSensorNode ||
                       v instanceof phet.chargesAndFields.ChargedParticleNode
  };
  ModelElementNodeIO.typeName = 'ModelElementNodeIO';
  ObjectIO.validateSubtype( ModelElementNodeIO );

  return chargesAndFields.register( 'ModelElementNodeIO', ModelElementNodeIO );
} );


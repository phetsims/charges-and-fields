// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricPotentialLine
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const validate = require( 'AXON/validate' );

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
      return {};
    }
  }

  ElectricPotentialLineIO.documentation = 'The vector that shows the charge strength and direction.';
  ElectricPotentialLineIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricPotentialLine };
  ElectricPotentialLineIO.typeName = 'ElectricPotentialLineIO';
  ObjectIO.validateSubtype( ElectricPotentialLineIO );

  return chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );
} );
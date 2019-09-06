// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricFieldSensor
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const validate = require( 'AXON/validate' );

  class ElectricFieldSensorIO extends ModelElementIO {

    /**
     * @param {ElectricFieldSensor} electricFieldSensor
     * @returns {Object}
     * @override
     */
    static toStateObject( electricFieldSensor ) {
      validate( electricFieldSensor, this.validator );
      return {
        initialPosition: electricFieldSensor.initialPosition ? Vector2IO.toStateObject( electricFieldSensor.initialPosition ) : null
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
  }

  ElectricFieldSensorIO.documentation = 'The sensor that detects the charge direction and strength.';
  ElectricFieldSensorIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricFieldSensor };
  ElectricFieldSensorIO.typeName = 'ElectricFieldSensorIO';
  ObjectIO.validateSubtype( ElectricFieldSensorIO );

  return chargesAndFields.register( 'ElectricFieldSensorIO', ElectricFieldSensorIO );
} );


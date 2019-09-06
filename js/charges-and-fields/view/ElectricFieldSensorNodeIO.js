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
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );

  class ElectricFieldSensorNodeIO extends ObjectIO {

    /**
     * @param {ElectricFieldSensor} electricFieldSensor
     * @returns {Object}
     * @override
     */
    static toStateObject( electricFieldSensorNode ) {
      validate( electricFieldSensorNode, this.validator );
      return {
        sensorPhetioID: electricFieldSensorNode.modelElement.tandem.phetioID
      };
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

  ElectricFieldSensorNodeIO.documentation = 'The view of the sensor that detects the charge direction and strength.';
  ElectricFieldSensorNodeIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricFieldSensorNode };
  ElectricFieldSensorNodeIO.typeName = 'ElectricFieldSensorNodeIO';
  ObjectIO.validateSubtype( ElectricFieldSensorNodeIO );

  return chargesAndFields.register( 'ElectricFieldSensorNodeIO', ElectricFieldSensorNodeIO );
} );


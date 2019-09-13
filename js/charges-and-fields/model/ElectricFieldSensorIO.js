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

  // TODO: delete me? ModelElementIO seems to do the trick
  class ElectricFieldSensorIO extends ModelElementIO {}

  ElectricFieldSensorIO.documentation = 'The sensor that detects the charge direction and strength.';
  ElectricFieldSensorIO.validator = { isValidValue: v => v instanceof phet.chargesAndFields.ElectricFieldSensor };
  ElectricFieldSensorIO.typeName = 'ElectricFieldSensorIO';
  ObjectIO.validateSubtype( ElectricFieldSensorIO );

  return chargesAndFields.register( 'ElectricFieldSensorIO', ElectricFieldSensorIO );
} );


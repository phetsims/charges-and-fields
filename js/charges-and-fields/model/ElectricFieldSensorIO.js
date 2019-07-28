// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricFieldSensor
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const phetioInherit = require( 'TANDEM/phetioInherit' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const validate = require( 'AXON/validate' );

  /**
   *
   * @param {ElectricFieldSensor} electricFieldSensor
   * @param {string} phetioID
   * @constructor
   */
  function ElectricFieldSensorIO( electricFieldSensor, phetioID ) {
    ModelElementIO.call( this, electricFieldSensor, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricFieldSensorIO', ElectricFieldSensorIO, {}, {
    documentation: 'The sensor that detects the charge direction and strength.',
    validator: { isValidValue: v => v instanceof phet.chargesAndFields.ElectricFieldSensor },

    /**
     * @param {ElectricFieldSensor} electricFieldSensor
     * @returns {Object}
     * @override
     */
    toStateObject: function( electricFieldSensor ) {
      validate( electricFieldSensor, this.validator );
      return {
        initialPosition: electricFieldSensor.initialPosition ? Vector2IO.toStateObject( electricFieldSensor.initialPosition ) : null
      };
    },

    /**
     * @param {Object} stateObject
     * @returns {Object}
     * @override
     */
    fromStateObject: function( stateObject ) {
      return {
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    }
  } );

  chargesAndFields.register( 'ElectricFieldSensorIO', ElectricFieldSensorIO );

  return ElectricFieldSensorIO;
} );


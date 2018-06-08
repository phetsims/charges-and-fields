// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for ElectricFieldSensor
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   *
   * @param {ElectricFieldSensor} electricFieldSensor
   * @param {string} phetioID
   * @constructor
   */
  function ElectricFieldSensorIO( electricFieldSensor, phetioID ) {
    assert && assertInstanceOf( electricFieldSensor, phet.chargesAndFields.ElectricFieldSensor );
    ModelElementIO.call( this, electricFieldSensor, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricFieldSensorIO', ElectricFieldSensorIO, {}, {
    documentation: 'The sensor that detects the charge direction and strength.',

    toStateObject: function( electricFieldSensor ) {
      assert && assertInstanceOf( electricFieldSensor, phet.chargesAndFields.ElectricFieldSensor );
      return {
        computeElectricField: electricFieldSensor.computeElectricField,
        initialPosition: electricFieldSensor.initialPosition ? Vector2IO.toStateObject( electricFieldSensor.initialPosition ) : null
      };
    },

    fromStateObject: function( stateObject ) {
      return {
        computeElectricField: stateObject.computeElectricField,
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    }
  } );

  chargesAndFields.register( 'ElectricFieldSensorIO', ElectricFieldSensorIO );

  return ElectricFieldSensorIO;
} );


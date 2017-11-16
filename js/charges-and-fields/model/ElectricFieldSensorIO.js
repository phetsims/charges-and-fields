// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  /**
   *
   * @param instance
   * @param phetioID
   * @constructor
   */
  function ElectricFieldSensorIO( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ElectricFieldSensor );
    ModelElementIO.call( this, instance, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricFieldSensorIO', ElectricFieldSensorIO, {}, {
    documentation: 'The sensor that detects the charge direction and strength.',

    fromStateObject: function( stateObject ) {
      return {
        computeElectricField: stateObject.computeElectricField,
        initialPosition: stateObject.initialPosition ? Vector2IO.fromStateObject( stateObject.initialPosition ) : null
      };
    },

    toStateObject: function( value ) {
      return {
        computeElectricField: value.computeElectricField,
        initialPosition: value.initialPosition ? Vector2IO.toStateObject( value.initialPosition ) : null
      };
    }
  } );

  chargesAndFields.register( 'ElectricFieldSensorIO', ElectricFieldSensorIO );

  return ElectricFieldSensorIO;
} );


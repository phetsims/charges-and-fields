// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/TModelElement' );
  var TVector2 = require( 'DOT/TVector2' );

  /**
   *
   * @param instance
   * @param phetioID
   * @constructor
   */
  function TElectricFieldSensor( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ElectricFieldSensor );
    TModelElement.call( this, instance, phetioID );
  }

  phetioInherit( TModelElement, 'TElectricFieldSensor', TElectricFieldSensor, {}, {
    documentation: 'The sensor that detects the charge direction and strength.',

    fromStateObject: function( stateObject ) {
      return {
        computeElectricField: stateObject.computeElectricField,
        initialPosition: stateObject.initialPosition ? TVector2.fromStateObject( stateObject.initialPosition ) : null
      };
    },

    toStateObject: function( value ) {
      return {
        computeElectricField: value.computeElectricField,
        initialPosition: value.initialPosition ? TVector2.toStateObject( value.initialPosition ) : null
      };
    }
  } );

  chargesAndFields.register( 'TElectricFieldSensor', TElectricFieldSensor );

  return TElectricFieldSensor;
} );


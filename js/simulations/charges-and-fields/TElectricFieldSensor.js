// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TModelElement = require( 'PHET_IO/simulations/charges-and-fields/TModelElement' );
  var TVector2 = require( 'PHET_IO/types/dot/TVector2' );

  var TElectricFieldSensor = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ElectricFieldSensor );
    TModelElement.call( this, instance, phetioID );
  };

  phetioInherit( TModelElement, 'TElectricFieldSensor', TElectricFieldSensor, { }, {
    create: function( id ) {

      // In Charges and Fields, the model creates the charges and adds them to lists.
      var model = phetio.getInstance( 'chargesAndFields.chargesAndFieldsScreen.model' );
      return model.addElectricFieldSensor( new phet.tandem.Tandem( id ) );
    },

    fromStateObject: function( stateObject ) {
      return stateObject;
    },

    toStateObject: function( value ) {
      return {
        computeElectricField: value.computeElectricField,
        initialPosition: value.initialPosition ? TVector2.toStateObject( value.initialPosition ) : null
      };
    },

    setValue: function(instance, value) {
      }
  } );

  phetioNamespace.register( 'TElectricFieldSensor', TElectricFieldSensor );

  return TElectricFieldSensor;
} );


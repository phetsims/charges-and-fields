// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TModelElement = require( 'PHET_IO/simulations/charges-and-fields/TModelElement' );

  var TElectricFieldSensor = phetioInherit( TModelElement, 'TElectricFieldSensor', function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ElectricFieldSensor );
    TModelElement.call( this, instance, phetioID );
  }, {}, {
    create: function( id ) {

      // In Charges and Fields, the model creates the charges and adds them to lists.
      var model = phetio.getInstance( 'chargesAndFields.chargesAndFieldsScreen.model' );
      return model.addElectricFieldSensor( new phet.tandem.Tandem( id ) );
    }
  } );

  phetioNamespace.register( 'TElectricFieldSensor', TElectricFieldSensor );

  return TElectricFieldSensor;
} );


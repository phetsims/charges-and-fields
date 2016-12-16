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
  var TObject = require( 'PHET_IO/types/TObject' );
  var TVector2 = require( 'PHET_IO/types/dot/TVector2' );

  // Instrumented to help restore charged particles.
  var TChargesAndFieldsModel = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ChargesAndFieldsModel );
    TObject.call( this, instance, phetioID );
  };

  phetioInherit( TObject, 'TChargesAndFieldsModel', TChargesAndFieldsModel, {}, {
    clearChildInstances: function( instance ) {
        instance.chargedParticles.clear();
        instance.electricFieldSensors.clear();
      instance.electricPotentialLines.clear();
      },

      /**
       * Create a dynamic particle as specified by the phetioID and state.
       * @param {Object} instance
       * @param {Tandem} tandem
       * @param {Object} stateObject
       * @returns {ChargedParticle}
       */
      addChildInstance: function( instance, tandem, stateObject ) {
        if ( tandem.tail.indexOf( 'chargedParticle' ) === 0 ) {
          if ( stateObject.charge > 0 ) {
            return instance.addPositiveCharge( tandem );
          }
          else if ( stateObject.charge < 0 ) {
            return instance.addNegativeCharge( tandem );
          }
          else {
            throw new Error( 'This sim does not support charges with no charge' );
          }
        }
        else if ( tandem.tail.indexOf( 'electricFieldSensor' ) === 0 ) {
          return instance.addElectricFieldSensor( tandem );
        }
        else if ( tandem.tail.indexOf( 'electricPotentialLines' ) === 0 ) {
          return instance.addElectricPotentialLine( TVector2.fromStateObject( stateObject.position ) );
        }
        else {
          throw new Error( 'child type not found: ' + tandem.id );
        }
      }
    }
  );

  phetioNamespace.register( 'TChargesAndFieldsModel', TChargesAndFieldsModel );

  return TChargesAndFieldsModel;
} );


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
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  /**
   * Instrumented to help restore charged particles.
   * @param instance
   * @param phetioID
   * @constructor
   */
  function ChargesAndFieldsModelIO( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ChargesAndFieldsModel );
    ObjectIO.call( this, instance, phetioID );
  }

  phetioInherit( ObjectIO, 'ChargesAndFieldsModelIO', ChargesAndFieldsModelIO, {}, {
    documentation: 'The model for the whole sim',

    /**
     * Clear the children from the model so it can be deserialized.
     * @param instance
     */
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
          return instance.addElectricPotentialLine( Vector2IO.fromStateObject( stateObject.position ), tandem );
        }
        else {
          throw new Error( 'child type not found: ' + tandem.id );
        }
      }
    }
  );

  chargesAndFields.register( 'ChargesAndFieldsModelIO', ChargesAndFieldsModelIO );

  return ChargesAndFieldsModelIO;
} );


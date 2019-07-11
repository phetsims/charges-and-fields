// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ChargesAndFieldsModel
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var Vector2IO = require( 'DOT/Vector2IO' );
  var validate = require( 'AXON/validate' );

  /**
   * Instrumented to help restore charged particles.
   * @param {ChargesAndFieldsModel} chargesAndFieldsModel
   * @param {string} phetioID
   * @constructor
   */
  function ChargesAndFieldsModelIO( chargesAndFieldsModel, phetioID ) {
    ObjectIO.call( this, chargesAndFieldsModel, phetioID );
  }

  phetioInherit( ObjectIO, 'ChargesAndFieldsModelIO', ChargesAndFieldsModelIO, {}, {
    documentation: 'The model for the whole sim',
    validator: { isValidValue: v => v instanceof phet.chargesAndFields.ChargesAndFieldsModel },

    /**
     * Clear the children from the model so it can be deserialized.
     * @param chargesAndFieldsModel
     */
    clearChildInstances: function( chargesAndFieldsModel ) {
      validate( chargesAndFieldsModel, this.validator );
      chargesAndFieldsModel.chargedParticles.clear();
      chargesAndFieldsModel.electricFieldSensors.clear();
      chargesAndFieldsModel.electricPotentialLines.clear();
      },

      /**
       * Create a dynamic particle as specified by the phetioID and state.
       * @param {Object} chargesAndFieldsModel
       * @param {Tandem} tandem
       * @param {Object} stateObject
       * @returns {ChargedParticle}
       */
      addChildInstance: function( chargesAndFieldsModel, tandem, stateObject ) {
        validate( chargesAndFieldsModel, this.validator );
        if ( tandem.name.indexOf( 'chargedParticle' ) === 0 ) {
          if ( stateObject.charge > 0 ) {
            return chargesAndFieldsModel.addPositiveCharge( tandem );
          }
          else if ( stateObject.charge < 0 ) {
            return chargesAndFieldsModel.addNegativeCharge( tandem );
          }
          else {
            throw new Error( 'This sim does not support charges with no charge' );
          }
        }
        else if ( tandem.name.indexOf( 'electricFieldSensor' ) === 0 ) {
          return chargesAndFieldsModel.addElectricFieldSensor( tandem );
        }
        else if ( tandem.name.indexOf( 'electricPotentialLines' ) === 0 ) {
          return chargesAndFieldsModel.addElectricPotentialLine( Vector2IO.fromStateObject( stateObject.position ), tandem );
        }
        else {
          throw new Error( 'child type not found: ' + tandem.phetioID );
        }
      }
    }
  );

  chargesAndFields.register( 'ChargesAndFieldsModelIO', ChargesAndFieldsModelIO );

  return ChargesAndFieldsModelIO;
} );


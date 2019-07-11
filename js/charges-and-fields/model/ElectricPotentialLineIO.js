// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ElectricPotentialLine
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var Vector2IO = require( 'DOT/Vector2IO' );
  var validate = require( 'AXON/validate' );

  /**
   *
   * @param {ElectricPotentialLine} electricPotentialLine
   * @param {string} phetioID
   * @constructor
   */
  function ElectricPotentialLineIO( electricPotentialLine, phetioID ) {
    ObjectIO.call( this, electricPotentialLine, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricPotentialLineIO', ElectricPotentialLineIO, {}, {
    documentation: 'The vector that shows the charge strength and direction.',
    validator: { isValidValue: v => v instanceof phet.chargesAndFields.ElectricPotentialLine },

    /**
     * @param {ElectricPotentialLine} electricPotentialLine
     * @returns {Object}
     * @override
     */
    toStateObject: function( electricPotentialLine ) {
      validate( electricPotentialLine, this.validator );
      return { position: Vector2IO.toStateObject( electricPotentialLine.position ) };
    },

    /**
     * @param {Object} stateObject
     * @returns {Object}
     * @override
     */
    fromStateObject: function( stateObject ) {
      return {};
    }
  } );

  chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );

  return ElectricPotentialLineIO;
} );


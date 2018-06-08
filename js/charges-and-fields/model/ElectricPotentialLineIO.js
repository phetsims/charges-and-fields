// Copyright 2017-2018, University of Colorado Boulder

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
  var Vector2IO = require( 'DOT/Vector2IO' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   *
   * @param {ElectricPotentialLine} electricPotentialLine
   * @param {string} phetioID
   * @constructor
   */
  function ElectricPotentialLineIO( electricPotentialLine, phetioID ) {
    assert && assertInstanceOf( electricPotentialLine, phet.chargesAndFields.ElectricPotentialLine );
    ObjectIO.call( this, electricPotentialLine, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricPotentialLineIO', ElectricPotentialLineIO, {}, {
    documentation: 'The vector that shows the charge strength and direction.',

    toStateObject: function( electricPotentialLine ) {
      assert && assertInstanceOf( electricPotentialLine, phet.chargesAndFields.ElectricPotentialLine );
      return { position: Vector2IO.toStateObject( electricPotentialLine.position ) };
    },
    fromStateObject: function( stateObject ) {
      return {};
    }
  } );

  chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );

  return ElectricPotentialLineIO;
} );


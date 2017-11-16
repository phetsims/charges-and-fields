// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  /**
   *
   * @param instance
   * @param phetioID
   * @constructor
   */
  function ElectricPotentialLineIO( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ElectricPotentialLine );
    ObjectIO.call( this, instance, phetioID );
  }

  phetioInherit( ModelElementIO, 'ElectricPotentialLineIO', ElectricPotentialLineIO, {}, {
    documentation: 'The vector that shows the charge strength and direction.',
    fromStateObject: function( stateObject ) {
      return {};
    },

    toStateObject: function( value ) {
      return { position: Vector2IO.toStateObject( value.position ) };
    }
  } );

  chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );

  return ElectricPotentialLineIO;
} );

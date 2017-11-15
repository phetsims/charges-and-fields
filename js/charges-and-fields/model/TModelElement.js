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
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );

  /**
   *
   * @param instance
   * @param phetioID
   * @constructor
   */
  function TModelElement( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ModelElement );
    ObjectIO.call( this, instance, phetioID );
  }

  phetioInherit( ObjectIO, 'TModelElement', TModelElement, {}, {} );

  chargesAndFields.register( 'TModelElement', TModelElement );

  return TModelElement;
} );


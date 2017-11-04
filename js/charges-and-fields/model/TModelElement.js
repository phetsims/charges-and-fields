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
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   *
   * @param instance
   * @param phetioID
   * @constructor
   */
  function TModelElement( instance, phetioID ) {
    assert && assertInstanceOf( instance, phet.chargesAndFields.ModelElement );
    TObject.call( this, instance, phetioID );
  }

  phetioInherit( TObject, 'TModelElement', TModelElement, {}, {} );

  chargesAndFields.register( 'TModelElement', TModelElement );

  return TModelElement;
} );


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
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   *
   * @param modelElement
   * @param phetioID
   * @constructor
   */
  function ModelElementIO( modelElement, phetioID ) {
    assert && assertInstanceOf( modelElement, phet.chargesAndFields.ModelElement );
    ObjectIO.call( this, modelElement, phetioID );
  }

  phetioInherit( ObjectIO, 'ModelElementIO', ModelElementIO, {}, {} );

  chargesAndFields.register( 'ModelElementIO', ModelElementIO );

  return ModelElementIO;
} );


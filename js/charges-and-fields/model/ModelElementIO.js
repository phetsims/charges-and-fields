// Copyright 2017-2018, University of Colorado Boulder

/**
 * IO type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require ('CHARGES_AND_FIELDS/chargesAndFields');

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var ObjectIO = require( 'ifphetio!PHET_IO/types/ObjectIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * @param {ModelElement} modelElement
   * @param {string} phetioID
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


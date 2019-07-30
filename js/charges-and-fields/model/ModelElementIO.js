// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const phetioInherit = require( 'TANDEM/phetioInherit' );

  /**
   * @param {ModelElement} modelElement
   * @param {string} phetioID
   * @constructor
   */
  function ModelElementIO( modelElement, phetioID ) {
    ObjectIO.call( this, modelElement, phetioID );
  }

  phetioInherit( ObjectIO, 'ModelElementIO', ModelElementIO, {}, {
    validator: { valueType: ModelElement }
  } );

  chargesAndFields.register( 'ModelElementIO', ModelElementIO );

  return ModelElementIO;
} );


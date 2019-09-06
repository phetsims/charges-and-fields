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

  // TODO: this seems unnecessary
  class ModelElementIO extends ObjectIO {}

  ModelElementIO.validator = { valueType: ModelElement };
  ModelElementIO.documentation = 'A Model Element';
  ModelElementIO.typeName = 'ModelElementIO';
  ObjectIO.validateSubtype( ModelElementIO );

  return chargesAndFields.register( 'ModelElementIO', ModelElementIO );
} );


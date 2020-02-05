// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type of a charged particle, which has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const ChargedParticleIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticleIO' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const merge = require( 'PHET_CORE/merge' );
  const ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  const Tandem = require( 'TANDEM/Tandem' );

  class ChargedParticle extends ModelElement {

    // TODO: Should the required options be renamed to 'config'?
    /**
     * @param {number} charge - (positive=+1 or negative=-1)
     * @param {Vector2} initialPosition
     * @param {Object} [options] - required actually to supply tandem
     * @private - see createGroup
     */
    constructor( charge, initialPosition, options ) {
      options = merge( {
        tandem: Tandem.REQUIRED,
        phetioType: ChargedParticleIO,
        phetioDynamicElement: true
      }, options );
      super( initialPosition, options );
      assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

      // @public (read-only) {number} - a charge of one corresponds to one nano Coulomb
      this.charge = charge;
    }
  }

  return chargesAndFields.register( 'ChargedParticle', ChargedParticle );
} );
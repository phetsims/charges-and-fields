// Copyright 2014-2018, University of Colorado Boulder

/**
 * Type of a charged particle
 * The particle has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const ChargedParticleIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticleIO' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  const Tandem = require( 'TANDEM/Tandem' );

  class ChargedParticle extends ModelElement {

    /**
     * @param {number} charge - (positive=+1 or negative=-1)
     * @param {Object} options - required actually to supply tandem
     */
    constructor( charge, options ) {

      options = _.extend( { tandem: Tandem.required, phetioType: ChargedParticleIO }, options );

      super( options );

      assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

      // @public read-only
      this.charge = charge; // a charge of one corresponds to one nano Coulomb
    }
  }

  return chargesAndFields.register( 'ChargedParticle', ChargedParticle );
} );
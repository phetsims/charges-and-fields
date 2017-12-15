// Copyright 2014-2017, University of Colorado Boulder

/**
 * Type of a charged particle
 * The particle has charge (+1 or -1) and a position.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var ChargedParticleIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticleIO' );

  /**
   * @param {number} charge - (positive=+1 or negative=-1)
   * @param {Object} options - required actually to supply tandem
   * @constructor
   */
  function ChargedParticle( charge, options ) {

    options = _.extend( { tandem: Tandem.required, phetioType: ChargedParticleIO }, options );

    ModelElement.call( this, options );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public read-only
    this.charge = charge; // a charge of one corresponds to one nano Coulomb
  }

  chargesAndFields.register( 'ChargedParticle', ChargedParticle );

  return inherit( ModelElement, ChargedParticle );
} );
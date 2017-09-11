// Copyright 2014-2015, University of Colorado Boulder

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

  // phet-io modules
  var TChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/TChargedParticle' );

  /**
   *
   * @param {number} charge - (positive=+1 or negative=-1)
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargedParticle( charge, tandem ) {

    ModelElement.call( this, tandem );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    var self = this;

    // @public read-only
    this.charge = charge; // a charge of one corresponds to one nano Coulomb

    tandem.addInstance( this, TChargedParticle );

    this.disposeChargedParticle = function() {
      tandem.removeInstance( self );
    };
  }

  chargesAndFields.register( 'ChargedParticle', ChargedParticle );

  return inherit( ModelElement, ChargedParticle, {
    dispose: function() {
      ModelElement.prototype.dispose.call( this );
      this.disposeChargedParticle();
    }
  } );
} );


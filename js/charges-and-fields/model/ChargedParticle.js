// Copyright 2014-2019, University of Colorado Boulder

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
  const PhetioGroup = require( 'TANDEM/PhetioGroup' );
  const PhetioGroupIO = require( 'TANDEM/PhetioGroupIO' );
  const Tandem = require( 'TANDEM/Tandem' );

  class ChargedParticle extends ModelElement {

    /**
     * @param {number} charge - (positive=+1 or negative=-1)
     * @param {Object} options - required actually to supply tandem
     * @private - see createGroup
     */
    constructor( charge, options ) {
      options = merge( {
        tandem: Tandem.required,
        phetioType: ChargedParticleIO,
        phetioDynamicElement: true
      }, options );
      super( options );
      assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

      // @public (read-only) {number} - a charge of one corresponds to one nano Coulomb
      this.charge = charge;
    }

    /**
     * @public
     * @param tandem
     * @returns {Group}
     */
    static createGroup( tandem ) {
      const myGroup = new PhetioGroup( 'particle', ( tandem, charge, initialPosition ) => {
        const chargedParticle = new ChargedParticle( charge, {
          tandem: tandem,
          initialPosition: initialPosition
        } );
        chargedParticle.returnedToOriginEmitter.addListener( () => myGroup.disposeGroupMember( chargedParticle ) );
        return chargedParticle;
      }, [ 1, null ], {
        tandem: tandem,
        phetioType: PhetioGroupIO( ChargedParticleIO )
      } );
      return myGroup;
    }
  }

  return chargesAndFields.register( 'ChargedParticle', ChargedParticle );
} );
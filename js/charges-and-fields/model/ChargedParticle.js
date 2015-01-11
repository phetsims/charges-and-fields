// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a charged particle
 * The particle has a mutable position and charge.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @param {Vector2} position
   * @param {Number} charge - (positive=+1 or negative=-1)
   * @constructor
   */
  function ChargedParticle( position, charge ) {

    PropertySet.call( this, {

      // @public
      position: position,

      // @public
      userControlled: false
    } );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public read-only
    this.charge = charge;
  }

  return inherit( PropertySet, ChargedParticle, {
    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );

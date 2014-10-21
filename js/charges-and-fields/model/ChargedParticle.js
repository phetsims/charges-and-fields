// Copyright 2002-2014, University of Colorado Boulder

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
   * @param {Number} charge (positive=+1 or negative=-1)
   * @constructor
   */
  function ChargedParticle( position, charge ) {

    PropertySet.call( this, {
      position: position,
      userControlled: false     // Flag that tracks whether the user is dragging this shape around.  Should be set externally, generally by the a
      // view node.
    } );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    this.charge = charge;
  }

  return inherit( PropertySet, ChargedParticle, {
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );

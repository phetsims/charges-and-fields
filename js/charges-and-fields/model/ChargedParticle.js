// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model of a charged particle
 * The particle has a mutable location and charge.
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
   * @param {Vector2} location
   * @param {Number} charge (positive=+1 or negative=-1)
   * @constructor
   */
  function ChargedParticle( location, charge ) {

    PropertySet.call( this, {
      location: location
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

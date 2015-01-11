// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a Sensor Element
 * Used by the Electric Sensors, the electricPotential Sensor and the electricField Grid
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
   * @param {Vector2} electricField
   * @param {Vector2} electricPotential
   * @constructor
   */
  function SensorElement( position, electricField, electricPotential ) {
    PropertySet.call( this, {
      // @public
      position: position,
      // @public
      electricField: electricField,
      // @public
      electricPotential: electricPotential
    } );
  }

  return inherit( PropertySet, SensorElement, {
    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );

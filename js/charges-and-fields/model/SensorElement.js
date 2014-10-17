// Copyright 2002-2014, University of Colorado Boulder

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
   * @param {Vector2} location
   * @param {Vector2} electricField
   * @param {Vector2} electricPotential
   * @param {Boolean} userControlled
   * @constructor
   */
  function SensorElement( location, electricField, electricPotential, userControlled ) {
    PropertySet.call( this, {
      location: location,
      electricField: electricField,
      electricPotential: electricPotential,
      userControlled: userControlled
    } );
  }

  return inherit( PropertySet, SensorElement, {
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );

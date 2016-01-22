// Copyright 2015, University of Colorado Boulder

/**
 * Type of a Static Sensor Element
 * Model element for the electric Field Sensor Grid and the electric Potential Sensor Field
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   *
   * @param {Vector2} position - position of the sensor element
   * @constructor
   */
  function StaticSensorElement( position ) {

    // @public read-only
    this.position = position;

    // @public
    this.electricPotential = 0;  // the default value assumes there are no electric charges on the board

    // @public
    this.electricField = new Vector2( 0, 0 );  // the default value assumes there are no electric charges on the board

  }

  chargesAndFields.register( 'StaticSensorElement', StaticSensorElement );

  return inherit( Object, StaticSensorElement );

} );

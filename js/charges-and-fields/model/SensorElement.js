// Copyright 2014-2015, University of Colorado Boulder

/**
 * Type of a Sensor Element
 * Model element for the electricFieldSensor and the electricPotentialSensor
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Vector2} position - initial position of the sensor element
   * @constructor
   */
  function SensorElement( position, tandem ) {
    ModelElement.call( this, position );

    // @public
    this.addProperty( 'electricField', new Vector2( 0, 0 ) ); // the default value assumes there are no electric charges on the board

    // @public
    this.addProperty( 'electricPotential', 0 ); // the default value assumes there are no electric charges on the board

    tandem.addInstance( this );
  }

  return inherit( ModelElement, SensorElement );
} );

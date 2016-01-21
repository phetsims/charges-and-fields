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
    ModelElement.call( this, tandem, {
      position: position,

      // @public - The default value assumes there are no electric charges on the board
      electricField: new Vector2(),

      // @public - The default value assumes there are no electric charges on the board
      electricPotential: 0
    }, {
      electricField: tandem.createTandem( 'electricFieldProperty' ),
      electricPotential: tandem.createTandem( 'electricPotentialProperty' )
    } );

    tandem.addInstance( this );
  }

  return inherit( ModelElement, SensorElement );
} );

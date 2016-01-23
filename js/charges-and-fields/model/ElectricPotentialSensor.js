// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for the electric potential sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricPotential - function( Vector2 ) : number, computes electric potential at the given
   *                                              point in the model.
   * @param {Tandem} tandem
   */
  function ElectricPotentialSensor( computeElectricPotential, tandem ) {
    var self = this;

    PropertySet.call( this, {
      // @public
      position: new Vector2(),

      // @public - TODO: units?
      electricPotential: 0,

      // @public - Whether the sensor is out in the play area (false when in the toolbox)
      isActive: false
    }, {
      tandemSet: {
        position: tandem.createTandem( 'positionProperty' ),
        electricPotential: tandem.createTandem( 'electricPotentialProperty' ),
        isActive: tandem.createTandem( 'isActiveProperty' )
      }
    } );

    this.computeElectricPotential = computeElectricPotential;

    this.positionProperty.link( this.update.bind( this ) );
  }

  chargesAndFields.register( 'ElectricPotentialSensor', ElectricPotentialSensor );

  return inherit( PropertySet, ElectricPotentialSensor, {
    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update: function() {
      this.electricPotential = this.computeElectricPotential( this.position );
    }
  } );
} );

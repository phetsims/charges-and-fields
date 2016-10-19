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
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricPotential - function( Vector2 ) : number, computes electric potential at the given
   *                                              point in the model.
   * @param {Tandem} tandem
   */
  function ElectricPotentialSensor( computeElectricPotential, tandem ) {

    // @public
    this.positionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2
    } );

    // @public
    this.electricPotentialProperty = new Property( 0, {
      tandem: tandem.createTandem( 'electricPotentialProperty' ),
      phetioValueType: TNumber( { units: 'volts' } )
    } );

    // @public - Whether the sensor is out in the play area (false when in the toolbox)
    this.isActiveProperty = new Property( false, {
      tandem: tandem.createTandem( 'isActiveProperty' ),
      phetioValueType: TBoolean
    } );

    this.computeElectricPotential = computeElectricPotential;

    this.positionProperty.link( this.update.bind( this ) );
  }

  chargesAndFields.register( 'ElectricPotentialSensor', ElectricPotentialSensor );

  return inherit( Object, ElectricPotentialSensor, {
    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update: function() {
      this.electricPotential = this.computeElectricPotential( this.positionProperty.get() );
    },

    reset: function() {
      this.positionProperty.reset();
      this.electricPotentialProperty.reset();
      this.isActiveProperty.reset();
    }
  } );
} );

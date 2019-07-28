// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the electric potential sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const inherit = require( 'PHET_CORE/inherit' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricPotential - function( Vector2 ) : number, computes electric potential at the given
   *                                              point in the model.
   * @param {Tandem} tandem
   */
  function ElectricPotentialSensor( computeElectricPotential, tandem ) {

    // @public
    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @public
    this.electricPotentialProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'electricPotentialProperty' ),
      units: 'volts',
      phetioReadOnly: true
    } );

    // @public - Whether the sensor is out in the play area (false when in the toolbox)
    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
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
      this.electricPotentialProperty.set( this.computeElectricPotential( this.positionProperty.get() ) );
    },

    reset: function() {
      this.positionProperty.reset();
      this.electricPotentialProperty.reset();
      this.isActiveProperty.reset();
    }
  } );
} );

// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for the electric potential sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var TVector2 = require( 'DOT/TVector2' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );

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
    this.electricPotentialProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'electricPotentialProperty' ),
      units: 'volts',
      phetioInstanceDocumentation: 'electricPotentialProperty is updated by the model and should not be set by the user'
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
      this.electricPotentialProperty.set( this.computeElectricPotential( this.positionProperty.get() ) );
    },

    reset: function() {
      this.positionProperty.reset();
      this.electricPotentialProperty.reset();
      this.isActiveProperty.reset();
    }
  } );
} );

// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the electric potential sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricPotential - function( Vector2 ) : number, computes electric potential at the given
   *                                              point in the model.
   * @param {Tandem} tandem
   */
  function ElectricPotentialSensor( computeElectricPotential, tandem ) {

    // @public
    this.positionProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioType: PropertyIO( Vector2IO )
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

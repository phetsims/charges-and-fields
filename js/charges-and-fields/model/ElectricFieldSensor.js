// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ElectricFieldSensorIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensorIO' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricField - function( Vector2 ) : number, computes electric field at the given
   *                                          point in the model.
   * @param {Tandem} tandem
   */
  function ElectricFieldSensor( computeElectricField, tandem ) {

    // @public - electricField Vector in Newtons per Coulomb
    this.electricFieldProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'electricFieldProperty' )
    } );

    ModelElement.call( this, { tandem: tandem, phetioType: ElectricFieldSensorIO } );

    this.computeElectricField = computeElectricField;

    // @public (phet-io)
    this.electricFieldSensorTandem = tandem;

    this.positionProperty.link( this.update.bind( this ) );
  }

  chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );

  return inherit( ModelElement, ElectricFieldSensor, {
    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update: function() {
      var eField = this.computeElectricField( this.positionProperty.get() );

      assert && assert( eField.x !== Infinity && eField.y !== Infinity,
        'E-field is infinity: ' + eField );

      assert && assert( !_.isNaN( eField.x ) && !_.isNaN( eField.y ),
        'E-field is NaN: ' + eField );

      this.electricFieldProperty.set( this.computeElectricField( this.positionProperty.get() ) );
    },

    /**
     * @public
     */
    dispose: function() {
      this.electricFieldProperty.dispose();
      ModelElement.prototype.dispose.call( this );
    }
  } );
} );
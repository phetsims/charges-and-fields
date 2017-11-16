// Copyright 2016-2017, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // phet-io modules
  var ElectricFieldSensorIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensorIO' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricField - function( Vector2 ) : number, computes electric field at the given
   *                                          point in the model.
   * @param {Tandem} tandem
   */
  function ElectricFieldSensor( computeElectricField, tandem ) {

    var self = this;

    // @public {Property.<Vector2>} electricField Vector in Newtons per Coulomb
    this.electricFieldProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'electricFieldProperty' ),
      phetioType: PropertyIO( Vector2IO )
    } );

    ModelElement.call( this, tandem );

    this.computeElectricField = computeElectricField;

    // @public (phet-io)
    this.electricFieldSensorTandem = tandem;

    this.positionProperty.link( this.update.bind( this ) );

    this.disposeElectricFieldSensor = function() {
      tandem.removeInstance( self );
    };

    tandem.addInstance( this, { phetioType: ElectricFieldSensorIO } );
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
      this.disposeElectricFieldSensor();
      this.electricFieldProperty.dispose();
      ModelElement.prototype.dispose.call( this );
    }
  } );
} );
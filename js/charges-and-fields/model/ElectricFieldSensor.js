// Copyright 2016, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {Function} computeElectricField - function( Vector2 ) : number, computes electric field at the given
   *                                          point in the model.
   * @param {Tandem} tandem
   */
  function ElectricFieldSensor( computeElectricField, tandem ) {

    var self = this;

    ModelElement.call( this, tandem, {
      electricField: new Vector2() // @public -  electricField Vector in Newtons per Coulomb
    }, {
      electricField: tandem.createTandem( 'electricFieldProperty' )
    } );

    this.computeElectricField = computeElectricField;

    this.positionProperty.link( this.update.bind( this ) );

    this.disposeElectricFieldSensor = function() {
      self.unlinkAll();
    };

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );

  return inherit( ModelElement, ElectricFieldSensor, {
    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update: function() {
      var eField = this.computeElectricField( this.position );

      assert && assert( eField.x !== Infinity && eField.y !== Infinity,
        'E-field is infinity: ' + eField );

      assert && assert( !_.isNaN( eField.x ) && !_.isNaN( eField.y ),
        'E-field is NaN: ' + eField );

      this.electricField = this.computeElectricField( this.position );
    },

    dispose: function() {
      this.disposeElectricFieldSensor();
    }
  } );
} );


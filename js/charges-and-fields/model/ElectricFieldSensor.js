// Copyright 2014-2015, University of Colorado Boulder

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

    ModelElement.call( this, tandem, {
      electricField: new Vector2() // @public -  electricField Vector in Newtons per Coulomb
    }, {
      electricField: tandem.createTandem( 'electricFieldProperty' )
    } );

    this.computeElectricField = computeElectricField;

    this.positionProperty.link( this.update.bind( this ) );

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );

  return inherit( ModelElement, ElectricFieldSensor, {
    /**
     * Should be called to update the value of this sensor.
     * @public
     */
    update: function() {
      this.electricField = this.computeElectricField( this.position );
    }
  } );
} );

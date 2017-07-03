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
  var Property = require( 'AXON/Property' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var TVector2 = require( 'DOT/TVector2' );

  // phet-io modules
  var TElectricFieldSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/TElectricFieldSensor' );

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
      phetioValueType: TVector2
    } );

    ModelElement.call( this, tandem );

    this.computeElectricField = computeElectricField;

    this.positionProperty.link( this.update.bind( this ) );

    this.disposeElectricFieldSensor = function() {
      tandem.removeInstance( self );
    };

    tandem.addInstance( this, TElectricFieldSensor );
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
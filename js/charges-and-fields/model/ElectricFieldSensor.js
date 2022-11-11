// Copyright 2016-2022, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElement from './ModelElement.js';

class ElectricFieldSensor extends ModelElement {

  /**
   * @param {Function} computeElectricField - function( Vector2 ) : number, computes electric field at the given
   *                                          point in the model.
   * @param {Vector2} initialPosition - optionally pass an initialPosition for the animating home from toolbox.
   *                                        This is to support PhET-iO State.
   * @param {Tandem} tandem
   */
  constructor( computeElectricField, initialPosition, tandem ) {

    super( initialPosition, {
      tandem: tandem,
      phetioDynamicElement: true
    } );

    // @public - electricField Vector in Newtons per Coulomb
    this.electricFieldProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'electricFieldProperty' )
    } );

    this.computeElectricField = computeElectricField;

    // @public (phet-io)
    this.electricFieldSensorTandem = tandem;

    this.positionProperty.link( this.update.bind( this ) );
  }

  /**
   * Should be called to update the value of this sensor.
   * @public
   */
  update() {
    const eField = this.computeElectricField( this.positionProperty.get() );

    assert && assert( eField.x !== Infinity && eField.y !== Infinity, `E-field is infinity: ${eField}` );
    assert && assert( !_.isNaN( eField.x ) && !_.isNaN( eField.y ), `E-field is NaN: ${eField}` );

    this.electricFieldProperty.set( this.computeElectricField( this.positionProperty.get() ) );
  }

  /**
   * @public
   */
  dispose() {
    this.electricFieldProperty.dispose();
    super.dispose();
  }
}

chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );
export default ElectricFieldSensor;

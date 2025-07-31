// Copyright 2016-2025, University of Colorado Boulder

/**
 * Model for the electric field sensor
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElement from './ModelElement.js';

export default class ElectricFieldSensor extends ModelElement {

  // electricField Vector in Newtons per Coulomb
  public readonly electricFieldProperty: Vector2Property;

  public readonly computeElectricField: ( position: Vector2 ) => Vector2;

  /**
   * @param computeElectricField - function( Vector2 ) : Vector2, computes electric field at the given point in the model.
   * @param initialPosition - optionally pass an initialPosition for the animating home from toolbox. This is to support PhET-iO State.
   * @param tandem
   */
  public constructor( computeElectricField: ( position: Vector2 ) => Vector2, initialPosition: Vector2, tandem: Tandem ) {

    super( initialPosition, {
      tandem: tandem,
      phetioDynamicElement: true
    } );

    this.electricFieldProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'electricFieldProperty' )
    } );

    this.computeElectricField = computeElectricField;

    this.positionProperty.link( this.update.bind( this ) );
  }

  /**
   * Should be called to update the value of this sensor.
   */
  public update(): void {
    const eField = this.computeElectricField( this.positionProperty.get() );

    assert && assert( eField.x !== Infinity && eField.y !== Infinity, `E-field is infinity: ${eField}` );
    assert && assert( !_.isNaN( eField.x ) && !_.isNaN( eField.y ), `E-field is NaN: ${eField}` );

    this.electricFieldProperty.set( this.computeElectricField( this.positionProperty.get() ) );
  }

  /**
   */
  public override dispose(): void {
    this.electricFieldProperty.dispose();
    super.dispose();
  }
}

chargesAndFields.register( 'ElectricFieldSensor', ElectricFieldSensor );
// Copyright 2016-2025, University of Colorado Boulder

/**
 * Model for the electric potential sensor
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import InfiniteNumberIO from '../../../../tandem/js/types/InfiniteNumberIO.js';
import chargesAndFields from '../../chargesAndFields.js';

export default class ElectricPotentialSensor {

  public readonly positionProperty: Vector2Property;

  // Electric potential in volts
  public readonly electricPotentialProperty: Property<number>;

  // Whether the sensor is out in the play area (false when in the toolbox)
  public readonly isActiveProperty: BooleanProperty;

  /**
   * @param computeElectricPotential - function( Vector2 ) : number, computes electric potential at the given point in the model.
   * @param tandem
   */
  public constructor( public readonly computeElectricPotential: ( position: Vector2 ) => number, tandem: Tandem ) {

    this.positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    this.electricPotentialProperty = new Property( 0, {
      tandem: tandem.createTandem( 'electricPotentialProperty' ),
      units: 'V',
      phetioReadOnly: true,
      phetioValueType: InfiniteNumberIO
    } );

    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
    } );

    this.positionProperty.link( this.update.bind( this ) );
  }

  /**
   * Should be called to update the value of this sensor.
   */
  public update(): void {
    this.electricPotentialProperty.set( this.computeElectricPotential( this.positionProperty.get() ) );
  }

  /**
   */
  public reset(): void {
    this.positionProperty.reset();
    this.electricPotentialProperty.reset();
    this.isActiveProperty.reset();
  }
}

chargesAndFields.register( 'ElectricPotentialSensor', ElectricPotentialSensor );
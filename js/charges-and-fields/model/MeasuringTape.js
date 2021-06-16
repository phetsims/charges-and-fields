// Copyright 2016-2021, University of Colorado Boulder

/**
 * Model for the measuring tape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import chargesAndFields from '../../chargesAndFields.js';

class MeasuringTape {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public - Base (start of tape from the container) position
    this.basePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'basePositionProperty' ),
      units: 'm'
    } );

    // @public - Tip (end of measuring tape) position
    this.tipPositionProperty = new Vector2Property( new Vector2( 0.2, 0 ), {
      tandem: tandem.createTandem( 'tipPositionProperty' ),
      units: 'm'
    } );

    // @public - Whether the measuring tape is out in the play area (false when in the toolbox)
    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
    } );
  }

  /**
   * Resets values to their original state
   * @public
   */
  reset() {
    this.basePositionProperty.reset();
    this.tipPositionProperty.reset();
    this.isActiveProperty.reset();
  }
}

chargesAndFields.register( 'MeasuringTape', MeasuringTape );
export default MeasuringTape;
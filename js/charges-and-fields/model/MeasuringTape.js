// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the measuring tape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

define( function( require ) {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function MeasuringTape( tandem ) {

    // @public - Base (start of tape from the container) position
    this.basePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'basePositionProperty' )
    } );

    // @public - Tip (end of measuring tape) position
    this.tipPositionProperty = new Vector2Property( new Vector2( 0.2, 0 ), {
      tandem: tandem.createTandem( 'tipPositionProperty' )
    } );

    // @public - Whether the measuring tape is out in the play area (false when in the toolbox)
    this.isActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isActiveProperty' )
    } );

  }

  chargesAndFields.register( 'MeasuringTape', MeasuringTape );

  return inherit( Object, MeasuringTape, {

    reset: function() {
      this.basePositionProperty.reset();
      this.tipPositionProperty.reset();
      this.isActiveProperty.reset();
    }

  } );
} );

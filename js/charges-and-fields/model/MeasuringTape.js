// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the measuring tape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2Property = require( 'DOT/Vector2Property' );

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

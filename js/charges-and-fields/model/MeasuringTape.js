// Copyright 2016-2017, University of Colorado Boulder

/**
 * Model for the measuring tape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2IO = require( 'DOT/Vector2IO' );
  var Vector2 = require( 'DOT/Vector2' );

  // phet-io modules
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function MeasuringTape( tandem ) {

    // @public - Base (start of tape from the container) position
    this.basePositionProperty = new Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'basePositionProperty' ),
      phetioType: PropertyIO( Vector2IO )
    } );

    // @public - Tip (end of measuring tape) position
    this.tipPositionProperty = new Property( new Vector2( 0.2, 0 ), {
      tandem: tandem.createTandem( 'tipPositionProperty' ),
      phetioType: PropertyIO( Vector2IO )
    } );

    // @public - Whether the measuring tape is out in the play area (false when in the toolbox)
    this.isActiveProperty = new Property( false, {
      tandem: tandem.createTandem( 'isActiveProperty' ),
      phetioType: PropertyIO( BooleanIO )
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

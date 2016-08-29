// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for the measuring tape.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function MeasuringTape( tandem ) {

    PropertySet.call( this, {
      // @public - Base (start of tape from the container) position
      basePosition: new Vector2( 0, 0 ),

      // @public - Tip (end of measuring tape) position
      tipPosition: new Vector2( 0.2, 0 ),

      // @public - Whether the measuring tape is out in the play area (false when in the toolbox)
      isActive: false
    }, {
      tandemSet: {
        basePosition: tandem.createTandem( 'basePositionProperty' ),
        tipPosition: tandem.createTandem( 'tipPositionProperty' ),
        isActive: tandem.createTandem( 'isActiveProperty' )
      }
    } );
  }

  chargesAndFields.register( 'MeasuringTape', MeasuringTape );

  return inherit( PropertySet, MeasuringTape );
} );

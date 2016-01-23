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
  var ModelElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  /**
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function MeasuringTape( tandem ) {

    ModelElement.call( this, tandem, {
      basePosition: new Vector2( 0, 0 ),
      tipPosition: new Vector2( 0.2, 0 ),
      visible: false
    }, {
      basePosition: tandem.createTandem( 'basePositionProperty' ),
      tipPosition: tandem.createTandem( 'tipPositionProperty' ),
      visible: tandem.createTandem( 'visibleProperty' )
    } );

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'MeasuringTape', MeasuringTape );

  return inherit( ModelElement, MeasuringTape );
} );

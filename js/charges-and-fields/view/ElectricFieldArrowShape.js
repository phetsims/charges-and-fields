// Copyright 2016-2017, University of Colorado Boulder

/**
 * Arrow shape for the electric field arrows. Notably, it has a cut-out part in the middle (where the arrow spins around).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   *
   * Drawn pointing to the right, with the origin at the center hole
   */
  function ElectricFieldArrowShape() {
    var ratio = 2 / 5;
    var circleRadius = 2;
    var arrowLength = 40;

    // Main body of the arrow
    ArrowShape.call( this, -ratio * arrowLength, 0, ( 1 - ratio ) * arrowLength, 0, {
      headHeight: 10,
      headWidth: 16,
      tailWidth: 8
    } );

    // Cut a hole in the middle
    this.moveTo( circleRadius, 0 );
    this.arc( 0, 0, circleRadius, 0, 2 * Math.PI, false );
    this.close();
  }

  chargesAndFields.register( 'ElectricFieldArrowShape', ElectricFieldArrowShape );

  return inherit( ArrowShape, ElectricFieldArrowShape );
} );

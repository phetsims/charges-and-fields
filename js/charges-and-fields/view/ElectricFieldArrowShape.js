// Copyright 2016-2019, University of Colorado Boulder

/**
 * Arrow shape for the electric field arrows. Notably, it has a cut-out part in the middle (where the arrow spins around).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  const ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  class ElectricFieldArrowShape extends ArrowShape {

    /**
     * Drawn pointing to the right, with the origin at the center hole
     */
    constructor() {
      const ratio = 2 / 5;
      const circleRadius = 2;
      const arrowLength = 40;

      // Main body of the arrow
      super( -ratio * arrowLength, 0, ( 1 - ratio ) * arrowLength, 0, {
        headHeight: 10,
        headWidth: 16,
        tailWidth: 8
      } );

      // Cut a hole in the middle
      this.moveTo( circleRadius, 0 );
      this.arc( 0, 0, circleRadius, 0, 2 * Math.PI, false );
      this.close();
    }
  }

  return chargesAndFields.register( 'ElectricFieldArrowShape', ElectricFieldArrowShape );
} );

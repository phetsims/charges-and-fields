// Copyright 2016-2021, University of Colorado Boulder

/**
 * Arrow shape for the electric field arrows. Notably, it has a cut-out part in the middle (where the arrow spins around).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import chargesAndFields from '../../chargesAndFields.js';

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

chargesAndFields.register( 'ElectricFieldArrowShape', ElectricFieldArrowShape );
export default ElectricFieldArrowShape;
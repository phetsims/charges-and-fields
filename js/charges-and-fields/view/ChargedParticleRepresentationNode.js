// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the charged particle
 *
 * @author Martin Veillette (Berea College)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path, RadialGradient } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants
const CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS; // radius of a charged particle

class ChargedParticleRepresentationNode extends Node {

  /**
   * Constructor for the scenery node of the charge
   *
   * @param {number} charge
   * @param {Object} [options] - Passed to Node
   */
  constructor( charge, options ) {

    super( options );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // Create and add the circle that represents the charge particle
    const circle = new Circle( CIRCLE_RADIUS );
    this.addChild( circle );

    if ( charge === 1 ) {
      circle.fill = new RadialGradient( 0, 0, CIRCLE_RADIUS * 0.2, 0, 0, CIRCLE_RADIUS * 1 )
        .addColorStop( 0, 'rgb(255,43,79)' ) // mostly red
        .addColorStop( 0.5, 'rgb(245, 60, 44 )' )
        .addColorStop( 1, 'rgb(232,9,0)' );
    }
    else {
      // then it must be a negative charge
      circle.fill = new RadialGradient( 0, 0, CIRCLE_RADIUS * 0.2, 0, 0, CIRCLE_RADIUS * 1 )
        .addColorStop( 0, 'rgb(79,207,255)' ) // mostly blue
        .addColorStop( 0.5, 'rgb(44, 190, 245)' )
        .addColorStop( 1, 'rgb(0,169,232)' );
    }

    // Create and add a plus or minus sign on the center of the circle based on the charge of the particle
    const ratio = 0.6; // relative size of the sign shape relative to the radius of the Circle
    const pathOptions = { centerX: 0, centerY: 0, lineWidth: CIRCLE_RADIUS * 0.3, stroke: 'white', pickable: false };
    if ( charge === 1 ) {
      // plus Shape representing a positive charge
      const plusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 )
        .moveTo( 0, -CIRCLE_RADIUS * ratio )
        .lineTo( 0, CIRCLE_RADIUS * ratio );
      this.addChild( new Path( plusShape, pathOptions ) );
    }
    else {
      // minus Shape representing a negative charge
      const minusShape = new Shape().moveTo( -CIRCLE_RADIUS * ratio, 0 )
        .lineTo( CIRCLE_RADIUS * ratio, 0 );
      this.addChild( new Path( minusShape, pathOptions ) );
    }
  }
}

chargesAndFields.register( 'ChargedParticleRepresentationNode', ChargedParticleRepresentationNode );
export default ChargedParticleRepresentationNode;
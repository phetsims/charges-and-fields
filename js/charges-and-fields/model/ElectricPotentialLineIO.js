// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for ElectricPotentialLine
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2IO from '../../../../dot/js/Vector2IO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElementIO from './ModelElementIO.js';

const ElectricPotentialLineIO = new IOType( 'ElectricPotentialLineIO', {
  isValidValue: v => v instanceof phet.chargesAndFields.ElectricPotentialLine,
  documentation: 'The vector that shows the charge strength and direction.',
  supertype: ModelElementIO,
  toStateObject: electricPotentialLine => ( { position: Vector2IO.toStateObject( electricPotentialLine.position ) } ),
  stateToArgsForConstructor: stateObject => [ Vector2IO.fromStateObject( stateObject.position ) ]
} );

chargesAndFields.register( 'ElectricPotentialLineIO', ElectricPotentialLineIO );
export default ElectricPotentialLineIO;
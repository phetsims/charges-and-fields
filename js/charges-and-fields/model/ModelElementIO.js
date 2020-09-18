// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for ModelElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Vector2IO from '../../../../dot/js/Vector2IO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import chargesAndFields from '../../chargesAndFields.js';

const NullableIOVector2IO = NullableIO( Vector2IO );

const ModelElementIO = new IOType( 'ModelElementIO', {

  // TODO: polymorphism with this? https://github.com/phetsims/tandem/issues/211
  isValidValue: e => e instanceof phet.chargesAndFields.ModelElement || e instanceof phet.chargesAndFields.ElectricPotentialLine,
  documentation: 'A Model Element',
  toStateObject: modelElement => ( { initialPosition: NullableIOVector2IO.toStateObject( modelElement.initialPosition ) } ),
  stateToArgsForConstructor: stateObject => [ NullableIOVector2IO.fromStateObject( stateObject.initialPosition ) ]
} );

chargesAndFields.register( 'ModelElementIO', ModelElementIO );
export default ModelElementIO;
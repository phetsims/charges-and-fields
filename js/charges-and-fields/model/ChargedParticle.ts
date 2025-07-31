// Copyright 2025, University of Colorado Boulder

/**
 * ChargedParticle is a charged particle, which has charge (+1 or -1) and a position.
 *
 * NOTE: Due to the way the content of the file changed at the same time it was renamed from *.js to *.ts
 * the normal way of viewing history will not work.
 *
 * Instead, you can use this command to see the history of this file:
 * git log --oneline -- ./js/charges-and-fields/model/ChargedParticle.js ./js/charges-and-fields/model/ChargedParticle.ts
 *
 * See https://github.com/phetsims/charges-and-fields/issues/208#issuecomment-3134618756
 *
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import chargesAndFields from '../../chargesAndFields.js';
import ModelElement, { ModelElementStateObject } from './ModelElement.js';

type ChargedParticleStateObject = {
  charge: number;
} & ModelElementStateObject;

type SelfOptions = {
  // No additional self options
};

type ChargedParticleOptions = SelfOptions & PhetioObjectOptions;

export default class ChargedParticle extends ModelElement {

  // a charge of one corresponds to one nano Coulomb
  public charge: number;

  /**
   * @param charge - (positive=+1 or negative=-1)
   * @param initialPosition
   * @param providedOptions
   */
  public constructor( charge: number, initialPosition: Vector2, providedOptions?: ChargedParticleOptions ) {

    const options = optionize<ChargedParticleOptions, SelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioType: ChargedParticle.ChargedParticleIO,
      phetioDynamicElement: true
    }, providedOptions );

    super( initialPosition, options );
    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    this.charge = charge;
  }

  public static readonly ChargedParticleIO = new IOType( 'ChargedParticleIO', {
    valueType: ChargedParticle,
    supertype: ModelElement.ModelElementIO,
    methods: {
      setCharge: {
        returnType: VoidIO,
        parameterTypes: [ NumberIO ],
        implementation: function( this: ChargedParticle, value: ChargedParticleStateObject ) {
          this.charge = value.charge;
        },
        documentation: 'Set charge (in units of e)',
        invocableForReadOnlyElements: false
      }
    },
    stateSchema: {
      charge: NumberIO
    },
    toStateObject: ( chargedParticle: ChargedParticle ): ChargedParticleStateObject => {
      const parentStateObject = ModelElement.ModelElementIO.toStateObject( chargedParticle ) as ChargedParticleStateObject;
      parentStateObject.charge = chargedParticle.charge;
      return parentStateObject;
    },
    // Put charge first for the chargedParticleGroup create function API.
    stateObjectToCreateElementArguments: ( stateObject: ChargedParticleStateObject ) => [ stateObject.charge ].concat(
      // @ts-expect-error
      ModelElement.ModelElementIO.stateObjectToCreateElementArguments( stateObject )
    )
  } );
}

chargesAndFields.register( 'ChargedParticle', ChargedParticle );
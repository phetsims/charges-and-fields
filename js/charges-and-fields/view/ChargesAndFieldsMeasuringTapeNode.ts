// Copyright 2016-2022, University of Colorado Boulder

/**
 * View for a draggable measuring tape for Charges and Fields.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import MeasuringTape from '../model/MeasuringTape.js';

class ChargesAndFieldsMeasuringTapeNode extends MeasuringTapeNode {

  // The model element
  private readonly measuringTape: MeasuringTape;

  /**
   * @param measuringTape
   * @param snapToGridLines - function({Property.<Vector2>})
   * @param modelViewTransform
   * @param availableModelBoundsProperty - dragBounds for the charged particle
   * @param tandem
   */
  public constructor( measuringTape: MeasuringTape,
                      snapToGridLines: ( positionProperty: Property<Vector2> ) => void,
                      modelViewTransform: ModelViewTransform2,
                      availableModelBoundsProperty: Property<Bounds2>,
                      tandem: Tandem ) {

    super( new Property( { name: ChargesAndFieldsStrings.centimeterUnit, multiplier: 100 } ), {
      visibleProperty: measuringTape.isActiveProperty,
      tandem: tandem,
      dragBounds: availableModelBoundsProperty.get(),
      modelViewTransform: modelViewTransform,
      basePositionProperty: measuringTape.basePositionProperty,
      tipPositionProperty: measuringTape.tipPositionProperty,
      textBackgroundColor: 'rgba( 0, 0, 0, 0.65 )'
    } );

    this.measuringTape = measuringTape;

    this.isTipUserControlledProperty.link( () => snapToGridLines( measuringTape.tipPositionProperty ) );

    this.isBaseUserControlledProperty.link( () => {
      snapToGridLines( measuringTape.basePositionProperty );
      snapToGridLines( measuringTape.tipPositionProperty );
    } );
  }
}

chargesAndFields.register( 'ChargesAndFieldsMeasuringTapeNode', ChargesAndFieldsMeasuringTapeNode );
export default ChargesAndFieldsMeasuringTapeNode;
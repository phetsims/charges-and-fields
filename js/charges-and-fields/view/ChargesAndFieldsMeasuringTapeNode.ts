// Copyright 2016-2022, University of Colorado Boulder

/**
 * View for a draggable measuring tape for Charges and Fields.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';

class ChargesAndFieldsMeasuringTapeNode extends MeasuringTapeNode {

  /**
   * @param {MeasuringTape} measuringTape
   * @param {function} snapToGridLines - function({Property.<Vector2>})
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
   * @param {Tandem} tandem
   */
  constructor( measuringTape,
               snapToGridLines,
               modelViewTransform,
               availableModelBoundsProperty,
               tandem ) {

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
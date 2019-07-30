// Copyright 2016-2019, University of Colorado Boulder

/**
 * View for a draggable measuring tape for Charges and Fields.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const MeasuringTapeNode = require( 'SCENERY_PHET/MeasuringTapeNode' );
  const Property = require( 'AXON/Property' );

  // strings
  const centimeterUnitString = require( 'string!CHARGES_AND_FIELDS/centimeterUnit' );

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

      super( new Property( {
        name: centimeterUnitString,
        multiplier: 100
      } ), measuringTape.isActiveProperty, {
        tandem: tandem,
        dragBounds: availableModelBoundsProperty.get(),
        modelViewTransform: modelViewTransform,
        basePositionProperty: measuringTape.basePositionProperty,
        tipPositionProperty: measuringTape.tipPositionProperty,
        isTipDragBounded: true,
        textBackgroundColor: 'rgba( 0, 0, 0, 0.65 )'
      } );

      this.measuringTape = measuringTape;

      this.getIsTipUserControlledProperty().link( function() {
        snapToGridLines( measuringTape.tipPositionProperty );
      } );

      this.getIsBaseUserControlledProperty().link( function() {
        snapToGridLines( measuringTape.basePositionProperty );
        snapToGridLines( measuringTape.tipPositionProperty );
      } );
    }
  }

  return chargesAndFields.register( 'ChargesAndFieldsMeasuringTapeNode', ChargesAndFieldsMeasuringTapeNode );
} );
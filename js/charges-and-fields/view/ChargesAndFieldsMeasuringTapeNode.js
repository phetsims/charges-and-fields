// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for a draggable measuring tape for Charges and Fields.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MeasuringTapeNode = require( 'SCENERY_PHET/MeasuringTapeNode' );
  var Property = require( 'AXON/Property' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // strings
  var centimeterUnitString = require( 'string!CHARGES_AND_FIELDS/centimeterUnit' );

  /**
   * @constructor
   *
   * @param {MeasuringTape} measuringTape
   * @param {function} snapToGridLines - function({Property.<Vector2>})
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the charged particle
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsMeasuringTapeNode( measuringTape,
                                              snapToGridLines,
                                              modelViewTransform,
                                              availableModelBoundsProperty,
                                              tandem ) {

    var self = this;
    this.measuringTape = measuringTape;

    MeasuringTapeNode.call( this, new Property( {
      name: centimeterUnitString,
      multiplier: 100
    } ), measuringTape.isActiveProperty, {
      tandem: tandem,
      dragBounds: availableModelBoundsProperty.get(),
      modelViewTransform: modelViewTransform,
      basePositionProperty: measuringTape.basePositionProperty,
      tipPositionProperty: measuringTape.tipPositionProperty,
      isTipDragBounded: true
    } );

    this.getIsTipUserControlledProperty().link( function() {
      snapToGridLines( measuringTape.tipPositionProperty );
    } );

    this.getIsBaseUserControlledProperty().link( function() {
      snapToGridLines( measuringTape.basePositionProperty );
      snapToGridLines( measuringTape.tipPositionProperty );
    } );

    this.disposeChargesAndFieldsMeasuringTapeNode = function() {
      tandem.removeInstance( self );
    };
  }

  chargesAndFields.register( 'ChargesAndFieldsMeasuringTapeNode', ChargesAndFieldsMeasuringTapeNode );

  return inherit( MeasuringTapeNode, ChargesAndFieldsMeasuringTapeNode, {
    dispose: function() {
      this.disposeChargesAndFieldsMeasuringTapeNode();
    }
  } );
} );
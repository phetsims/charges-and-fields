// Copyright 2015-2018, University of Colorado Boulder

/**
 * Scenery Node that contains an enclosure for a positive, a negative electric charge and an electric sensor.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const minusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/minusOneNanoC' );
  const plusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/plusOneNanoC' );
  const sensorsString = require( 'string!CHARGES_AND_FIELDS/sensors' );

  const HORIZONTAL_SPACING = 60;
  const VERTICAL_SPACING = 25;
  const Y_MARGIN = 10;

  class ChargesAndSensorsPanel extends Panel {

    /**
     * Enclosure that contains the charges and sensor
     *
     * @param {ChargesAndFieldsModel} model
     * @param {ChargesAndFieldsScreenView} screenView
     * @param {Function} hookDragHandler - function(modelElement,event) Called when the element is dropped into the play
     *                                     area, hooks up the provided event to the modelElement's corresponding view's
     *                                     drag handler (starts the drag).
     * @param {Property.<boolean>} canAddMoreChargedParticlesProperty - Whether more charged particles can be added.
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Tandem} tandem
     */
    constructor( model,
                 screenView,
                 hookDragHandler,
                 canAddMoreChargedParticlesProperty,
                 modelViewTransform,
                 tandem ) {

      // @private {Array.<Node>}
      const draggableItems = [];

      /**
       * @param {Tandem} itemTandem
       * @param {string} label
       * @param {Function} createModelElement - Adds one of these items to the model, and returns the model object.
       * @param {Node} previewNode
       * @param {Property.<boolean>} isVisibleProperty
       */
      function createDraggableItem( itemTandem, label, createModelElement, previewNode, isVisibleProperty ) {
        const labelText = new Text( label, {
          font: ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT,
          fill: ChargesAndFieldsColorProfile.enclosureTextProperty,
          centerX: 0,
          maxWidth: 200
        } );

        const node = new Node( {
          children: [
            previewNode,
            labelText
          ],
          cursor: 'pointer',
          tandem: itemTandem
        } );

        // layout
        labelText.top = 0;
        previewNode.centerY = -VERTICAL_SPACING;

        // When pressed, creates a model element and triggers press() on the corresponding view
        node.addInputListener( {
          down: function( event ) {

            // Don't try to start drags with a right mouse button or an attached pointer.
            if ( !event.canStartPress() ) { return; }

            // Representation node location, so that when being "disposed" it will animate back towards the right place.
            const initialViewPosition = previewNode.getUniqueTrailTo( screenView ).getAncestorMatrix().timesVector2( Vector2.ZERO );

            // Create the new model element.
            const modelElement = createModelElement();
            modelElement.initialPosition = modelViewTransform.viewToModelPosition( initialViewPosition );
            modelElement.isActiveProperty.set( false );

            // Hook up the initial drag to the corresponding view element
            hookDragHandler( modelElement, event );
          }
        } );

        node.mouseArea = node.localBounds;
        node.touchArea = node.localBounds.dilatedXY( HORIZONTAL_SPACING / 2, Y_MARGIN );

        isVisibleProperty.linkAttribute( node, 'visible' );

        draggableItems.push( node );

        return node;
      }

      // {Property.<boolean>}
      const positiveVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewPositiveChargesProperty ], function( canAdd, allowNew ) {
        return canAdd && allowNew;
      } );

      // {Property.<boolean>}
      const negativeVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewNegativeChargesProperty ], function( canAdd, allowNew ) {
        return canAdd && allowNew;
      } );

      // {Property.<boolean>}
      const electricFieldSensorVisibleProperty = model.allowNewElectricFieldSensorsProperty;

      const hboxContent = new HBox( {
        align: 'bottom',
        spacing: HORIZONTAL_SPACING,
        children: [
          createDraggableItem( tandem.createTandem( 'positiveCharge' ),
            plusOneNanoCString,
            function() {
              return model.addPositiveCharge( model.chargedParticleGroupTandem.createNextTandem() );
            },
            new ChargedParticleRepresentationNode( 1 ),
            positiveVisibleProperty ),

          createDraggableItem( tandem.createTandem( 'negativeCharge' ),
            minusOneNanoCString,
            function() {
              return model.addNegativeCharge( model.chargedParticleGroupTandem.createNextTandem() );
            },
            new ChargedParticleRepresentationNode( -1 ),
            negativeVisibleProperty ),

          createDraggableItem( tandem.createTandem( 'electricFieldSensor' ),
            sensorsString,
            function() {
              return model.addElectricFieldSensor( model.electricFieldSensorGroupTandem.createNextTandem() );
            },

            new ElectricFieldSensorRepresentationNode(),
            electricFieldSensorVisibleProperty )
        ]
      } );

      super( hboxContent, {
        lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
        cornerRadius: 5,
        stroke: ChargesAndFieldsColorProfile.enclosureBorderProperty,
        fill: ChargesAndFieldsColorProfile.enclosureFillProperty,
        xMargin: HORIZONTAL_SPACING / 2,
        yMargin: Y_MARGIN,
        tandem: tandem
      } );

      const self = this;

      this.hboxContent = hboxContent;

      draggableItems.forEach( function( draggableItem ) {
        draggableItem.on( 'visibility', self.updateChildrenWithVisibility.bind( self ) );
      } );

      this.draggableItems = draggableItems;

      this.updateChildrenWithVisibility();
    }

    /**
     * Ensures visible items are children, and invisible items are removed.
     * @private
     */
    updateChildrenWithVisibility() {
      this.hboxContent.children = this.draggableItems.filter( function( draggableItem ) {
        return draggableItem.visible;
      } );
    }
  }

  return chargesAndFields.register( 'ChargesAndSensorsPanel', ChargesAndSensorsPanel );
} );

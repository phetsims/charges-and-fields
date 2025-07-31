// Copyright 2015-2025, University of Colorado Boulder

/**
 * Scenery Node that contains an enclosure for a positive, a negative electric charge and an electric sensor.
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargesAndFieldsModel from '../model/ChargesAndFieldsModel.js';
import ChargedParticleRepresentationNode from './ChargedParticleRepresentationNode.js';
import ChargesAndFieldsScreenView from './ChargesAndFieldsScreenView.js';
import ElectricFieldSensorRepresentationNode from './ElectricFieldSensorRepresentationNode.js';

const minusOneNanoCString = ChargesAndFieldsStrings.minusOneNanoC;
const plusOneNanoCString = ChargesAndFieldsStrings.plusOneNanoC;
const sensorsString = ChargesAndFieldsStrings.sensors;

const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 25;
const Y_MARGIN = 10;

export default class ChargesAndSensorsPanel extends Panel {

  private readonly hboxContent: HBox;
  private readonly draggableItems: Node[];

  /**
   * Enclosure that contains the charges and sensor
   *
   * @param model
   * @param screenView
   * @param hookDragHandler - function(modelElement,event) Called when the element is dropped into the play
   *                          area, hooks up the provided event to the modelElement's corresponding view's
   *                          drag handler (starts the drag).
   * @param canAddMoreChargedParticlesProperty - Whether more charged particles can be added.
   * @param modelViewTransform
   * @param tandem
   */
  public constructor( model: ChargesAndFieldsModel,
                      screenView: ChargesAndFieldsScreenView,
                      hookDragHandler: ( modelElement: IntentionalAny, event: IntentionalAny ) => void,
                      canAddMoreChargedParticlesProperty: BooleanProperty,
                      modelViewTransform: ModelViewTransform2,
                      tandem: Tandem ) {

    const draggableItems: Node[] = [];

    /**
     * @param itemTandem
     * @param label
     * @param createModelElement - Adds one of these items to the model, and returns the model object.
     * @param previewNode
     * @param isVisibleProperty
     */
    function createDraggableItem( itemTandem: Tandem, label: string, createModelElement: ( initialPosition: Vector2 ) => IntentionalAny, previewNode: Node, isVisibleProperty: TReadOnlyProperty<boolean> ): Node {
      const labelText = new Text( label, {
        font: ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT,
        fill: ChargesAndFieldsColors.enclosureTextProperty,
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
        down: ( event: IntentionalAny ) => {

          // Don't try to start drags with a right mouse button or an attached pointer.
          if ( !event.canStartPress() ) { return; }

          // Representation node position, so that when being "disposed" it will animate back towards the right place.
          const initialViewPosition = previewNode.getUniqueTrailTo( screenView ).getAncestorMatrix().timesVector2( Vector2.ZERO );

          // Create the new model element with its initial position.
          const modelElement = createModelElement( modelViewTransform.viewToModelPosition( initialViewPosition ) );
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

    const positiveVisibleProperty = new DerivedProperty(
      [ canAddMoreChargedParticlesProperty, model.allowNewPositiveChargesProperty ],
      ( canAdd: boolean, allowNew: boolean ) => canAdd && allowNew
    );

    const negativeVisibleProperty = new DerivedProperty(
      [ canAddMoreChargedParticlesProperty, model.allowNewNegativeChargesProperty ],
      ( canAdd: boolean, allowNew: boolean ) => canAdd && allowNew
    );

    const electricFieldSensorVisibleProperty = model.allowNewElectricFieldSensorsProperty;

    const hboxContent = new HBox( {
      align: 'bottom',
      spacing: HORIZONTAL_SPACING,
      children: [
        createDraggableItem( tandem.createTandem( 'positiveCharge' ),
          plusOneNanoCString,
          ( initialPosition: Vector2 ) => model.addPositiveCharge( initialPosition ),
          new ChargedParticleRepresentationNode( 1 ),
          positiveVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'negativeCharge' ),
          minusOneNanoCString,
          ( initialPosition: Vector2 ) => model.addNegativeCharge( initialPosition ),
          new ChargedParticleRepresentationNode( -1 ),
          negativeVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'electricFieldSensor' ),
          sensorsString,
          ( initialPosition: Vector2 ) => model.addElectricFieldSensor( initialPosition ),

          new ElectricFieldSensorRepresentationNode(),
          electricFieldSensorVisibleProperty )
      ]
    } );

    super( hboxContent, {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      cornerRadius: 5,
      stroke: ChargesAndFieldsColors.enclosureBorderProperty,
      fill: ChargesAndFieldsColors.enclosureFillProperty,
      xMargin: HORIZONTAL_SPACING / 2,
      yMargin: Y_MARGIN,
      tandem: tandem
    } );

    this.hboxContent = hboxContent;

    draggableItems.forEach( ( draggableItem: Node ) => {
      draggableItem.visibleProperty.lazyLink( this.updateChildrenWithVisibility.bind( this ) );
    } );

    this.draggableItems = draggableItems;

    this.updateChildrenWithVisibility();
  }

  /**
   * Ensures visible items are children, and invisible items are removed.
   */
  private updateChildrenWithVisibility(): void {
    this.hboxContent.children = this.draggableItems.filter( ( draggableItem: Node ) => draggableItem.visible );
  }
}

chargesAndFields.register( 'ChargesAndSensorsPanel', ChargesAndSensorsPanel );
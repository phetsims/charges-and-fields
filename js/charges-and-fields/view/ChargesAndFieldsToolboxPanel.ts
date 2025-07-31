// Copyright 2015-2025, University of Colorado Boulder

/**
 * Toolbox from which the user can drag (or otherwise enable) tools.
 * The toolbox includes a measuring tape and an electric potential sensor
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Shape from '../../../../kite/js/Shape.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { rasterizeNode } from '../../../../scenery/js/util/rasterizeNode.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import electricPotentialPanelOutline_png from '../../../mipmaps/electricPotentialPanelOutline_png.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ElectricPotentialSensor from '../model/ElectricPotentialSensor.js';
import MeasuringTape from '../model/MeasuringTape.js';
import ChargesAndFieldsMeasuringTapeNode from './ChargesAndFieldsMeasuringTapeNode.js';
import ElectricPotentialSensorNode from './ElectricPotentialSensorNode.js';

// constants
const CIRCLE_RADIUS = 10; // radius of the circle around the crosshair

const voltageUnitString = ChargesAndFieldsStrings.voltageUnit;

export default class ChargesAndFieldsToolboxPanel extends Panel {

  public constructor( measuringTape: MeasuringTape,
                      electricPotentialSensor: ElectricPotentialSensor,
                      measuringTapeNode: ChargesAndFieldsMeasuringTapeNode,
                      electricPotentialSensorNode: ElectricPotentialSensorNode,
                      modelViewTransform: ModelViewTransform2,
                      availableModelBoundsProperty: Property<Bounds2>,
                      tandem: Tandem ) {

    // Create the icon image for the electricPotential sensor
    const electricPotentialSensorIconNode = ChargesAndFieldsToolboxPanel.createElectricPotentialSensorIcon( tandem ); // {Node}

    // Create the icon image for the measuring Tape
    const measuringTapeIconNode = ChargesAndFieldsToolboxPanel.createMeasuringTapeIcon( tandem ); // {Node}

    // The content panel with the two icons
    const panelContent = new VBox( {
      spacing: 20,
      children: [ electricPotentialSensorIconNode, measuringTapeIconNode ],
      pickable: true,
      excludeInvisibleChildrenFromBounds: false
    } );

    // Options for the panel
    const panelOptions = {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10,
      fill: ChargesAndFieldsColors.controlPanelFillProperty,
      stroke: ChargesAndFieldsColors.controlPanelBorderProperty,
      tandem: tandem
    };

    // add the panelContent
    super( panelContent, panelOptions );

    // determine the distance (in model coordinates) between the tip and the base position of the measuring tape
    const tipToBasePosition = measuringTape.tipPositionProperty.get().minus( measuringTape.basePositionProperty.get() );

    const measuringTapeInputListener: IntentionalAny = {
      down: ( event: IntentionalAny ) => {

        // Don't try to start drags with a right mouse button or an attached pointer.
        if ( !event.canStartPress() ) { return; }

        measuringTape.isActiveProperty.set( true );

        const initialViewPosition = this.globalToParentPoint( event.pointer.point )
          .minus( measuringTapeNode.getLocalBaseCenter() );
        measuringTape.basePositionProperty.set( modelViewTransform.viewToModelPosition( initialViewPosition ) );
        measuringTape.tipPositionProperty.set( measuringTape.basePositionProperty.get().plus( tipToBasePosition ) );

        measuringTapeNode.startBaseDrag( event );
      }
    };

    // When pressed, creates a model element and triggers press() on the corresponding view
    electricPotentialSensorIconNode.addInputListener( {
      down: ( event: IntentionalAny ) => {

        // Don't try to start drags with a right mouse button or an attached pointer.
        if ( !event.canStartPress() ) { return; }

        electricPotentialSensor.isActiveProperty.set( true );

        // initial position of the pointer in the screenView coordinates
        const initialViewPosition = this.globalToParentPoint( event.pointer.point ).plusXY( 0, -electricPotentialPanelOutline_png[ 0 ].height * 6 / 25 );
        electricPotentialSensor.positionProperty.set( modelViewTransform.viewToModelPosition( initialViewPosition ) );

        electricPotentialSensorNode.dragListener.press( event, electricPotentialSensorNode );
      }
    } );

    // Add the listener that will allow the user to click on this and create a model element, then position it in the model.
    measuringTapeIconNode.addInputListener( measuringTapeInputListener );

    // hide and show
    electricPotentialSensor.isActiveProperty.link( visible => electricPotentialSensorIconNode.setVisible( !visible ) );

    // measuringTape visibility has the opposite visibility of the measuringTape Icon
    measuringTape.isActiveProperty.link( active => measuringTapeIconNode.setVisible( !active ) );

    // no need to dispose of this link since this is present for the lifetime of the sim
    availableModelBoundsProperty.link( ( bounds: Bounds2 ) => {

      // TODO: did this mean to say measuringTape.dragBounds??? https://github.com/phetsims/charges-and-fields/issues/203
      measuringTapeInputListener.dragBounds = bounds;
    } );
  }

  /**
   * Returns an icon of the sensor (without the two buttons)
   */
  private static createElectricPotentialSensorIcon( tandem: Tandem ): Node {

    const electricPotentialSensor = new Node( {
      // Show a cursor hand over the sensor icon
      cursor: 'pointer',
      tandem: tandem.createTandem( 'electricPotentialSensor' )
    } );

    // Create and add the centered circle around the crosshair. The origin of this node is the center of the circle
    const circle = new Circle( CIRCLE_RADIUS, {
      lineWidth: 2,
      centerX: 0,
      centerY: 0,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty
    } );

    // Create the crosshair
    const crosshairShape = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    const crosshair = new Path( crosshairShape, {
      centerX: 0,
      centerY: 0,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty
    } );

    // Create the base of the crosshair
    // TODO: why is the fill the same as the stroke? https://github.com/phetsims/charges-and-fields/issues/203
    const crosshairMount = new Rectangle( 0, 0, 0.4 * CIRCLE_RADIUS, 0.4 * CIRCLE_RADIUS, {
      fill: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty,
      tandem: tandem.createTandem( 'crosshairMount' )
    } );

    // Create the voltage Reading reading
    // TODO: Is this internationalized? https://github.com/phetsims/charges-and-fields/issues/203
    const voltageText = new Text( `0.0 ${voltageUnitString}`, {
      font: ChargesAndFieldsConstants.DEFAULT_FONT,
      fill: 'black',
      stroke: 'black',
      maxWidth: 200,
      tandem: tandem.createTandem( 'voltageText' )
    } );
    const outlineImage = new Image( electricPotentialPanelOutline_png, {
      tandem: tandem.createTandem( 'outlineImage' )
    } );
    outlineImage.scale( 0.5 * 6 / 25 );

    // Create the background rectangle behind the voltage Reading
    const backgroundRectangle = new Rectangle( 0, 0, outlineImage.width * 0.8, voltageText.height * 1.5, 5, 5, {
      fill: 'white',
      stroke: 'black',
      tandem: tandem.createTandem( 'backgroundRectangle' )
    } );

    crosshairMount.centerX = circle.centerX;
    crosshairMount.top = circle.bottom;
    voltageText.centerX = circle.centerX;
    backgroundRectangle.centerX = circle.centerX;
    outlineImage.centerX = circle.centerX;
    outlineImage.top = crosshairMount.bottom;
    voltageText.top = outlineImage.top + 20;
    backgroundRectangle.centerY = voltageText.centerY;

    electricPotentialSensor.addChild( crosshairMount );
    electricPotentialSensor.addChild( circle );
    electricPotentialSensor.addChild( crosshair );
    electricPotentialSensor.addChild( outlineImage );
    electricPotentialSensor.addChild( backgroundRectangle );
    electricPotentialSensor.addChild( voltageText );

    return electricPotentialSensor;
  }

  /**
   * Returns an icon of the measuring tape
   */
  private static createMeasuringTapeIcon( tandem: Tandem ): Node {
    // procedure to create an icon Image of a measuringTape
    // first, create an actual measuring tape

    const unspooledMeterTape = 30; // in view coordinates
    const measuringTape = new MeasuringTapeNode( new Property( { name: '', multiplier: 1 } ), {
      tipPositionProperty: new Vector2Property( new Vector2( unspooledMeterTape, 0 ), {
        tandem: tandem.createTandem( 'tipPositionProperty' ),
        phetioDocumentation: 'Tip position of measuring tape'
      } ),
      scale: 0.8, // make it a bit small
      hasValue: false, // let's hide the text label value (the length) for the icon
      tandem: tandem.createTandem( 'measuringTape' )
    } );

    // second, create the measuringTape icon
    const measuringTapeIcon = new Node( { children: [ measuringTape ] } );

    // Create the measuringTape icon using rasterized
    measuringTapeIcon.children = [ rasterizeNode( measuringTape, {
      nodeOptions: {
        cursor: 'pointer',
        tandem: tandem.createTandem( 'measuringTapeIconImage' )
      }
    } ) ];

    return measuringTapeIcon;
  }
}

chargesAndFields.register( 'ChargesAndFieldsToolboxPanel', ChargesAndFieldsToolboxPanel );
// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the ElectricPotentialSensorNode which renders the sensor as a scenery node.
 * The sensor is draggable, has a readout of the electric potential (that matches the
 * electric potential at the crosshair position). The electric potential sensor has two
 * push buttons: One of them send a callback that creates an electric potential line whereas
 * the second push buttons deletes all the electric potential lines on the board.
 *
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Circle, DragListener, HBox, Image, Node, Path, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import electricPotentialPanelOutline_png from '../../../mipmaps/electricPotentialPanelOutline_png.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import PencilButton from './PencilButton.js';

// constants
const CIRCLE_RADIUS = 18; // radius of the circle around the crosshair

const equipotentialString = ChargesAndFieldsStrings.equipotential;
const pattern0Value1UnitsString = ChargesAndFieldsStrings.pattern[ '0value' ][ '1units' ];
const voltageUnitString = ChargesAndFieldsStrings.voltageUnit;


class ElectricPotentialSensorNode extends Node {
  /**
   * TODO: this interface is unwieldy and difficult to navigate.  Why not pass the model with all these functions?
   * @param {ChargesAndFieldsModel} model
   * @param {Function} snapToGridLines - A Function that snap the position to the minor gridlines.
   * @param {Function} getElectricPotentialColor - A function that maps a value of the electric potential to a color
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - drag bounds in model coordinates for the electric potential sensor node
   * @param {Tandem} tandem
   */
  constructor( model,
               snapToGridLines,
               getElectricPotentialColor,
               modelViewTransform,
               availableModelBoundsProperty,
               tandem ) {

    const electricPotentialSensor = model.electricPotentialSensor;

    super( {
      cursor: 'pointer', // Show a cursor hand over the sensor
      tandem: tandem
    } );
    this.modelElement = electricPotentialSensor; // @public (read-only)

    // @public
    this.isUserControlledProperty = new Property( false );

    // Create the centered circle around the crosshair. The origin of this node is the center of the circle
    const circle = new Circle( CIRCLE_RADIUS, {
      lineWidth: 3,
      centerX: 0,
      centerY: 0,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCircleStrokeProperty,
      tandem: tandem.createTandem( 'circle' )
    } );

    // Create the crosshair
    const crosshairShape = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    const crosshair = new Path( crosshairShape, {
      centerX: 0,
      centerY: 0,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty,
      tandem: tandem.createTandem( 'crosshair' )
    } );

    // Create the base of the crosshair
    // TODO: why are the fill and stroke set to the same thing?
    const crosshairMount = new Rectangle( 0, 0, 0.4 * CIRCLE_RADIUS, 0.4 * CIRCLE_RADIUS, {
      fill: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty,
      stroke: ChargesAndFieldsColors.electricPotentialSensorCrosshairStrokeProperty,
      tandem: tandem.createTandem( 'crosshairMount' )
    } );

    // Create the text node above the readout
    const electricPotentialPanelTitleText = new Text( equipotentialString, {
      maxWidth: 85,
      font: ChargesAndFieldsConstants.DEFAULT_FONT,
      fill: ChargesAndFieldsColors.electricPotentialPanelTitleTextProperty,
      tandem: tandem.createTandem( 'electricPotentialPanelTitleText' )
    } );

    // Create the button that allows the board to be cleared of all lines.
    const clearButton = new EraserButton( {
      tandem: tandem.createTandem( 'clearButton' ),
      baseColor: '#f2f2f2',
      iconWidth: 23,
      listener: () => model.clearElectricPotentialLines()
    } );

    // Create the button that allows to plot the ElectricPotential Lines
    const plotElectricPotentialLineButton = new PencilButton( tandem.createTandem( 'plotElectricPotentialLineButton' ), {
      baseColor: '#f2f2f2',
      listener: () => model.addElectricPotentialLine( electricPotentialSensor.positionProperty.get() )
    } );

    const isPlayAreaChargedListener = charged => {
      plotElectricPotentialLineButton.enabled = charged;
    };
    model.isPlayAreaChargedProperty.link( isPlayAreaChargedListener );

    // See see https://github.com/phetsims/charges-and-fields/issues/73
    const doNotStartDragListener = {
      down: event => event.handle()
    };
    clearButton.addInputListener( doNotStartDragListener );
    plotElectricPotentialLineButton.addInputListener( doNotStartDragListener );

    // Create the voltage readout
    const voltageText = new Text( '', {
      maxWidth: 65,
      font: ChargesAndFieldsConstants.DEFAULT_FONT,
      tandem: tandem.createTandem( 'voltageText' ),
      fill: ChargesAndFieldsColors.electricPotentialSensorTextPanelTextFillProperty
    } );

    // The clear and plot buttons
    const buttonsBox = new HBox( {
      spacing: 10,
      children: [ clearButton, plotElectricPotentialLineButton ],
      pickable: true,
      scale: 0.8
    } );

    // Create the background rectangle behind the voltage Reading
    const backgroundAdjustment = 0;
    const backgroundRectangle = new Rectangle(
      backgroundAdjustment,
      0,
      buttonsBox.width - backgroundAdjustment * 2,
      voltageText.height * 1.5, 5, 5, {
        fill: ChargesAndFieldsColors.electricPotentialSensorTextPanelBackgroundProperty,
        stroke: ChargesAndFieldsColors.electricPotentialSensorTextPanelBorderProperty,
        tandem: tandem.createTandem( 'backgroundRectangle' )
      } );

    // Create the body of the sensor
    const outlineImage = new Image( electricPotentialPanelOutline_png, {
      tandem: tandem.createTandem( 'outlineImage' )
    } );

    // Organize the content of the control panel
    const bodyContent = new VBox( {
      spacing: 7,
      children: [ electricPotentialPanelTitleText, backgroundRectangle, buttonsBox ],
      pickable: true
    } );

    /**
     * The voltage readout is updated according to the value of the electric potential
     * @param {number} electricPotential
     */
    function updateVoltageReadout( electricPotential ) {
      voltageText.string = StringUtils.format( pattern0Value1UnitsString, decimalAdjust( electricPotential ), voltageUnitString );
      voltageText.centerX = bodyContent.centerX;
    }

    // update text of the voltage readout according to the current value of the electric potential
    updateVoltageReadout( electricPotentialSensor.electricPotentialProperty.get() );

    // Add the nodes to the body
    const bodyNode = new Node();
    bodyNode.addChild( outlineImage ); // must go first
    bodyNode.addChild( bodyContent );
    bodyNode.addChild( voltageText ); // must be last

    // layout the elements of bodyNode
    outlineImage.scale( 1.55 * 73.6 / outlineImage.width );
    outlineImage.centerX = bodyContent.centerX;
    outlineImage.top = bodyContent.top - 15;
    voltageText.centerX = bodyContent.centerX;
    voltageText.centerY = backgroundRectangle.centerY;

    // the color of the fill tracks the electric potential
    function updateCircleFillWithPotential() {
      updateCircleFill( electricPotentialSensor.electricPotentialProperty.get() );
    }

    ChargesAndFieldsColors.electricPotentialGridZeroProperty.link( updateCircleFillWithPotential );
    ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.link( updateCircleFillWithPotential );
    ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.link( updateCircleFillWithPotential );

    // Add the various components to this node
    this.addChild( crosshairMount );
    this.addChild( circle );
    this.addChild( crosshair );
    this.addChild( bodyNode );

    // layout elements
    crosshairMount.centerX = circle.centerX;
    crosshairMount.top = circle.bottom;
    bodyNode.centerX = crosshairMount.centerX;
    bodyNode.top = crosshairMount.bottom;

    // Register for synchronization with model.
    const positionListener = position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricPotentialSensor.positionProperty.link( positionListener );

    // Update the value of the electric potential on the panel and the fill color on the crosshair
    const potentialListener = electricPotential => {

      // update the text of the voltage
      updateVoltageReadout( electricPotential );

      // the color fill inside the circle changes according to the value of the electric potential
      updateCircleFill( electricPotential );
    };
    electricPotentialSensor.electricPotentialProperty.link( potentialListener );

    // Should be added as a listener by our parent when the time is right
    this.dragListener = new DragListener( {
      positionProperty: electricPotentialSensor.positionProperty,
      tandem: tandem.createTandem( 'dragListener' ),
      dragBoundsProperty: availableModelBoundsProperty,
      transform: modelViewTransform,
      end: () => {
        snapToGridLines( electricPotentialSensor.positionProperty );
      }
    } );
    this.dragListener.isUserControlledProperty.link( controlled => {
      this.isUserControlledProperty.value = controlled;
    } );

    // When dragging, move the electric potential sensor
    this.addInputListener( this.dragListener );

    // Show/Hide this node
    // no need to unlink, stays for the lifetime of the simulation
    electricPotentialSensor.isActiveProperty.linkAttribute( this, 'visible' );

    /**
     * The color fill inside the circle changes according to the value of the electric potential*
     * @param {number} electricPotential
     */
    function updateCircleFill( electricPotential ) {
      circle.fill = getElectricPotentialColor( electricPotential, { transparency: 0.5 } );
    }

    /**
     * Returns a formatted string representing a number, rounded if necessary.
     * For -10 <= `number` <= 10, the returned string has a fixed number of decimal places
     * (determined by maxDecimalPlaces). For abs(number) > 10, the returned string is given a
     * number of significant figures at least equal to the number of decimal places.
     *
     * Example for maxDecimalPlaces = 3:
     * 9999.11 -> 9999  numbers larger than 10^maxDecimalPlaces are rounded to integers
     * 999.111 -> 999.1
     * 99.1111 -> 99.11
     * 9.11111 -> 9.111 numbers smaller than 10 have maxDecimalPlaces decimal places
     * 1.11111 -> 1.111
     * 0.11111 -> 0.111
     * 0.00111 -> 0.001
     * 0.00011 -> 0.000
     *
     * @param {number} number
     * @param {Object} [options]
     * @returns {string}
     */
    function decimalAdjust( number, options ) {
      options = merge( {
        maxDecimalPlaces: 3
      }, options );

      // let's find the exponent as in
      // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
      const absolute = Math.abs( number );
      const exponent = Math.floor( Math.log( absolute ) / Math.log( 10 ) ); // Math.log10 using Math.log

      let decimalPlaces;

      if ( exponent >= options.maxDecimalPlaces ) {
        decimalPlaces = 0;
      }
      else if ( exponent > 0 ) {
        decimalPlaces = options.maxDecimalPlaces - exponent;
      }
      else {
        decimalPlaces = options.maxDecimalPlaces;
      }

      return Utils.toFixed( number, decimalPlaces );
    }

    this.disposeElectricPotentialSensorNode = () => {
      electricPotentialSensor.positionProperty.unlink( positionListener );
      electricPotentialSensor.electricPotentialProperty.unlink( potentialListener );
      model.isPlayAreaChargedProperty.unlink( isPlayAreaChargedListener );
    };
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricPotentialSensorNode();
  }

}

chargesAndFields.register( 'ElectricPotentialSensorNode', ElectricPotentialSensorNode );
export default ElectricPotentialSensorNode;
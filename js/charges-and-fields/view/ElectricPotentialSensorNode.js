// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the ElectricFieldSensorNode which renders the sensor as a scenery node.
 * The sensor is draggable and that can generate or delete an electric potential field line.
 * The sensor has a readout of the electric potential at a given position.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var EraserButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EraserButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PencilButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/PencilButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var CIRCLE_RADIUS = 18; // radius of the circle around the crosshair

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );
  var equipotentialString = require( 'string!CHARGES_AND_FIELDS/equipotential' );

  // images
  var electricPotentialLinePanelOutlineImage = require( 'image!CHARGES_AND_FIELDS/electricPotentialPanelOutline.png' );

  /**
   *
   * @param {SensorElement} electricPotentialSensor - model of the electric potential sensor
   * @param {Function} getElectricPotentialColor - A function that maps a value of the electric potential to a color
   * @param {Function} clearElectricPotentialLines - A function for deleting all electric potential lines in the model
   * @param {Function} addElectricPotentialLine - A function for adding an electric potential line to the model
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragbounds in model coordinates for the electric potential sensor node
   * @param {Property.<boolean>} isElectricPotentialSensorVisibleProperty - control the visibility of this node
   * @constructor
   */
  function ElectricPotentialSensorNode( electricPotentialSensor,
                                        getElectricPotentialColor,
                                        clearElectricPotentialLines,
                                        addElectricPotentialLine,
                                        modelViewTransform,
                                        availableModelBoundsProperty,
                                        isElectricPotentialSensorVisibleProperty ) {

    var electricPotentialSensorNode = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the sensor
      cursor: 'pointer'
    } );

    // Create the centered circle around the crosshair. The origin of this node is the center of the circle
    var circle = new Circle( CIRCLE_RADIUS, { lineWidth: 3, centerX: 0, centerY: 0 } );

    // Create the crosshair
    var crosshairShape = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    var crosshair = new Path( crosshairShape, { centerX: 0, centerY: 0 } );

    // Create the base of the crosshair
    var crosshairMount = new Rectangle( 0, 0, 0.4 * CIRCLE_RADIUS, 0.4 * CIRCLE_RADIUS );

    // Create the text node above the readout
    var electricPotentialPanelTitleText = new Text( equipotentialString, {
      font: ChargesAndFieldsConstants.DEFAULT_FONT
    } );

    // Create the button that allows the board to be cleared of all lines.
    var clearButton = new EraserButton( {
      iconWidth: 26, // width of eraser icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        clearElectricPotentialLines();
      }
    } );

    // Create the button that allows to plot the ElectricPotential Lines
    var plotElectricPotentialLineButton = new PencilButton( {
      iconWidth: 26, // width of pencil icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        // TODO: get rid of timing
        var initialTime = new Date().getTime();
        addElectricPotentialLine();
        var finalTime = new Date().getTime();
        var deltaTime = finalTime - initialTime;
        console.log( 'Time to plot eq line: ', deltaTime, 'ms' );
      }
    } );

    // Create the voltage readout
    var voltageReadout = new Text( '', {
      font: ChargesAndFieldsConstants.DEFAULT_FONT
    } );

    /**
     * The voltage readout is updated according to the value of the electric potential
     * @param {number} electricPotential
     */
    function updateVoltageReadout( electricPotential ) {
      voltageReadout.text = StringUtils.format( pattern_0value_1units, decimalAdjust( electricPotential ), voltageUnitString );
    }

    // update text of the voltage readout according to the current value of the electric potential
    updateVoltageReadout( electricPotentialSensor.electricPotential );

    // The clear and plot buttons
    var buttonsBox = new LayoutBox( {
      orientation: 'horizontal',
      spacing: 20,
      children: [ clearButton, plotElectricPotentialLineButton ],
      pickable: true
    } );

    // Create the background rectangle behind the voltage Reading
    var backgroundRectangle = new Rectangle( 0, 0, buttonsBox.width, voltageReadout.height * 1.5, 5, 5 );

    // Create the body of the sensor
    var outlineImage = new Image( electricPotentialLinePanelOutlineImage );

    // Organize the content of the control panel
    var bodyContent = new LayoutBox( {
      spacing: 10,
      children: [ electricPotentialPanelTitleText, backgroundRectangle, buttonsBox ],
      pickable: true
    } );

    // Add the nodes to the body
    var bodyNode = new Node();
    bodyNode.addChild( outlineImage ); // must go first
    bodyNode.addChild( bodyContent );
    bodyNode.addChild( voltageReadout ); // must be last

    // layout all the remaining nodes
    outlineImage.scale( 1.2 * bodyContent.width / outlineImage.width );
    outlineImage.centerX = bodyContent.centerX;
    outlineImage.top = bodyContent.top - 15;
    voltageReadout.centerX = bodyContent.centerX;
    voltageReadout.centerY = backgroundRectangle.centerY;

    // Link the stroke color for the default/projector mode
    ChargesAndFieldsColors.link( 'electricPotentialSensorCircleStroke', function( color ) {
      circle.stroke = color;
    } );

    // update the colors on the crosshair components when the color profile changes
    ChargesAndFieldsColors.link( 'electricPotentialSensorCrosshairStroke', function( color ) {
      crosshair.stroke = color;
      crosshairMount.fill = color;
      crosshairMount.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'buttonBaseColor', function( color ) {
      clearButton.baseColor = color;
      plotElectricPotentialLineButton.baseColor = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialPanelTitleText', function( color ) {
      electricPotentialPanelTitleText.fill = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelTextFill', function( color ) {
      voltageReadout.fill = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBorder', function( color ) {
      backgroundRectangle.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBackground', function( color ) {
      backgroundRectangle.fill = color;
    } );

    // the color of the fill tracks the electric potential
    ChargesAndFieldsColors.on( 'profileChanged', function() {
      updateCircleFill( electricPotentialSensor.electricPotential );
    } );

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
    electricPotentialSensor.positionProperty.link( function( position ) {
      electricPotentialSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // Update the value of the electric potential on the panel and the fill color on the crosshair
    electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {

      // update the text of the voltage
      updateVoltageReadout( electricPotential );

      // the color fill inside the circle changes according to the value of the electric potential
      updateCircleFill( electricPotential );
    } );

    var movableDragHandler = new MovableDragHandler( electricPotentialSensor.positionProperty, {
      dragBounds: availableModelBoundsProperty.value,
      modelViewTransform: modelViewTransform,
      startDrag: function( event ) {
        electricPotentialSensor.isUserControlledProperty.set( true );
      },
      endDrag: function( event ) {
        electricPotentialSensor.isUserControlledProperty.set( false );
      }
    } );

    // When dragging, move the electric potential sensor
    electricPotentialSensorNode.addInputListener( movableDragHandler );

    //no need to unlink, the sensor is present for the lifetime of the simulation.
    availableModelBoundsProperty.link( function( bounds ) {
      movableDragHandler.setDragBounds( bounds );
    } );

    // Show/Hide this node
    // no need to unlink, stays for the lifetime of the simulation
    isElectricPotentialSensorVisibleProperty.linkAttribute( this, 'visible' );

    /**
     * The color fill inside the circle changes according to the value of the electric potential*
     * @param {number} electricPotential
     */
    function updateCircleFill( electricPotential ) {
      circle.fill = getElectricPotentialColor( electricPotential, { transparency: 0.5 } );
    }

    /**
     * Decimal adjustment of a number.
     * Function that returns (for numbers smaller than ten) a number (as a string)  with a fixed number of decimal places
     * whereas for numbers larger than ten, the number/string is returned a fixed number of significant figures that
     * is at least equal to the number of decimal places (or larger)
     *
     * @param {number} number
     * @param {Object} [options]
     * @returns {string}
     */
    function decimalAdjust( number, options ) {
      options = _.extend( {
        maxDecimalPlaces: 3
      }, options );

      // e.g. for  maxDecimalPlaces: 3
      // 9999.11 -> 9999  (numbers larger than 10^maxDecimalPlaces) are rounded to unity
      // 999.111 -> 999.1
      // 99.1111 -> 99.11
      // 9.11111 -> 9.111
      // 1.11111 -> 1.111
      // 0.11111 -> 0.111
      // 0.01111 -> 0.011
      // 0.00111 -> 0.001
      // 0.00011 -> 0.000

      // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
      var exponent = Math.floor( Math.log10( Math.abs( number ) ) );

      var decimalPlaces;
      if ( exponent >= options.maxDecimalPlaces ) {
        decimalPlaces = 0;
      }
      else if ( exponent > 0 ) {
        decimalPlaces = options.maxDecimalPlaces - exponent;
      }
      else {
        decimalPlaces = options.maxDecimalPlaces;
      }

      return Util.toFixed( number, decimalPlaces );
    }

  }

  return inherit( Node, ElectricPotentialSensorNode );
} );
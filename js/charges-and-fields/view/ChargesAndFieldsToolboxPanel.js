// Copyright 2015-2018, University of Colorado Boulder

/**
 * Toolbox from which the user can drag (or otherwise enable) tools.
 * The toolbox includes a measuring tape and an electric potential sensor
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var MeasuringTapeNode = require( 'SCENERY_PHET/MeasuringTapeNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2Property = require( 'DOT/Vector2Property' );

  // images
  var electricPotentialLinePanelOutlineImage = require( 'mipmap!CHARGES_AND_FIELDS/electricPotentialPanelOutline.png' );
  var electricPotentialPanelOutlineImage = require( 'image!CHARGES_AND_FIELDS/electricPotentialPanelOutline.png' );

  // constants
  var CIRCLE_RADIUS = 10; // radius of the circle around the crosshair

  // strings
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   * Toolbox constructor
   * @param {MeasuringTape} measuringTape
   * @param {ElectricPotentialSensor} electricPotentialSensor
   * @param {ChargesAndFieldsMeasuringTapeNode} measuringTapeNode
   * @param {ElectricPotentialSensorNode} electricPotentialSensorNode
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargesAndFieldsToolboxPanel( measuringTape,
                                         electricPotentialSensor,
                                         measuringTapeNode,
                                         electricPotentialSensorNode,
                                         modelViewTransform,
                                         availableModelBoundsProperty,
                                         tandem ) {
    var self = this;

    // Create the icon image for the electricPotential sensor
    var electricPotentialSensorIconNode = this.createElectricPotentialSensorIcon( tandem ); // {Node}

    // Create the icon image for the measuring Tape
    var measuringTapeIconNode = this.createMeasuringTapeIcon( tandem ); // {Node}

    // The content panel with the two icons
    var panelContent = new LayoutBox( {
      spacing: 20,
      children: [ electricPotentialSensorIconNode, measuringTapeIconNode ],
      pickable: true
    } );

    // Options for the panel
    var panelOptions = {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10,
      fill: ChargesAndFieldsColorProfile.controlPanelFillProperty,
      stroke: ChargesAndFieldsColorProfile.controlPanelBorderProperty,
      tandem: tandem
    };

    // add the panelContent
    Panel.call( this, panelContent, panelOptions );

    // determine the distance (in model coordinates) between the tip and the base position of the measuring tape
    var tipToBasePosition = measuringTape.tipPositionProperty.get().minus( measuringTape.basePositionProperty.get() );

    var measuringTapeMovableDragHandler = {
      down: function( event ) {

        // Don't try to start drags with a right mouse button or an attached pointer.
        if ( !event.canStartPress() ) { return; }

        measuringTape.isActiveProperty.set( true );

        var initialViewPosition = self.globalToParentPoint( event.pointer.point )
          .minus( measuringTapeNode.getLocalBaseCenter() );
        measuringTape.basePositionProperty.set( modelViewTransform.viewToModelPosition( initialViewPosition ) );
        measuringTape.tipPositionProperty.set( measuringTape.basePositionProperty.get().plus( tipToBasePosition ) );

        measuringTapeNode.startBaseDrag( event );
      }
    };

    // When pressed, creates a model element and triggers press() on the corresponding view
    electricPotentialSensorIconNode.addInputListener( {
      down: function( event ) {

        // Don't try to start drags with a right mouse button or an attached pointer.
        if ( !event.canStartPress() ) { return; }

        electricPotentialSensor.isActiveProperty.set( true );

        // initial position of the pointer in the screenView coordinates
        var initialViewPosition = self.globalToParentPoint( event.pointer.point ).plusXY( 0, -electricPotentialPanelOutlineImage.height * 6 / 25 );
        electricPotentialSensor.positionProperty.set( modelViewTransform.viewToModelPosition( initialViewPosition ) );

        electricPotentialSensorNode.movableDragHandler.press( event, electricPotentialSensorNode );
      }
    } );

    // Add the listener that will allow the user to click on this and create a model element, then position it in the model.
    measuringTapeIconNode.addInputListener( measuringTapeMovableDragHandler );

    // hide and show
    electricPotentialSensor.isActiveProperty.link( function( visible ) {
      electricPotentialSensorIconNode.visible = !visible;
    } );

    // measuringTape visibility has the opposite visibility of the measuringTape Icon
    measuringTape.isActiveProperty.link( function( active ) {
      measuringTapeIconNode.visible = !active;
    } );

    // no need to dispose of this link since this is present for the lifetime of the sim
    availableModelBoundsProperty.link( function( bounds ) {
      measuringTapeMovableDragHandler.dragBounds = bounds;
    } );
  }

  chargesAndFields.register( 'ChargesAndFieldsToolboxPanel', ChargesAndFieldsToolboxPanel );

  return inherit( Panel, ChargesAndFieldsToolboxPanel, {
    /**
     * Returns an icon of the sensor (without the two buttons)
     * @private
     * @returns {Node}
     */
    createElectricPotentialSensorIcon: function( tandem ) {

      var node = new Node( {
        // Show a cursor hand over the sensor icon
        cursor: 'pointer',
        tandem: tandem.createTandem( 'electricPotentialSensor' )
      } );

      // Create and add the centered circle around the crosshair. The origin of this node is the center of the circle
      var circle = new Circle( CIRCLE_RADIUS, {
        lineWidth: 2,
        centerX: 0,
        centerY: 0,
        stroke: ChargesAndFieldsColorProfile.electricPotentialSensorCrosshairStrokeProperty
      } );

      // Create the crosshair
      var crosshairShape = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
        .lineTo( CIRCLE_RADIUS, 0 )
        .moveTo( 0, -CIRCLE_RADIUS )
        .lineTo( 0, CIRCLE_RADIUS );
      var crosshair = new Path( crosshairShape, {
        centerX: 0,
        centerY: 0,
        stroke: ChargesAndFieldsColorProfile.electricPotentialSensorCrosshairStrokeProperty
      } );

      // Create the base of the crosshair
      // TODO: why is the fill the same as the stroke?
      var crosshairMount = new Rectangle( 0, 0, 0.4 * CIRCLE_RADIUS, 0.4 * CIRCLE_RADIUS, {
        fill: ChargesAndFieldsColorProfile.electricPotentialSensorCrosshairStrokeProperty,
        stroke: ChargesAndFieldsColorProfile.electricPotentialSensorCrosshairStrokeProperty,
        tandem: tandem.createTandem( 'crosshairMount' )
      } );

      // Create the voltage Reading reading
      var voltageReading = new Text( '0.0' + ' ' + voltageUnitString, {
        font: ChargesAndFieldsConstants.DEFAULT_FONT,
        fill: 'black',
        stroke: 'black',
        maxWidth: 200,
        tandem: tandem.createTandem( 'voltageReading' )
      } );
      var outlineImage = new Image( electricPotentialLinePanelOutlineImage, {
        tandem: tandem.createTandem( 'outlineImage' )
      } );
      outlineImage.scale( 0.5 * 6 / 25 );

      // Create the background rectangle behind the voltage Reading
      var backgroundRectangle = new Rectangle( 0, 0, outlineImage.width * 0.8, voltageReading.height * 1.5, 5, 5, {
        fill: 'white',
        stroke: 'black',
        tandem: tandem.createTandem( 'backgroundRectangle' )
      } );

      crosshairMount.centerX = circle.centerX;
      crosshairMount.top = circle.bottom;
      voltageReading.centerX = circle.centerX;
      backgroundRectangle.centerX = circle.centerX;
      outlineImage.centerX = circle.centerX;
      outlineImage.top = crosshairMount.bottom;
      voltageReading.top = outlineImage.top + 20;
      backgroundRectangle.centerY = voltageReading.centerY;

      node.addChild( crosshairMount );
      node.addChild( circle );
      node.addChild( crosshair );
      node.addChild( outlineImage );
      node.addChild( backgroundRectangle );
      node.addChild( voltageReading );

      return node;
    },

    /**
     * Returns an icon of the measuring tape
     * @private
     * @returns {Node}
     */
    createMeasuringTapeIcon: function( tandem ) {
      // procedure to create an icon Image of a measuringTape
      // first, create an actual measuring tape

      var unspooledMeterTape = 30; // in view coordinates
      var measuringTape = new MeasuringTapeNode( new Property( { name: '', multiplier: 1 } ), new Property( true ), {
        tipPositionProperty: new Vector2Property( new Vector2( unspooledMeterTape, 0 ), {
          tandem: tandem.createTandem( 'tipPositionProperty' ),
          phetioDocumentation: 'Tip position of measuring tape'
        } ),
        scale: 0.8, // make it a bit small
        hasValue: false, // let's hide the text label value (the length) for the icon
        tandem: tandem.createTandem( 'measuringTape' )
      } );

      // second, create the measuringTape icon
      var measuringTapeIcon = new Node( { children: [ measuringTape ] } );

      // Create the measuringTape icon using toImage
      measuringTape.toImage( function( image ) {
        measuringTapeIcon.children = [ new Image( image, {
          cursor: 'pointer',
          tandem: tandem.createTandem( 'measuringTapeIconImage' )
        } ) ];
      }, measuringTape.width - unspooledMeterTape, measuringTape.height - 5, Math.ceil( measuringTape.width ), Math.ceil( measuringTape.height ) );

      return measuringTapeIcon;
    }
  } );
} );


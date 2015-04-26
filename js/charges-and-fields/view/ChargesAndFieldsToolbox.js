// Copyright 2002-2015, University of Colorado Boulder

/**
 * Toolbox from which the user can drag (or otherwise enable) tools.
 * The toolbox includes a measuring tape and an electric potential sensor
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // imports
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var electricPotentialSensorImage = require( 'image!CHARGES_AND_FIELDS/electricPotentialSensorIcon.png' );

  // constants
  var SENSOR_HEIGHT = require( 'image!CHARGES_AND_FIELDS/electricPotentialPanelOutline.png' ).height;
  var MEASURING_TAPE_WIDTH = require( 'image!SCENERY_PHET/measuringTape.png' ).width;
  var MEASURING_TAPE_HEIGHT = require( 'image!SCENERY_PHET/measuringTape.png' ).height;

  /**
   * Toolbox constructor
   * @param {Property.<Vector2>} electricPotentialSensorPositionProperty
   * @param {Property.<boolean>} electricPotentialUserControlledProperty
   * @param {ElectricPotentialSensorNodeNode}  electricPotentialSensorNode
   * @param {Property.<Vector2>} measuringTapeBasePositionProperty
   * @param {Property.<Vector2>} measuringTapeTipPositionProperty
   * @param {Property.<boolean>} measuringTapeUserControlledProperty
   * @param {Property.<boolean>} isElectricPotentialSensorVisibleProperty
   * @param {Property.<boolean>} isMeasuringTapeVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty
   * @constructor
   */
  function ChargesAndFieldsToolbox( electricPotentialSensorPositionProperty,
                                    electricPotentialUserControlledProperty,
                                    electricPotentialSensorNode,
                                    measuringTapeBasePositionProperty,
                                    measuringTapeTipPositionProperty,
                                    measuringTapeUserControlledProperty,
                                    isElectricPotentialSensorVisibleProperty,
                                    isMeasuringTapeVisibleProperty,
                                    modelViewTransform,
                                    availableModelBoundsProperty ) {

    var toolboxPanel = this;

    //TODO fix the slight shift of panel
    // Create the icon image for the electricPotential sensor
    //var electricPotentialSensorIconImage = new Image( electricPotentialSensorImage, {cursor: 'pointer', scale: 0.4} );
    var electricPotentialSensorIcon = electricPotentialSensorNode.getIcon();
    // procedure to create an icon Image of a measuringTape
    // first, create an actual measuring tape
    var measuringTape = new MeasuringTape( new Property( {name: '', multiplier: 1} ), new Property( true ),
      {
        tipPositionProperty: new Property( new Vector2( 30, 0 ) ),
        scale: 0.8 // make it a bit small
      } );
    measuringTape.setTextVisibility( false ); // let's hide the text label value (the length) for the icon

    // second, create the measuringTape icon with a token rectangle, it must be not empty as the panel will throw an error
    // if node is empty
    var measuringTapeIcon = new Node( {children: [ new Rectangle( 0, 0, 1, 1 ) ]} );

    // Create the measuringTape icon using toImage
    measuringTape.toImage( function ( image ) {
      measuringTapeIcon.children = [ new Image( image, {cursor: 'pointer'} ) ];
    } );

    // The content panel with the two icons
    var panelContent = new LayoutBox( {
      orientation: 'vertical',
      spacing: 20,
      children: [ electricPotentialSensorIcon, measuringTapeIcon ],
      pickable: true
    } );

    // Options for the panel
    var panelOptions = {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10
    };

    // add the panelContent
    Panel.call( this, panelContent, panelOptions );

    // determine the distance (in model coordinates) between the tip and the base position of the measuring tape
    var tipToBasePosition = measuringTapeTipPositionProperty.value.minus( measuringTapeBasePositionProperty.value );

    var measuringTapeMovableDragHandler = new SimpleDragHandler(
      {
        parentScreen: null, // needed for coordinate transforms
        modelViewTransform: modelViewTransform,
        dragBounds: availableModelBoundsProperty.value,
        // create a position listener that will move the tip as the base of the measuring tape is dragged
        positionListener: function ( position ) {
          measuringTapeTipPositionProperty.set( position.plus( tipToBasePosition ) );
        },
        start: function ( event ) {
          measuringTapeUserControlledProperty.set( true );

          var testNode = toolboxPanel;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreen = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
          }

          // initial position of the pointer in the screenView coordinates
          var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point );

          // the position of the measuring tape is defined as the position of the base crosshair
          // the cursor should hover over the center of the body of the measuring tape instead.
          // find the offset
          var offsetPosition = new Vector2( MEASURING_TAPE_WIDTH / 2, MEASURING_TAPE_HEIGHT / 2 );

          // position of the measuring Tape in ScreenView coordinates
          var measuringTapeLocation = initialPosition.plus( offsetPosition );

          measuringTapeBasePositionProperty.set( modelViewTransform.viewToModelPosition( measuringTapeLocation ) );
          isMeasuringTapeVisibleProperty.set( true );
          // link the position of base of the measuring tape to the tip of the measuring tape
          measuringTapeBasePositionProperty.link( this.positionListener );
        },
        translate: function ( translationParams ) {
          var unconstrainedLocation = measuringTapeBasePositionProperty.value.plus( this.modelViewTransform.viewToModelDelta( translationParams.delta ) );
          var constrainedLocation = constrainLocation( unconstrainedLocation, availableModelBoundsProperty.value );
          measuringTapeBasePositionProperty.set( constrainedLocation );
        },
        end: function ( event ) {
          measuringTapeUserControlledProperty.set( false );

          measuringTapeBasePositionProperty.unlink( this.positionListener );
        }
      } );

    var electricPotentialSensorMovableDragHandler = new SimpleDragHandler(
      {
        parentScreen: null, // needed for coordinate transforms
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        start: function ( event ) {
          electricPotentialUserControlledProperty.set( true );
          var testNode = toolboxPanel;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreen = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
          }

          // initial position of the pointer in the screenView coordinates
          var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point );

          // recall that the position of the electricPotentialSensor is defined as the position of the crosshair
          // the cursor should not be at the crosshair but at the center bottom of the electricPotential tool
          var offsetPosition = new Vector2( 0, -SENSOR_HEIGHT );

          // position of the  electricPotential sensor in ScreenView coordinates
          var electricPotentialSensorLocation = initialPosition.plus( offsetPosition );
          electricPotentialSensorPositionProperty.set( modelViewTransform.viewToModelPosition( electricPotentialSensorLocation ) );

          isElectricPotentialSensorVisibleProperty.set( true );
        },

        translate: function ( translationParams ) {
          var unconstrainedLocation = electricPotentialSensorPositionProperty.value.plus( this.modelViewTransform.viewToModelDelta( translationParams.delta ) );
          var constrainedLocation = constrainLocation( unconstrainedLocation, availableModelBoundsProperty.value );
          electricPotentialSensorPositionProperty.set( constrainedLocation );
        },

        end: function ( event ) {
          electricPotentialUserControlledProperty.set( false );
        }
      } );

    // Add the listener that will allow the user to click on this and create a model element, then position it in the model.
    measuringTapeIcon.addInputListener( measuringTapeMovableDragHandler );
    electricPotentialSensorIcon.addInputListener( electricPotentialSensorMovableDragHandler );

    ChargesAndFieldsColors.controlPanelFillProperty.link( function ( color ) {
      toolboxPanel.background.fill = color;
    } );

    ChargesAndFieldsColors.controlPanelBorderProperty.link( function ( color ) {
      toolboxPanel.stroke = color;
    } );

    // hide and show
    isElectricPotentialSensorVisibleProperty.link( function ( visible ) {
      electricPotentialSensorIcon.visible = !visible;
    } );

    // measuringTape visibility has the opposite visibility of the measuringTape Icon
    isMeasuringTapeVisibleProperty.link( function ( visible ) {
      measuringTapeIcon.visible = !visible;
    } );

    // no need to dispose of this link since this is present for the lifetime of the sim
    availableModelBoundsProperty.link( function ( bounds ) {
      electricPotentialSensorMovableDragHandler.dragBounds = bounds;
      measuringTapeMovableDragHandler.dragBounds = bounds;
    } );

    /**
     * Constrains a location to some bounds.
     * It returns (1) the same location if the location is within the bounds
     * or (2) a location on the edge of the bounds if the location is outside the bounds
     * @param {Vector2} location
     * @param {Bounds2} bounds
     * @returns {Vector2}
     */
    var constrainLocation = function ( location, bounds ) {
      if ( bounds.containsCoordinates( location.x, location.y ) ) {
        return location;
      }
      else {
        var xConstrained = Math.max( Math.min( location.x, bounds.maxX ), bounds.x );
        var yConstrained = Math.max( Math.min( location.y, bounds.maxY ), bounds.y );
        return new Vector2( xConstrained, yConstrained );
      }
    };

  }

  return inherit( Panel, ChargesAndFieldsToolbox );
} );
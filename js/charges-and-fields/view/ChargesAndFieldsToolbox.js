// Copyright 2002-2015, University of Colorado Boulder

/**
 * Toolbox from which the user can drag (or otherwise enable) tools.
 * The toolbox includes a measuring tape and an electric potential sensor
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // imports
  //var Bounds2 = require( 'DOT/Bounds2' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  //var DerivedProperty = require( 'AXON/DerivedProperty' );
  //var HStrut = require( 'SUN/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  //var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var MeasuringTape = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/MeasuringTape' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenView = require( 'JOIST/ScreenView' );
  //var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );


  // images
  //var measuringTapeImage = require( 'image!SCENERY_PHET/measuringTape.png' );
  var equipotentialSensorImage = require( 'image!CHARGES_AND_FIELDS/equipotentialSensorIcon.png' );

  /**
   * Toolbox constructor
   * @param {Property.<Vector2>} electricPotentialSensorPositionProperty
   * @param {Property.<boolean>}   electricPotentialUserControlledProperty
   * @param {Property.<Vector2>} measuringTapeBasePositionProperty
   * @param {Property.<Vector2>} measuringTapeTipPositionProperty
   * @param {Property.<boolean>}   measuringTapeUserControlledProperty
   * @param {Property.<boolean>} isElectricPotentialSensorVisibleProperty
   * @param {Property.<boolean>} isMeasuringTapeVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty
   * @constructor
   */
  function ChargesAndFieldsToolbox( electricPotentialSensorPositionProperty,
                                    electricPotentialUserControlledProperty,
                                    measuringTapeBasePositionProperty,
                                    measuringTapeTipPositionProperty,
                                    measuringTapeUserControlledProperty,
                                    isElectricPotentialSensorVisibleProperty,
                                    isMeasuringTapeVisibleProperty,
                                    modelViewTransform,
                                    availableModelBoundsProperty ) {

    var toolbox = this;

    Node.call( this );

    // Create the icon image for the equipotential sensor
    var equipotentialSensorIconImage = new Image( equipotentialSensorImage, { cursor: 'pointer', scale: 0.4 } );

    // We want to create an icon Image of a measuringTape
    // First let's create an actual measuring tape
    var measuringTape = new MeasuringTape( new Property( { name: '', multiplier: 1 } ), new Property( true ),
      {
        tipPositionProperty: new Property( new Vector2( 30, 0 ) ),
        scale: 0.8 // make it a bit small
      } );
    measuringTape.setTextVisibility( false ); // let's hide the text label value (the length) for the icon

    // create the measuringTape icon with a token rectangle, it must be not empty as the panel will throw an error
    // if node is empty
    var measuringTapeIcon = new Node( { children: [ new Rectangle( 0, 0, 1, 1 ) ] } );

    // Create the measuringTape icon using toImage
    measuringTape.toImage( function( image ) {
      measuringTapeIcon.children = [ new Image( image, { cursor: 'pointer' } ) ];
    } );

    // The content panel with the two icons
    var panelContent = new LayoutBox( {
      orientation: 'vertical',
      spacing: 20,
      children: [ equipotentialSensorIconImage, measuringTapeIcon ],
      pickable: true
    } );

    // Options for the panel
    var panelOptions = {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      xMargin: 12,
      yMargin: 10
    };

    // Create and add the panel
    var panel = new Panel( panelContent, panelOptions );
    this.addChild( panel );

    var measuringTapeMovableDragHandler = new MovableDragHandler( measuringTapeBasePositionProperty,
      {
        parentScreen: null, // needed for coordinate transforms
        modelViewTransform: modelViewTransform,
        dragBounds: availableModelBoundsProperty.value,
        positionListener: function( position ) {
          measuringTapeTipPositionProperty.set( position.plus( new Vector2( 1, 0 ) ) );
        },
        startDrag: function( event ) {

          measuringTapeUserControlledProperty.set( true );
          var testNode = toolbox;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreen = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
          }

          // initial position of the pointer in the screenView coordinates
          var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point );
          // TODO: get tid of magic number: use displacement vector based on size of the measuring tape (center to the crosshair base)
          measuringTapeBasePositionProperty.set( modelViewTransform.viewToModelPosition( initialPosition.plus( new Vector2( 20, 20 ) ) ) );
          isMeasuringTapeVisibleProperty.set( true );

          measuringTapeBasePositionProperty.link( this.positionListener );
        },
        endDrag: function( event ) {
          measuringTapeUserControlledProperty.set( false );
          measuringTapeBasePositionProperty.unlink( this.positionListener );
        }
      } );


    var equipotentialSensorMovableDragHandler = new MovableDragHandler( electricPotentialSensorPositionProperty,
      {
        parentScreen: null, // needed for coordinate transforms
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {
          electricPotentialUserControlledProperty.set( true );
          var testNode = toolbox;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreen = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
          }

          // initial position of the pointer in the screenView coordinates
          var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point );
// TODO: get tid of magic number: use displacement vector based on size of the equipotential sensor
          electricPotentialSensorPositionProperty.set( modelViewTransform.viewToModelPosition( initialPosition.plus( new Vector2( 0, -150 ) ) ) );
          isElectricPotentialSensorVisibleProperty.set( true );
        },
        endDrag: function( event ) {
          electricPotentialUserControlledProperty.set( false );
        }
      } );

    // Add the listener that will allow the user to click on this and create a model element, then position it in the model.
    measuringTapeIcon.addInputListener( measuringTapeMovableDragHandler );
    equipotentialSensorIconImage.addInputListener( equipotentialSensorMovableDragHandler );

    ChargesAndFieldsColors.controlPanelFillProperty.link( function( color ) {
      panel.background.fill = color;
    } );

    ChargesAndFieldsColors.controlPanelBorderProperty.link( function( color ) {
      panel.stroke = color;
    } );


    // hide and show
    isElectricPotentialSensorVisibleProperty.link( function( visible ) {
      equipotentialSensorIconImage.visible = !visible;
    } );

    // measuringTape visibility has the opposite visibility of the measuringTape Icon
    isMeasuringTapeVisibleProperty.link( function( visible ) {
      measuringTapeIcon.visible = !visible;
    } );

    // no need to dispose of this link since this is present for the lifetime of the sim
    availableModelBoundsProperty.link( function( bounds ) {
      equipotentialSensorMovableDragHandler.setDragBounds( bounds );
      measuringTapeMovableDragHandler.setDragBounds( bounds );
    } );
  }

  return inherit( Node, ChargesAndFieldsToolbox, {
    reset: function() {
    }
  } );

} )
;
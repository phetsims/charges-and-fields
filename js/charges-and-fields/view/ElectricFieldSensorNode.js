// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node for the draggable electric field sensor node.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ElectricFieldSensorRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  var angleUnit = require( 'string!CHARGES_AND_FIELDS/angleUnit' );

  // constants
  var LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {SensorElement} electricFieldSensor
   * @param {Function} addElectricFieldLine - function that add an electricFieldLine to the model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the electric field sensor node
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor,
                                    addElectricFieldLine,
                                    modelViewTransform,
                                    availableModelBoundsProperty,
                                    isValuesVisibleProperty ) {

    ElectricFieldSensorRepresentation.call( this );

    var electricFieldSensorNode = this;

    this.electricFieldSensor = electricFieldSensor;
    this.isValuesVisibleProperty = isValuesVisibleProperty;

    // Expand the touch area
    this.touchArea = this.localBounds.dilated( 10 );

    // Create the E-field arrow, (set the arrow horizontally to start with)
    var arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false
    } );

    // hook up colors for default/projector mode
    var arrowColorFunction = function( color ) {
      arrowNode.stroke = color;
      arrowNode.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorArrow', arrowColorFunction );

    // Create two numerical readouts for the strength and direction of the electric field.
    var textOptions = {
      font: LABEL_FONT,
      pickable: false
    };
    var fieldStrengthLabel = new Text( '', textOptions );
    var directionLabel = new Text( '', textOptions );

    // Hook up colors for default/projector mode
    var labelColorFunction = function( color ) {
      fieldStrengthLabel.fill = color;
      directionLabel.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorLabel', labelColorFunction );

    this.addChild( arrowNode );
    this.addChild( fieldStrengthLabel );
    this.addChild( directionLabel );
    arrowNode.moveToBack(); // the arrow should always be on the back of 'this'

    // layout
    arrowNode.left = 0;
    arrowNode.centerY = 0;
    fieldStrengthLabel.bottom = this.top; // 'this' is the ElectricFieldSensorRepresentation, i.e. the circle
    directionLabel.bottom = fieldStrengthLabel.top;
    fieldStrengthLabel.right = this.left - 20;
    directionLabel.right = fieldStrengthLabel.right;

    // when the electric field changes update the arrow and the labels
    var electricFieldListener = function( electricField ) {
      var magnitude = electricField.magnitude();
      var angle = electricField.angle(); // angle from the model, in radians

      var arrowLength = 15 * magnitude;// arbitrary multiplicative factor for the view

      // note that the angleInView = -1 * angleInModel
      // since the vertical direction is reversed between the view and the model
      // so the text must be updated with angle whereas arrow node must be updated with -angle

      // Update length and direction of the arrow
      arrowNode.setTailAndTip( 0, 0, arrowLength * Math.cos( -angle ), arrowLength * Math.sin( -angle ) );

      // Update the strings in the labels
      var fieldMagnitudeString = Util.toFixed( magnitude, 1 );
      fieldStrengthLabel.text = StringUtils.format( pattern_0value_1units, fieldMagnitudeString, eFieldUnitString );
      var angleString = Util.toFixed( Util.toDegrees( angle ), 1 );
      directionLabel.text = StringUtils.format( pattern_0value_1units, angleString, angleUnit );
    };
    electricFieldSensor.electricFieldProperty.link( electricFieldListener );

    electricFieldSensor.isActiveProperty.link( function( isActive ) {
      arrowNode.visible = isActive;
    } );
    // Show/hide labels
    var isValuesVisibleListener = function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
      directionLabel.visible = isVisible;
    };
    isValuesVisibleProperty.link( isValuesVisibleListener );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricFieldSensor.positionProperty.link( positionListener );

    var movableDragHandler = new MovableDragHandler(
      electricFieldSensor.positionProperty,
      {
        startNewTime: 0,
        startOldTime: 0,
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {

          if ( !electricFieldSensor.isAnimated ) // don't drag nodes that are animated
          {
            electricFieldSensor.isUserControlled = true;
            // Move the sensor to the front of this layer when grabbed by the user.
            electricFieldSensorNode.moveToFront();

            var globalPoint = electricFieldSensorNode.globalToParentPoint( event.pointer.point );

            if ( ChargesAndFieldsGlobals.isElectricFieldLinesSupported ) {
              // Add an electricFieldLine on a double click event
              this.startNewTime = new Date().getTime();
              var timeDifference = this.startNewTime - this.startOldTime; // in milliseconds
              if ( timeDifference < 300 ) {
                var initialTime = new Date().getTime();
                addElectricFieldLine( electricFieldSensor.position );
                var finalTime = new Date().getTime();
                var deltaTime = finalTime - initialTime;
                console.log( 'Time to plot el line: ', deltaTime, 'ms' );
              }
              this.startOldTime = this.startNewTime;
              // do not move the node since we want to be able to double-click on the node
              electricFieldSensor.position = modelViewTransform.viewToModelPosition( globalPoint );
            }
            else {
              // move this node upward so that the cursor touches the bottom of the chargedParticle
              electricFieldSensor.position = modelViewTransform.viewToModelPosition( globalPoint.addXY( 0, -ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS ) );
            }
          }
        },

        endDrag: function( event ) {
          electricFieldSensor.isUserControlled = false;
        }
      } );

    // When dragging, move the electric Field Sensor
    electricFieldSensorNode.addInputListener( movableDragHandler );

    var availableModelBoundsPropertyListener = function( bounds ) {
      movableDragHandler.setDragBounds( bounds );
    };

    availableModelBoundsProperty.link( availableModelBoundsPropertyListener );

    this.availableModelBoundsProperty = availableModelBoundsProperty;

    this.disposeElectricFieldSensor = function() {
      electricFieldSensor.positionProperty.unlink( positionListener );
      electricFieldSensor.electricFieldProperty.unlink( electricFieldListener );
      isValuesVisibleProperty.unlink( isValuesVisibleListener );
      availableModelBoundsProperty.unlink( availableModelBoundsPropertyListener );
    };

  }

  return inherit( ElectricFieldSensorRepresentation, ElectricFieldSensorNode, {
    dispose: function() {
      this.disposeElectricFieldSensor();
    }
  } );
} );
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
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ElectricFieldSensorRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
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
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor, addElectricFieldLine, modelViewTransform, isValuesVisibleProperty ) {

    ElectricFieldSensorRepresentation.call( this );

    var electricFieldSensorNode = this;

    this.electricFieldSensor = electricFieldSensor;
    this.isValuesVisibleProperty = isValuesVisibleProperty;

    // Expand the touch area
    this.touchArea = this.localBounds.dilatedXY( 20, 20 );

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
    this.electricFieldListener = function( electricField ) {
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
    electricFieldSensor.electricFieldProperty.link( this.electricFieldListener );

    // Show/hide labels
    this.isValuesVisibleListener = function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
      directionLabel.visible = isVisible;
    };
    isValuesVisibleProperty.link( this.isValuesVisibleListener );

    // Move the chargedParticle to the front of this layer when grabbed by the user.
    this.userControlledListener = function( userControlled ) {
      if ( userControlled ) {
        electricFieldSensorNode.moveToFront();
      }
    };
    electricFieldSensor.userControlledProperty.link( this.userControlledListener );

    // Register for synchronization with model.
    this.positionListener = function( position ) {
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricFieldSensor.positionProperty.link( this.positionListener );

    // When dragging, move the electric Field Sensor
    electricFieldSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a touchscreen, pick it up
        allowTouchSnag: true,
        //startNewTime: 0,
        //startOldTime: 0,
        start: function( event, trail ) {
          electricFieldSensor.userControlled = true;
          var globalPoint = electricFieldSensorNode.globalToParentPoint( event.pointer.point );
          // move this node upward so that the cursor is below the sensor
          electricFieldSensor.position = modelViewTransform.viewToModelPosition( globalPoint.addXY( 0, -ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS ) );

          //if ( ChargesAndFieldsGlobals.electricFieldLines ) {
          //  // Add an electricFieldLine on a double click event
          //  this.startNewTime = new Date().getTime();
          //  var timeDifference = this.startNewTime - this.startOldTime; // in milliseconds
          //  if ( timeDifference < 200 ) {
          //    addElectricFieldLine( electricFieldSensor.position );
          //  }
          //  this.startOldTime = this.startNewTime;
          //}

        },
        // Translate on drag events
        translate: function( args ) {
          electricFieldSensor.position = modelViewTransform.viewToModelPosition( args.position );

        },
        end: function( event, trail ) {
          electricFieldSensor.userControlled = false;
        }
      } ) );

  }

  return inherit( ElectricFieldSensorRepresentation, ElectricFieldSensorNode, {
    dispose: function() {
      this.electricFieldSensor.positionProperty.unlink( this.positionListener );
      this.electricFieldSensor.userControlledProperty.unlink( this.userControlledListener );
      this.electricFieldSensor.electricFieldProperty.unlink( this.electricFieldListener );
      this.isValuesVisibleProperty.unlink( this.isValuesVisibleListener );
    }
  } );
} );
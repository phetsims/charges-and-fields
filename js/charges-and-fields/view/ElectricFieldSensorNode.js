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
   * @param {Property.<boolean>} valuesIsVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor, addElectricFieldLine, modelViewTransform, valuesIsVisibleProperty ) {

    ElectricFieldSensorRepresentation.call( this );

    var electricFieldSensorNode = this;

    // Create the E-field arrow, (set the arrow horizontally to start with)
    var arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false
    } );

    arrowNode.left = 0;
    arrowNode.centerY = 0;
    this.addChild( arrowNode );
    arrowNode.moveToBack();

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

    var labelColorFunction = function( color ) {
      fieldStrengthLabel.fill = color;
      directionLabel.fill = color;
    };
    ChargesAndFieldsColors.link( 'electricFieldSensorLabel', labelColorFunction );


    this.addChild( fieldStrengthLabel );
    this.addChild( directionLabel );

    // Layout
    fieldStrengthLabel.top = this.bottom;
    directionLabel.top = fieldStrengthLabel.bottom;

    // expand the touch area
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );

    // when the electric field changes update the arrow and the labels
    electricFieldSensor.electricFieldProperty.link( function( electricField ) {
      var magnitude = electricField.magnitude();
      var angle = electricField.angle(); // angle from the model, in radians

      // Update length and direction of the arrow
      arrowNode.setTailAndTip( 0, 0, magnitude, 0 );
      // note that the angleInView = -1 * angleInModel
      // since the vertical direction is reversed between the view and the model
      arrowNode.setRotation( -1 * angle );

      // Update the strings in the labels
      var fieldMagnitudeString = Util.toFixed( magnitude, 1 );
      fieldStrengthLabel.text = StringUtils.format( pattern_0value_1units, fieldMagnitudeString, eFieldUnitString );
      var angleString = Util.toFixed( Util.toDegrees( angle ), 1 );
      directionLabel.text = StringUtils.format( pattern_0value_1units, angleString, angleUnit );
    } );

    // Show/hide labels
    valuesIsVisibleProperty.link( function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
      directionLabel.visible = isVisible;
    } );

    // Move the chargedParticle to the front of this layer when grabbed by the user.
    electricFieldSensor.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {
        electricFieldSensorNode.moveToFront();
      }
    } );


    // Register for synchronization with model.
    electricFieldSensor.positionProperty.link( function( position ) {
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // When dragging, move the electric Field Sensor
    electricFieldSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a touchscreen, pick it up
        startNewTime: 0,
        startOldTime: 0,
        allowTouchSnag: true,
        start: function( event, trail ) {
          electricFieldSensor.userControlled = true;

          if ( ChargesAndFieldsGlobals.electricFieldLines ) {
            // Add an electricFieldLine on a double click event
            this.startNewTime = new Date().getTime();
            var timeDifference = this.startNewTime - this.startOldTime; // in milliseconds
            if ( timeDifference < 200 ) {
              addElectricFieldLine( electricFieldSensor.position );
            }
            this.startOldTime = this.startNewTime;
          }

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

  return inherit( ElectricFieldSensorRepresentation, ElectricFieldSensorNode );
} );
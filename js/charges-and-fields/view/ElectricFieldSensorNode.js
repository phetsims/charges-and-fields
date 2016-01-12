// Copyright 2014-2015, University of Colorado Boulder

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
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var pattern0Value1UnitsString = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  var angleUnitString = require( 'string!CHARGES_AND_FIELDS/angleUnit' );

  // constants
  var LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {SensorElement} electricFieldSensor
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the electric field sensor node
   * @param {Property.<boolean>} isPlayAreaChargedProperty - is there at least one charged particle on the board
   * @param {Property.<boolean>} isValuesVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor,
                                    modelViewTransform,
                                    availableModelBoundsProperty,
                                    isPlayAreaChargedProperty,
                                    isValuesVisibleProperty ) {

    ElectricFieldSensorRepresentationNode.call( this );

    this.modelElement = electricFieldSensor;

    var electricFieldSensorNode = this;

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
    fieldStrengthLabel.bottom = this.top; // 'this' is the ElectricFieldSensorRepresentationNode, i.e. the circle
    directionLabel.bottom = fieldStrengthLabel.top;
    fieldStrengthLabel.right = this.left - 20;
    directionLabel.right = fieldStrengthLabel.right;

    // when the electric field changes update the arrow and the labels
    var electricFieldListener = function( electricField ) {
      var magnitude = electricField.magnitude();
      var angle = electricField.angle(); // angle from the model, in radians

      var arrowLength = 15 * magnitude; // arbitrary multiplicative factor for the view

      // note that the angleInView = -1 * angleInModel
      // since the vertical direction is reversed between the view and the model
      // so the text must be updated with angle whereas arrow node must be updated with -angle

      // Update length and direction of the arrow
      arrowNode.setTailAndTip( 0, 0, arrowLength * Math.cos( -angle ), arrowLength * Math.sin( -angle ) );

      // Update the strings in the labels
      var fieldMagnitudeString = decimalAdjust( magnitude, { maxDecimalPlaces: 2 } );
      fieldStrengthLabel.text = StringUtils.format( pattern0Value1UnitsString, fieldMagnitudeString, eFieldUnitString );
      var angleString = Util.toFixed( Util.toDegrees( angle ), 1 );
      directionLabel.text = StringUtils.format( pattern0Value1UnitsString, angleString, angleUnitString );
    };
    electricFieldSensor.electricFieldProperty.link( electricFieldListener );

    electricFieldSensor.isActiveProperty.link( function( isActive ) {
      arrowNode.visible = isActive;
    } );
    // Show/hide labels
    var isValuesVisibleListener = function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
    };
    isValuesVisibleProperty.link( isValuesVisibleListener );

    // the direction label is visible if (1) 'values' is checked  and (2) there is at least one charge particle  on the board
    var isDirectionLabelVisibleProperty = new DerivedProperty( [ isValuesVisibleProperty, isPlayAreaChargedProperty ],
      function( isValuesVisible, isPlayAreaCharged ) {
        return isValuesVisible && isPlayAreaCharged;
      } );

    // Show/hide labels
    var isDirectionLabelVisibleListener = function( isVisible ) {
      directionLabel.visible = isVisible;
    };
    isDirectionLabelVisibleProperty.link( isDirectionLabelVisibleListener );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricFieldSensor.positionProperty.link( positionListener );

    this.movableDragHandler = new MovableDragHandler(
      electricFieldSensor.positionProperty,
      {
        dragBounds: availableModelBoundsProperty.value,
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {

          if ( !electricFieldSensor.isAnimated ) // don't drag nodes that are animated
          {
            electricFieldSensor.isUserControlledProperty.set( true );
            // Move the sensor to the front of this layer when grabbed by the user.
            electricFieldSensorNode.moveToFront();

            var globalPoint = electricFieldSensorNode.globalToParentPoint( event.pointer.point );

            if ( event.pointer.isTouch ) {
              globalPoint.addXY( 0, -2 * ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS );
            }

            // move this node upward so that the cursor touches the bottom of the chargedParticle
            electricFieldSensor.position = modelViewTransform.viewToModelPosition( globalPoint );

          }
        },

        endDrag: function( event ) {
          electricFieldSensor.isUserControlledProperty.set( false );
        }
      } );

    // When dragging, move the electric Field Sensor
    // electricFieldSensorNode.addInputListener( movableDragHandler );

    var availableModelBoundsPropertyListener = function( bounds ) {
      electricFieldSensorNode.movableDragHandler.setDragBounds( bounds );
    };

    availableModelBoundsProperty.link( availableModelBoundsPropertyListener );

    this.availableModelBoundsProperty = availableModelBoundsProperty;

    this.disposeElectricFieldSensor = function() {
      electricFieldSensor.positionProperty.unlink( positionListener );
      electricFieldSensor.electricFieldProperty.unlink( electricFieldListener );
      isValuesVisibleProperty.unlink( isValuesVisibleListener );
      isDirectionLabelVisibleProperty.unlink( isDirectionLabelVisibleListener );
      availableModelBoundsProperty.unlink( availableModelBoundsPropertyListener );
    };

    /**
     * Decimal adjustment of a number is a function that round a number and returns a string.
     * For numbers between -10 and 10, the return strings has a fixed number of decimal places (determined by maxDecimalPlaces)
     * whereas for numbers larger than ten, (or smaller than -10)  the number returned has with a fixed number of significant figures that
     * is at least equal to the number of decimal places (or larger). See example below
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
      // 9.11111 -> 9.111 (numbers smaller than 10 have maxDecimalPlaces decimal places)
      // 1.11111 -> 1.111
      // 0.11111 -> 0.111
      // 0.00111 -> 0.001
      // 0.00011 -> 0.000

      // let's find the exponent as in
      // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 to -10)
      var exponent = Math.floor( Math.log( Math.abs( number ) ) / Math.log( 10 ) );

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

  return inherit( ElectricFieldSensorRepresentationNode, ElectricFieldSensorNode, {
    dispose: function() {
      this.disposeElectricFieldSensor();
    }
  } );
} );
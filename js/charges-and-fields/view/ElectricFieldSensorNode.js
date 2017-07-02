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
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // strings
  var pattern0Value1UnitsString = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  var angleUnitString = require( 'string!CHARGES_AND_FIELDS/angleUnit' );

  // constants
  var LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  // Max value chosen such that this limit is reached once the sensor is fully enclosed in a charge
  var MIN_ARROW_LENGTH = 1e-9;

  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {ElectricFieldSensor} electricFieldSensor
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the electric field sensor node
   * @param {Property.<boolean>} isPlayAreaChargedProperty - is there at least one charged particle on the board
   * @param {Property.<boolean>} areValuesVisibleProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor,
                                    modelViewTransform,
                                    availableModelBoundsProperty,
                                    isPlayAreaChargedProperty,
                                    areValuesVisibleProperty,
                                    enclosureBounds,
                                    tandem ) {

    ElectricFieldSensorRepresentationNode.call( this );

    var self = this;

    this.modelElement = electricFieldSensor; // @public

    // Expand the touch area
    this.touchArea = this.localBounds.dilated( 10 );

    // Create the E-field arrow, (set the arrow horizontally to start with)
    // TODO: why is the fill and stroke set to the same value?
    var arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false,
      stroke: ChargesAndFieldsColorProfile.electricFieldSensorArrowProperty,
      fill: ChargesAndFieldsColorProfile.electricFieldSensorArrowProperty,
      tandem: tandem.createTandem( 'arrowNode' )
    } );

    // Create two numerical readouts for the strength and direction of the electric field.
    var fieldStrengthLabel = new Text( '', {
      font: LABEL_FONT,
      pickable: false,
      fill: ChargesAndFieldsColorProfile.electricFieldSensorLabelProperty,
      tandem: tandem.createTandem( 'fieldStrengthLabel' )
    } );
    var directionLabel = new Text( '', {
      font: LABEL_FONT,
      pickable: false,
      fill: ChargesAndFieldsColorProfile.electricFieldSensorLabelProperty,
      tandem: tandem.createTandem( 'directionLabel' )
    } );

    this.addChild( arrowNode );
    this.addChild( fieldStrengthLabel );
    this.addChild( directionLabel );
    arrowNode.moveToBack(); // the arrow should always be on the back of 'this'

    // layout
    arrowNode.left = 0;
    arrowNode.centerY = 0;
    fieldStrengthLabel.bottom = this.top; // 'this' is the ElectricFieldSensorRepresentationNode, i.e. the circle
    directionLabel.bottom = fieldStrengthLabel.top;

    // when the electric field changes update the arrow and the labels
    var electricFieldListener = function( electricField ) {
      var magnitude = electricField.magnitude();
      var angle = electricField.angle(); // angle from the model, in radians

      // note that the angleInView = -1 * angleInModel
      // since the vertical direction is reversed between the view and the model
      // so the text must be updated with angle whereas arrow node must be updated with -angle

      // Update the sensor arrow and the electric field labels.
      // Make sure the E-field magnitude is not too large to avoid
      // text overruns and other problems with very large potentials/fields (this
      // typically occurs when the sensor is placed too close to a charge center).
      if ( magnitude < ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE ) {

        // Check that the arrow length is above MIN_ARROW_LENGTH to avoid problems
        // with scenery code attempting to normalize a zero-length vector.
        var arrowLength = 15 * magnitude; // arbitrary multiplicative factor for the view
        if ( arrowLength > MIN_ARROW_LENGTH ) {
          arrowNode.setTailAndTip( 0, 0, arrowLength * Math.cos( -angle ), arrowLength * Math.sin( -angle ) );
          arrowNode.visible = electricFieldSensor.isActiveProperty.get();
        }

        if ( areValuesVisibleProperty.get() ) {
          fieldStrengthLabel.visible = electricFieldSensor.isActiveProperty.get();
          directionLabel.visible = electricFieldSensor.isActiveProperty.get();
        }

        // Update the strings in the labels
        var fieldMagnitudeString = decimalAdjust( magnitude, { maxDecimalPlaces: 2 } );
        fieldStrengthLabel.text = StringUtils.format( pattern0Value1UnitsString, fieldMagnitudeString, eFieldUnitString );

        var angleString = Util.toFixed( Util.toDegrees( angle ), 1 );
        directionLabel.text = isPlayAreaChargedProperty.get() ?
                              StringUtils.format( pattern0Value1UnitsString, angleString, angleUnitString ) : '';

      }
      else {
        arrowNode.visible = false;

        fieldStrengthLabel.text = '-';
        directionLabel.text = '-';
      }

      fieldStrengthLabel.centerX = 0;
      directionLabel.centerX = 0;
    };
    electricFieldSensor.electricFieldProperty.link( electricFieldListener );

    var isActiveListener = function( isActive ) {
      arrowNode.visible = isActive;
      if ( areValuesVisibleProperty.get() ) {
        fieldStrengthLabel.visible = isActive;
        directionLabel.visible = isActive;
      }
    };
    electricFieldSensor.isActiveProperty.link( isActiveListener );

    // Show/hide labels
    var areValuesVisibleListener = function( isVisible ) {
      fieldStrengthLabel.visible = isVisible;
      directionLabel.visible = isVisible;
    };
    areValuesVisibleProperty.link( areValuesVisibleListener );

    // Show/hide field arrow
    var isPlayAreaChargedListener = function( isPlayAreaCharged ) {
      arrowNode.visible = isPlayAreaCharged;
    };
    isPlayAreaChargedProperty.link( isPlayAreaChargedListener );

    // The direction label is visible if:
    // (1) 'values' is checked
    // (2) the net play area charge is marked as nonzero
    var isDirectionLabelVisibleDerivedProperty = new DerivedProperty( [ areValuesVisibleProperty, isPlayAreaChargedProperty ],
      function( areValuesVisible, isPlayAreaCharged ) {
        return areValuesVisible && isPlayAreaCharged;
      } );

    // Show/hide labels
    var isDirectionLabelVisibleListener = function( isVisible ) {
      directionLabel.visible = isVisible;
    };
    isDirectionLabelVisibleDerivedProperty.link( isDirectionLabelVisibleListener );

    // Register for synchronization with model.
    var positionListener = function( position ) {
      self.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricFieldSensor.positionProperty.link( positionListener );

    this.movableDragHandler = new MovableDragHandler(
      electricFieldSensor.positionProperty, {
        tandem: tandem.createTandem( 'movableDragHandler' ),
        dragBounds: availableModelBoundsProperty.get(),
        modelViewTransform: modelViewTransform,
        startDrag: function( event ) {

          if ( !electricFieldSensor.isAnimated ) // don't drag nodes that are animated
          {
            electricFieldSensor.isUserControlledProperty.set( true );
            // Move the sensor to the front of this layer when grabbed by the user.
            self.moveToFront();

            var globalPoint = self.globalToParentPoint( event.pointer.point );

            if ( event.pointer.isTouch ) {
              globalPoint.addXY( 0, -2 * ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS );
            }

            // move this node upward so that the cursor touches the bottom of the chargedParticle
            electricFieldSensor.position = modelViewTransform.viewToModelPosition( globalPoint );

          }
        },

        endDrag: function( event ) {
          electricFieldSensor.isUserControlledProperty.set( false );

          if ( !enclosureBounds.containsPoint( electricFieldSensor.position ) ) {
            electricFieldSensor.isActiveProperty.set( true );
          }

          // Avoid corner-case issue #89. Treat excessively large E-field magnitude as an indicator that r ~ 0
          if ( electricFieldSensor.electricField.magnitude() > ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE ) {
            arrowNode.visible = false;
          }
        }
      } );

    // Conditionally hook up the input handling (and cursor) when the sensor is interactive.
    var isDragListenerAttached = false;
    var isInteractiveListener = function() {
      var isInteractive = electricFieldSensor.isInteractiveProperty.get();

      if ( isDragListenerAttached !== isInteractive ) {
        if ( isInteractive ) {
          self.cursor = 'pointer';
          self.addInputListener( self.movableDragHandler );
        }
        else {
          self.cursor = null;
          self.removeInputListener( self.movableDragHandler );
        }

        isDragListenerAttached = isInteractive;
      }
    };
    electricFieldSensor.isInteractiveProperty.link( isInteractiveListener );

    var availableModelBoundsPropertyListener = function( bounds ) {
      self.movableDragHandler.setDragBounds( bounds );
    };

    availableModelBoundsProperty.link( availableModelBoundsPropertyListener );

    this.availableModelBoundsProperty = availableModelBoundsProperty;

    this.disposeElectricFieldSensorNode = function() {
      arrowNode.dispose();
      electricFieldSensor.isActiveProperty.unlink( isActiveListener );
      electricFieldSensor.isInteractiveProperty.unlink( isInteractiveListener );
      electricFieldSensor.positionProperty.unlink( positionListener );
      electricFieldSensor.electricFieldProperty.unlink( electricFieldListener );
      areValuesVisibleProperty.unlink( areValuesVisibleListener );
      isPlayAreaChargedProperty.unlink( isPlayAreaChargedListener );
      isDirectionLabelVisibleDerivedProperty.unlink( isDirectionLabelVisibleListener );
      isDirectionLabelVisibleDerivedProperty.dispose();
      availableModelBoundsProperty.unlink( availableModelBoundsPropertyListener );
      tandem.removeInstance( self );
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

    tandem.addInstance( this, TNode );
  }

  chargesAndFields.register( 'ElectricFieldSensorNode', ElectricFieldSensorNode );

  return inherit( ElectricFieldSensorRepresentationNode, ElectricFieldSensorNode, {
    dispose: function() {
      ElectricFieldSensorRepresentationNode.prototype.dispose.call( this );
      this.disposeElectricFieldSensorNode();
    }
  } );
} );


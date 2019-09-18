// Copyright 2014-2019, University of Colorado Boulder

/**
 * Scenery Node for the draggable electric field sensor node.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  const ModelElementNodeIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ModelElementNodeIO' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Touch = require( 'SCENERY/input/Touch' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const angleUnitString = require( 'string!CHARGES_AND_FIELDS/angleUnit' );
  const eFieldUnitString = require( 'string!CHARGES_AND_FIELDS/eFieldUnit' );
  const pattern0Value1UnitsString = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );

  // constants
  const LABEL_FONT = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_LABEL_FONT;

  // Max value chosen such that this limit is reached once the sensor is fully enclosed in a charge
  const MIN_ARROW_LENGTH = 1e-9;

  class ElectricFieldSensorNode extends ElectricFieldSensorRepresentationNode {

    /**
     * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
     * @param {ElectricFieldSensor} electricFieldSensor
     * @param {function} snapToGridLines - function( {Property.<Vector2>})
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the electric field sensor node
     * @param {Property.<boolean>} isPlayAreaChargedProperty - is there at least one charged particle on the board
     * @param {Property.<boolean>} areValuesVisibleProperty
     * @param {Bounds2} enclosureBounds
     * @param {Tandem} tandem
     */
    constructor( electricFieldSensor,
                 snapToGridLines,
                 modelViewTransform,
                 availableModelBoundsProperty,
                 isPlayAreaChargedProperty,
                 areValuesVisibleProperty,
                 enclosureBounds,
                 tandem ) {

      super( {
        tandem: tandem,
        phetioDynamicElement: true,
        phetioType: ModelElementNodeIO
      } );

      this.modelElement = electricFieldSensor; // @public (read-only)

      // Expand the touch area
      this.touchArea = this.localBounds.dilated( 10 );

      // Create the E-field arrow, (set the arrow horizontally to start with)
      // TODO: why is the fill and stroke set to the same value?
      const arrowNode = new ArrowNode( 0, 0, 1, 0, {
        pickable: false,
        stroke: ChargesAndFieldsColorProfile.electricFieldSensorArrowProperty,
        fill: ChargesAndFieldsColorProfile.electricFieldSensorArrowProperty,
        tandem: tandem.createTandem( 'arrowNode' )
      } );

      // Create two numerical readouts for the strength and direction of the electric field.
      const fieldStrengthLabel = new Text( '', {
        font: LABEL_FONT,
        pickable: false,
        fill: ChargesAndFieldsColorProfile.electricFieldSensorLabelProperty,
        tandem: tandem.createTandem( 'fieldStrengthLabel' )
      } );
      const directionLabel = new Text( '', {
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
      const electricFieldListener = electricField => {
        const magnitude = electricField.magnitude;
        const angle = electricField.angle; // angle from the model, in radians

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
          const arrowLength = 15 * magnitude; // arbitrary multiplicative factor for the view
          if ( arrowLength > MIN_ARROW_LENGTH ) {
            arrowNode.setTailAndTip( 0, 0, arrowLength * Math.cos( -angle ), arrowLength * Math.sin( -angle ) );
            arrowNode.visible = electricFieldSensor.isActiveProperty.get();
          }

          if ( areValuesVisibleProperty.get() ) {
            fieldStrengthLabel.visible = electricFieldSensor.isActiveProperty.get();
            directionLabel.visible = electricFieldSensor.isActiveProperty.get();
          }

          // Update the strings in the labels
          const fieldMagnitudeString = decimalAdjust( magnitude, { maxDecimalPlaces: 2 } );
          fieldStrengthLabel.text = StringUtils.format( pattern0Value1UnitsString, fieldMagnitudeString, eFieldUnitString );

          const angleString = Util.toFixed( Util.toDegrees( angle ), 1 );
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

      const isActiveListener = isActive => {
        arrowNode.visible = isActive;
        if ( areValuesVisibleProperty.get() ) {
          fieldStrengthLabel.visible = isActive;
          directionLabel.visible = isActive;
        }
      };
      electricFieldSensor.isActiveProperty.link( isActiveListener );

      // Show/hide labels
      const areValuesVisibleListener = isVisible => {
        fieldStrengthLabel.visible = isVisible;
        directionLabel.visible = isVisible;
      };
      areValuesVisibleProperty.link( areValuesVisibleListener );

      // Show/hide field arrow
      const isPlayAreaChargedListener = isPlayAreaCharged => arrowNode.setVisible( isPlayAreaCharged );
      isPlayAreaChargedProperty.link( isPlayAreaChargedListener );

      // The direction label is visible if:
      // (1) 'values' is checked
      // (2) the net play area charge is marked as nonzero
      const isDirectionLabelVisibleDerivedProperty = new DerivedProperty(
        [ areValuesVisibleProperty, isPlayAreaChargedProperty ],
        ( areValuesVisible, isPlayAreaCharged ) => areValuesVisible && isPlayAreaCharged
      );

      // Show/hide labels
      const isDirectionLabelVisibleListener = isVisible => directionLabel.setVisible( isVisible );
      isDirectionLabelVisibleDerivedProperty.link( isDirectionLabelVisibleListener );

      // Register for synchronization with model.
      const positionListener = position => {
        this.translation = modelViewTransform.modelToViewPosition( position );
      };
      electricFieldSensor.positionProperty.link( positionListener );

      this.movableDragHandler = new DragListener( {
        applyOffset: false,
        locationProperty: electricFieldSensor.positionProperty,
        tandem: tandem.createTandem( 'dragListener' ),
        dragBoundsProperty: availableModelBoundsProperty,
        transform: modelViewTransform,
        canStartPress: () => { return !electricFieldSensor.animationTween; },
        offsetLocation: ( point, listener ) => {
          return listener.pointer instanceof Touch ? new Vector2( 0, -2 * ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS ) : Vector2.ZERO;
        },
        start: ( event, listener ) => {
          // Move the sensor to the front of this layer when grabbed by the user.
          this.moveToFront();
        },

        end: ( event, listener ) => {
          snapToGridLines( electricFieldSensor.positionProperty );

          if ( !enclosureBounds.containsPoint( electricFieldSensor.positionProperty.get() ) ) {
            electricFieldSensor.isActiveProperty.set( true );
          }

          // Avoid corner-case issue #89. Treat excessively large E-field magnitude as an indicator that r ~ 0
          if ( electricFieldSensor.electricField.magnitude > ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE ) {
            arrowNode.visible = false;
          }
        }
      } );
      this.movableDragHandler.isUserControlledProperty.link( controlled => electricFieldSensor.isUserControlledProperty.set( controlled ) );

      // Conditionally hook up the input handling (and cursor) when the sensor is interactive.
      let isDragListenerAttached = false;
      const isInteractiveListener = () => {
        const isInteractive = electricFieldSensor.isInteractiveProperty.get();

        if ( isDragListenerAttached !== isInteractive ) {
          if ( isInteractive ) {
            this.cursor = 'pointer';
            this.addInputListener( this.movableDragHandler );
          }
          else {
            this.cursor = null;
            this.removeInputListener( this.movableDragHandler );
          }

          isDragListenerAttached = isInteractive;
        }
      };
      electricFieldSensor.isInteractiveProperty.link( isInteractiveListener );

      this.availableModelBoundsProperty = availableModelBoundsProperty;

      this.disposeElectricFieldSensorNode = () => {
        arrowNode.dispose();
        electricFieldSensor.isActiveProperty.unlink( isActiveListener );
        electricFieldSensor.isInteractiveProperty.unlink( isInteractiveListener );
        electricFieldSensor.positionProperty.unlink( positionListener );
        electricFieldSensor.electricFieldProperty.unlink( electricFieldListener );
        areValuesVisibleProperty.unlink( areValuesVisibleListener );
        isPlayAreaChargedProperty.unlink( isPlayAreaChargedListener );
        isDirectionLabelVisibleDerivedProperty.unlink( isDirectionLabelVisibleListener );
        isDirectionLabelVisibleDerivedProperty.dispose();
        this.movableDragHandler.dispose();
        fieldStrengthLabel.dispose();
        directionLabel.dispose();
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
        const exponent = Math.floor( Math.log( Math.abs( number ) ) / Math.log( 10 ) );

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

        return Util.toFixed( number, decimalPlaces );
      }
    }

    dispose() {
      this.disposeElectricFieldSensorNode();
      super.dispose();
    }
  }

  return chargesAndFields.register( 'ElectricFieldSensorNode', ElectricFieldSensorNode );
} );


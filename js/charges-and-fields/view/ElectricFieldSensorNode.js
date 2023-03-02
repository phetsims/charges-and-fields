// Copyright 2014-2023, University of Colorado Boulder

/**
 * Scenery Node for the draggable electric field sensor node.
 *
 * @author Martin Veillette (Berea College)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { DragListener, Node, Text } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ElectricFieldSensorRepresentationNode from './ElectricFieldSensorRepresentationNode.js';

const angleUnitString = ChargesAndFieldsStrings.angleUnit;
const eFieldUnitString = ChargesAndFieldsStrings.eFieldUnit;
const pattern0Value1UnitsString = ChargesAndFieldsStrings.pattern[ '0value' ][ '1units' ];

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
      phetioType: Node.NodeIO
    } );

    this.modelElement = electricFieldSensor; // @public (read-only)

    // Expand the touch area
    this.touchArea = this.localBounds.dilated( 10 );

    // Create the E-field arrow, (set the arrow horizontally to start with)
    // TODO: why is the fill and stroke set to the same value?
    const arrowNode = new ArrowNode( 0, 0, 1, 0, {
      pickable: false,
      stroke: ChargesAndFieldsColors.electricFieldSensorArrowProperty,
      fill: ChargesAndFieldsColors.electricFieldSensorArrowProperty,
      tandem: tandem.createTandem( 'arrowNode' )
    } );

    // Create two numerical readouts for the strength and direction of the electric field.
    const fieldStrengthLabelText = new Text( '', {
      font: LABEL_FONT,
      pickable: false,
      fill: ChargesAndFieldsColors.electricFieldSensorLabelProperty,
      tandem: tandem.createTandem( 'fieldStrengthLabelText' )
    } );
    const directionLabelText = new Text( '', {
      font: LABEL_FONT,
      pickable: false,
      fill: ChargesAndFieldsColors.electricFieldSensorLabelProperty,
      tandem: tandem.createTandem( 'directionLabelText' )
    } );

    this.addChild( arrowNode );
    this.addChild( fieldStrengthLabelText );
    this.addChild( directionLabelText );
    arrowNode.moveToBack(); // the arrow should always be on the back of 'this'

    // layout
    arrowNode.left = 0;
    arrowNode.centerY = 0;
    fieldStrengthLabelText.bottom = this.top; // 'this' is the ElectricFieldSensorRepresentationNode, i.e. the circle
    directionLabelText.bottom = fieldStrengthLabelText.top;

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
          fieldStrengthLabelText.visible = electricFieldSensor.isActiveProperty.get();
          directionLabelText.visible = electricFieldSensor.isActiveProperty.get();
        }

        // Update the strings in the labels
        const fieldMagnitudeString = decimalAdjust( magnitude, { maxDecimalPlaces: 2 } );
        fieldStrengthLabelText.string = StringUtils.format( pattern0Value1UnitsString, fieldMagnitudeString, eFieldUnitString );

        const angleString = Utils.toFixed( Utils.toDegrees( angle ), 1 );
        directionLabelText.string = isPlayAreaChargedProperty.get() ?
                              StringUtils.format( pattern0Value1UnitsString, angleString, angleUnitString ) : '';

      }
      else {
        arrowNode.visible = false;

        fieldStrengthLabelText.string = '-';
        directionLabelText.string = '-';
      }

      fieldStrengthLabelText.centerX = 0;
      directionLabelText.centerX = 0;
    };
    electricFieldSensor.electricFieldProperty.link( electricFieldListener );

    const isActiveListener = isActive => {
      arrowNode.visible = isActive;
      if ( areValuesVisibleProperty.get() ) {
        fieldStrengthLabelText.visible = isActive;
        directionLabelText.visible = isActive;
      }
    };
    electricFieldSensor.isActiveProperty.link( isActiveListener );

    // Show/hide labels
    const areValuesVisibleListener = isVisible => {
      fieldStrengthLabelText.visible = isVisible;
      directionLabelText.visible = isVisible;
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
    const isDirectionLabelVisibleListener = isVisible => directionLabelText.setVisible( isVisible );
    isDirectionLabelVisibleDerivedProperty.link( isDirectionLabelVisibleListener );

    // Register for synchronization with model.
    const positionListener = position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    };
    electricFieldSensor.positionProperty.link( positionListener );

    this.dragListener = new DragListener( {
      applyOffset: false,
      positionProperty: electricFieldSensor.positionProperty,
      tandem: tandem.createTandem( 'dragListener' ),
      dragBoundsProperty: availableModelBoundsProperty,
      transform: modelViewTransform,
      canStartPress: () => !electricFieldSensor.animationTween,
      offsetPosition: ( point, listener ) => {
        return listener.pointer && listener.pointer.isTouchLike() ? new Vector2( 0, -2 * ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_CIRCLE_RADIUS ) : Vector2.ZERO;
      },
      start: () => {
        // Move the sensor to the front of this layer when grabbed by the user.
        this.moveToFront();
      },

      end: () => {
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
    this.dragListener.isUserControlledProperty.link( controlled => electricFieldSensor.isUserControlledProperty.set( controlled ) );

    // Conditionally hook up the input handling (and cursor) when the sensor is interactive.
    let isDragListenerAttached = false;
    const isInteractiveListener = () => {
      const isInteractive = electricFieldSensor.isInteractiveProperty.get();

      if ( isDragListenerAttached !== isInteractive ) {
        if ( isInteractive ) {
          this.cursor = 'pointer';
          this.addInputListener( this.dragListener );
        }
        else {
          this.cursor = null;
          this.removeInputListener( this.dragListener );
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
      this.dragListener.dispose();
      fieldStrengthLabelText.dispose();
      directionLabelText.dispose();
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
      options = merge( {
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

      return Utils.toFixed( number, decimalPlaces );
    }
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricFieldSensorNode();
    super.dispose();
  }
}

chargesAndFields.register( 'ElectricFieldSensorNode', ElectricFieldSensorNode );
export default ElectricFieldSensorNode;
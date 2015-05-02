// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the ElectricFieldSensorNode which renders the sensor as a scenery node.
 * The sensor is draggable
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var ElectricPotentialSensorBodyNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorBodyNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  // constants
  var CIRCLE_RADIUS = 18; // radius of the circle around the crosshair

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   *
   * @param {SensorElement} electricPotentialSensor - model of the electric potential sensor
   * @param {Function} getElectricPotentialColor - A function that maps a value of the electric potential to a color
   * @param {Function} clearElectricPotentialLines - A function for deleting all electric potential lines in the model
   * @param {Function} addElectricPotentialLine - A function for adding an electric potential line to the model
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragbounds in model coordinates for the electric potential sensor node
   * @param {Property.<boolean>} isElectricPotentialSensorVisibleProperty - control the visibility of this node
   * @constructor
   */
  function ElectricPotentialSensorNode( electricPotentialSensor,
                                        getElectricPotentialColor,
                                        clearElectricPotentialLines,
                                        addElectricPotentialLine,
                                        modelViewTransform,
                                        availableModelBoundsProperty,
                                        isElectricPotentialSensorVisibleProperty ) {

    var electricPotentialSensorNode = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the sensor
      cursor: 'pointer'
    } );

    // Create and add the centered circle around the crosshair. The origin of this node is the center of the circle
    var circle = new Circle( CIRCLE_RADIUS, { lineWidth: 3, centerX: 0, centerY: 0 } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorCircleStroke', function( color ) {
      circle.stroke = color;
    } );

    // Create the crosshair
    var crosshairShape = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    var crosshair = new Path( crosshairShape, { centerX: 0, centerY: 0 } );

    // Create the base of the crosshair
    var crosshairMount = new Rectangle( 0, 0, 0.4 * CIRCLE_RADIUS, 0.4 * CIRCLE_RADIUS );

    // update the colors on the crosshair components when the color profile changes
    ChargesAndFieldsColors.link( 'electricPotentialSensorCrosshairStroke', function( color ) {
      crosshair.stroke = color;
      crosshairMount.fill = color;
      crosshairMount.stroke = color;
    } );

    // Create the panel (body) of the sensor with the readout and push buttons
    var electricPotentialSensorBodyNode = new ElectricPotentialSensorBodyNode( clearElectricPotentialLines, addElectricPotentialLine );

    // Add the various components
    this.addChild( crosshairMount );
    this.addChild( circle );
    this.addChild( crosshair );
    this.addChild( electricPotentialSensorBodyNode );

    // layout elements
    crosshairMount.centerX = circle.centerX;
    crosshairMount.top = circle.bottom;
    electricPotentialSensorBodyNode.centerX = crosshairMount.centerX;
    electricPotentialSensorBodyNode.top = crosshairMount.bottom;

    // Register for synchronization with model.
    electricPotentialSensor.positionProperty.link( function( position ) {
      electricPotentialSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // Update the value of the electric potential on the panel and the fill color on the crosshair
    electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
      electricPotentialSensorBodyNode.voltageReading.text = StringUtils.format( pattern_0value_1units, roundNumber( electricPotential ), voltageUnitString );
      // the color fill inside the circle changes according to the value of the electric potential
      circle.fill = getElectricPotentialColor( electricPotential, { transparency: 0.5 } );
    } );

    ChargesAndFieldsColors.on( 'profileChanged', function() {
      circle.fill = getElectricPotentialColor( electricPotentialSensor.electricPotential, { transparency: 0.5 } );
    } );

    // Show// Hide this node
    // no need to unlink, stays for the lifetime of the simulation
    isElectricPotentialSensorVisibleProperty.linkAttribute( this, 'visible' );

    /**
     * Function that rounds a number and return it as a string
     * @param {number} number
     * @param {Object} [options]
     * @returns {string}
     */
    function roundNumber( number, options ) {
      options = _.extend( {
        maxSigFigs: 3
      }, options );

      var roundedNumber;
      if ( Math.abs( number ) < 1 ) {
        roundedNumber = Util.toFixed( number, options.maxSigFigs );
      }
      else if ( Math.abs( number ) < 10 ) {
        roundedNumber = Util.toFixed( number, options.maxSigFigs - 1 );
      }
      else if ( Math.abs( number ) < 100 ) {
        roundedNumber = Util.toFixed( number, options.maxSigFigs - 2 );
      }
      else {
        roundedNumber = Util.toFixed( number, options.maxSigFigs - 3 );
      }
      return roundedNumber;
    }

    var movableDragHandler = new MovableDragHandler( electricPotentialSensor.positionProperty, {
      dragBounds: availableModelBoundsProperty.value,
      modelViewTransform: modelViewTransform,
      startDrag: function( event ) {
        electricPotentialSensor.isUserControlled = true;
      },
      endDrag: function( event ) {
        electricPotentialSensor.isUserControlled = false;
      }
    } );

    // When dragging, move the electric potential sensor
    electricPotentialSensorNode.addInputListener( movableDragHandler );

    //no need to unlink, the sensor is present for the lifetime of the simulation.
    availableModelBoundsProperty.link( function( bounds ) {
      movableDragHandler.setDragBounds( bounds );
    } );

  }

  return inherit( Node, ElectricPotentialSensorNode );
} );
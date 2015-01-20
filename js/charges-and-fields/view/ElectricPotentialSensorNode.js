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

  //var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ElectricPotentialSensorPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorPanel' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  //constants
  var CIRCLE_RADIUS = 18; // radius of the circle around the crosshair

  //strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   *
   * @param {SensorElement} electricPotentialSensor - model of the electric potential sensor
   * @param {Function} getColorElectricPotential - A function that maps a value of the electric potential to a color
   * @param {Function} clearEquipotentialLines - A function for deleting all electric potential lines in the model
   * @param {Function} addElectricPotentialLine - A function for adding an electric potential line to the model
   * @param {ModelViewTransform2} modelViewTransform - the coordinate transform between model coordinates and view coordinates
   * @constructor
   */
  function ElectricPotentialSensorNode( electricPotentialSensor, getColorElectricPotential, clearEquipotentialLines, addElectricPotentialLine, modelViewTransform ) {

    var electricPotentialSensorNode = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the sensor
      cursor: 'pointer'
    } );

    // Create and add the centered circle around the crosshair. The origin of this node is the center of the circle
    var circle = new Circle( CIRCLE_RADIUS, { stroke: 'white', lineWidth: 3, centerX: 0, centerY: 0 } );
    this.addChild( circle );

    // Create and add the crosshair
    var crosshair = new Shape().moveTo( -CIRCLE_RADIUS, 0 )
      .lineTo( CIRCLE_RADIUS, 0 )
      .moveTo( 0, -CIRCLE_RADIUS )
      .lineTo( 0, CIRCLE_RADIUS );
    this.addChild( new Path( crosshair, { centerX: 0, centerY: 0, stroke: 'white' } ) );

    // Create and add the panel of the sensor with the readout and push buttons
    var electricPotentialSensorPanel = new ElectricPotentialSensorPanel( clearEquipotentialLines, addElectricPotentialLine );
    this.addChild( electricPotentialSensorPanel );
    electricPotentialSensorPanel.centerX = circle.centerX;
    electricPotentialSensorPanel.top = circle.bottom;

    // Register for synchronization with model.
    electricPotentialSensor.positionProperty.link( function( position ) {
      electricPotentialSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // Update the value of the electric potential on the panel and the fill color on the crosshair
    electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
      electricPotentialSensorPanel.voltageReading.text = StringUtils.format( pattern_0value_1units, roundNumber( electricPotential ), voltageUnitString );
      circle.fill = getColorElectricPotential( electricPotentialSensor.position, electricPotential ).withAlpha( 0.5 );
    } );

    /**
     * Function that rounds number according
     * @param {number} number
     * @param options
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

    // When dragging, move the electric potential sensor
    electricPotentialSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events
        translate: function( args ) {
          electricPotentialSensor.position = modelViewTransform.viewToModelPosition( args.position );
        }
      } ) );
  }

  return inherit( Node, ElectricPotentialSensorNode );
} );
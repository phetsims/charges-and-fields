// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node for the draggable electric field sensor node.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ElectricFieldSensorRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );


  /**
   * Constructor for the ElectricFieldSensorNode which renders the sensor as a scenery node.
   * @param {SensorElement} electricFieldSensor
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} valueIsVisibleProperty
   * @constructor
   */
  function ElectricFieldSensorNode( electricFieldSensor, modelViewTransform, valueIsVisibleProperty ) {

    ElectricFieldSensorRepresentation.call( this, electricFieldSensor, valueIsVisibleProperty );

    var electricFieldSensorNode = this;

    // Register for synchronization with model.
    electricFieldSensor.positionProperty.link( function( position ) {
      electricFieldSensorNode.moveToFront();
      electricFieldSensorNode.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // When dragging, move the electric Field Sensor
    electricFieldSensorNode.addInputListener( new SimpleDragHandler(
      {
        // When dragging across it in a mobile device, pick it up
        allowTouchSnag: true,

        // Translate on drag events and update electricField
        translate: function( args ) {
          electricFieldSensor.position = modelViewTransform.viewToModelPosition( args.position );
        }
      } ) );
  }

  return inherit( ElectricFieldSensorRepresentation, ElectricFieldSensorNode );
} );
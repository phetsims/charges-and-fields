// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create new electric field sensor in the model.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ElectricFieldSensorRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Function} addSensorElementToModel - A function for adding the created chargedParticle to the model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function ElectricFieldSensorCreatorNode( addSensorElementToModel, modelViewTransform, options ) {

    ElectricFieldSensorRepresentation.call( this, new SensorElement( new Vector2( 0, 0 ) ), new Property( true ) );

    var self = this;

    // Add the listener that will allow the user to click on this and create a new chargedParticle, then position it in the model.
    this.addInputListener( new SimpleDragHandler( {

      parentScreen: null, // needed for coordinate transforms
      electricFieldSensor: null,

      // Allow moving a finger (touch) across this node to interact with it
      allowTouchSnag: true,

      start: function( event, trail ) {
        // Find the parent screen by moving up the scene graph.
        var testNode = self;
        while ( testNode !== null ) {
          if ( testNode instanceof ScreenView ) {
            this.parentScreen = testNode;
            break;
          }
          testNode = testNode.parents[0]; // Move up the scene graph by one level
        }

        // Determine the initial position of the new element as a function of the event position and this node's bounds.
        var centerPositionGlobal = self.parentToGlobalPoint( self.center );
        var initialPositionOffset = centerPositionGlobal.minus( event.pointer.point );
        var initialPosition = this.parentScreen.globalToLocalPoint( event.pointer.point.plus( initialPositionOffset ) );

        // Create and add the new model element.
        var initialModelPosition = modelViewTransform.viewToModelPosition( initialPosition );
        this.electricFieldSensor = new SensorElement( initialModelPosition );
        this.electricFieldSensor.userControlled = true;
        addSensorElementToModel( this.electricFieldSensor );

      },

      translate: function( translationParams ) {
        this.electricFieldSensor.position = this.electricFieldSensor.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function( event, trail ) {
        this.electricFieldSensor.userControlled = false;
        this.electricFieldSensor = null;
      }
    } ) );

    // Pass options through to parent.
    this.mutate( options );
  }

  return inherit( ElectricFieldSensorRepresentation, ElectricFieldSensorCreatorNode );
} );
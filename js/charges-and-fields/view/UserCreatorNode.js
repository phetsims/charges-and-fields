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
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ChargedParticleRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentation' );
  var ElectricFieldSensorRepresentation = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @param {Function} addModelElementToObservableArray - A function that add a modelElement to an Observable Array in the model
   * @param {ObservableArray} observableArray
   * @param {Node} representation - the visual representation of the Model Element in the scene graph
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function UserCreatorNode( addModelElementToObservableArray, observableArray, representation, modelViewTransform, options ) {

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    options = _.extend( {
      element: 'electricFieldSensor' // other valid inputs are 'positive' and 'negative'
    }, options );


    var self = this;

    // let's make this node very easy to pick
    this.touchArea = this.localBounds.dilatedXY( 20, 20 );

    var movingObject = new Node();
    var staticObject = new Node();
    this.addChild( staticObject );
    this.addChild( movingObject );

    switch( options.element ) {
      case 'positive':
        staticObject.addChild( new ChargedParticleRepresentation( 1 ) );
        break;
      case 'negative':
        staticObject.addChild( new ChargedParticleRepresentation( -1 ) );
        break;
      case 'electricFieldSensor':
        staticObject.addChild( new ElectricFieldSensorRepresentation() );
        break;
    }

    // Add the listener that will allow the user to click on this and create a new chargedParticle, then position it in the model.
    this.addInputListener( new SimpleDragHandler( {

        parentScreen: null, // needed for coordinate transforms
        modelElement: null,

        // Allow moving a finger (touch) across this node to interact with it
        allowTouchSnag: true,

        start: function( event, trail ) {
          switch( options.element ) {
            case 'positive':
              movingObject.addChild( new ChargedParticleRepresentation( 1 ) );
              break;
            case 'negative':
              movingObject.addChild( new ChargedParticleRepresentation( -1 ) );
              break;
            case 'electricFieldSensor':
              movingObject.addChild( new ElectricFieldSensorRepresentation() );
              break;
          }

          var globalPoint = movingObject.globalToParentPoint( event.pointer.point );
          // move this node upward so that the cursor touches the bottom of the particle
          movingObject.translation = globalPoint.plusXY( 0, -20 );

        },

        drag: function( event, trail ) {
          movingObject.translation = self.globalToLocalPoint( event.pointer.point ).plusXY( 0, -20 );
        },

        end: function( event, trail ) {
          // Find the parent screen by moving up the scene graph.
          var testNode = self;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              this.parentScreen = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
          }

          // Determine the initial position of the new element as a function of the event position and this node's bounds.
          var centerPositionGlobal = movingObject.parentToGlobalPoint( movingObject.center );
          var initialPositionOffset = centerPositionGlobal.subtract( event.pointer.point );
          var initialPosition = this.parentScreen.globalToLocalPoint( initialPositionOffset.add( event.pointer.point ) );
          // Create and add the new model element.

          movingObject.removeAllChildren();

          var initialModelPosition = modelViewTransform.viewToModelPosition( initialPosition );

          switch( options.element ) {
            case 'positive':
              this.modelElement = new ChargedParticle( initialModelPosition, 1 );
              break;
            case 'negative':
              this.modelElement = new ChargedParticle( initialModelPosition, -1 );
              break;
            case 'electricFieldSensor':
              this.modelElement = new SensorElement( initialModelPosition );
              break;
            default:
              assert && assert( false, 'fail switch options' );
              break;
          }
          this.modelElement.userControlled = true;
          addModelElementToObservableArray( this.modelElement, observableArray );

          this.modelElement.userControlled = false;
          this.modelElement = null;
        }
      } )
    )
    ;

// Pass options through to parent.
    this.mutate( options );
  }

  return inherit( Node, UserCreatorNode );
} )
;
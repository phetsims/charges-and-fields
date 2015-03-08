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
  var MovableDragHandler = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Function} addModelElementToObservableArray - A function that add a modelElement to an Observable Array in the model
   * @param {ObservableArray} observableArray
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the moving view element
   * @param {Object} [options]
   * @constructor
   */
  function UserCreatorNode( addModelElementToObservableArray,
                            observableArray,
                            modelViewTransform,
                            availableModelBoundsProperty,
                            options ) {

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

    staticObject.addChild( representationCreatorNode() );

    var movingObjectPositionProperty = new Property(
      modelViewTransform.viewToModelPosition( staticObject.localToGlobalPoint( staticObject.translation ) ) );

    movingObjectPositionProperty.link( function( movingObjectPosition ) {
      movingObject.translation = staticObject.parentToLocalPoint( modelViewTransform.modelToViewPosition( movingObjectPosition ) );
    } );

    // Add the listener that will allow the user to click on this and create a new chargedParticle, then position it in the model.
    this.addInputListener( new MovableDragHandler( movingObjectPositionProperty,
        {
          modelViewTransform: modelViewTransform,
          dragBoundsProperty: availableModelBoundsProperty,
          startDrag: function( event ) {

            movingObject.addChild( representationCreatorNode() );

            movingObject.destinationPosition = modelViewTransform.viewToModelPosition( self.globalToParentPoint( event.pointer.point ) );

            var globalPoint = movingObject.globalToParentPoint( event.pointer.point );

            // move this node upward so that the cursor touches the bottom of the particle
            var position = {
              x: globalPoint.x,
              y: globalPoint.y
            };

            var animationTween = new TWEEN.Tween( position ).
              to( {
                x: globalPoint.plusXY( 0, -20 ).x,
                y: globalPoint.plusXY( 0, -20 ).y
              }, 100 ).
              easing( TWEEN.Easing.Cubic.InOut ).
              onUpdate( function() {
                movingObject.translation = { x: position.x, y: position.y };
              } );

            animationTween.start();
          },

          endDrag: function( event ) {
            // Find the parent screen by moving up the scene graph.
            var testNode = self;
            var parentScreen;
            while ( testNode !== null ) {
              if ( testNode instanceof ScreenView ) {
                parentScreen = testNode;
                break;
              }
              testNode = testNode.parents[ 0 ]; // Move up the scene graph by one level
            }

            // Determine the initial position of the new element as a function of the event position and this node's bounds.
            var centerPositionGlobal = movingObject.parentToGlobalPoint( movingObject.center );
            var initialPositionOffset = centerPositionGlobal.subtract( event.pointer.point );
            var initialPosition = parentScreen.globalToLocalPoint( initialPositionOffset.add( event.pointer.point ) );
            // Create and add the new model element.

            var initialModelPosition = modelViewTransform.viewToModelPosition( initialPosition );

            var modelElement = modelElementCreator( initialModelPosition );

            //       modelElement.destinationPosition = movingObject.destinationPosition;
            movingObject.removeAllChildren();
            addModelElementToObservableArray( modelElement, observableArray );

            // TODO: this is not very kosher
            movingObjectPositionProperty.set( modelViewTransform.viewToModelPosition( staticObject.parentToGlobalPoint( staticObject.translation ) ) );
          }
        } )
    );

    /**
     * Function that returns the view Node associated to options.element
     * @returns {Node}
     */
    function representationCreatorNode() {
      var representationNode;
      switch( options.element ) {
        case 'positive':
          representationNode = new ChargedParticleRepresentation( 1 );
          break;
        case 'negative':
          representationNode = new ChargedParticleRepresentation( -1 );
          break;
        case 'electricFieldSensor':
          representationNode = new ElectricFieldSensorRepresentation();
          break;
      }
      return representationNode;
    }

    /**
     * Function that returns the model element associated to options.element
     * @param {Vector2} initialModelPosition
     * @returns {ModelElement}
     */
    function modelElementCreator( initialModelPosition ) {
      var modelElement;

      switch( options.element ) {
        case 'positive':
          modelElement = new ChargedParticle( initialModelPosition, 1 );
          break;
        case 'negative':
          modelElement = new ChargedParticle( initialModelPosition, -1 );
          break;
        case 'electricFieldSensor':
          modelElement = new SensorElement( initialModelPosition );
          break;
      }
      return modelElement;
    }

// Pass options through to parent.
    this.mutate( options );
  }

  return inherit( Node, UserCreatorNode );
} )
;
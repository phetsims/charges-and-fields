// Copyright 2002-2015, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create a scenery node and a model element.
 *
 * The behavior that is sought after is
 * (1) when clicked upon, an additional scenery node (with no model element counterpart) is created and "jump".
 * (2) this additional node can be dragged onto the board but is subject to the some dragBounds
 * (3) when released the additional scenery node should 'disappeared' and be replaced by a model element (which itself is responsible for its view.
 * (4) the model element should be able to return to its 'destinationPosition', namely the position of the static scenery node
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
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
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

    var self = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over the charge
      cursor: 'pointer'
    } );

    options = _.extend( {
      element: 'electricFieldSensor' // other valid inputs are 'positive' and 'negative'
    }, options );


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

    // this is where the center of 'this' is in the ScreenView reference frame
    var viewPosition = new Vector2( options.centerX, options.centerY );

    // Create and add two nodes: the first one contains the static representation of the node
    // whereas the second is the dynamic representation of the node (but with no model counterpart)
    var movingObject = new Node();
    var staticObject = new Node();
    this.addChild( staticObject );
    this.addChild( movingObject );

    // offset between the  position of the static object and position of the movingObject after the tween animation
    // needed for the 'pop' effect
    var offset = new Vector2( 0, -20 ); // in view coordinate frame

    // Create and add a static view node
    staticObject.addChild( representationCreatorNode() );

    // let's make this node very easy to pick
    this.touchArea = staticObject.localBounds.dilated( 20 );

    // position for the moving object in model coordinate, note that the initial value will be reset right away by
    // the movableDragHandler

    var movingObjectPositionProperty = new Property(
      modelViewTransform.viewToModelPosition( viewPosition ) );

    movingObjectPositionProperty.link( function( movingObjectPosition ) {
      // a position of (0,0) for the movingObject corresponds to the position of the staticObject
      // since the modelToViewPosition is given in the ScreenView coordinate frame one need to subtract the viewPosition
      // i.e. the position of thisNode with respect to the ScreenView
      movingObject.translation = modelViewTransform.modelToViewPosition( movingObjectPosition ).minus( viewPosition );
    } );

    var movableDragHandler =
      new MovableDragHandler( movingObjectPositionProperty,
        {
          modelViewTransform: modelViewTransform,
          dragBounds: availableModelBoundsProperty.value,
          startDrag: function( event ) {

            // add the fake view element (no corresponding model element associated with this view)
            movingObject.addChild( representationCreatorNode() );

            // Use the center position of the static element underneath the moving object, i.e. the
            // center position of this (viewPosition)
            // and use it as the destination position for the return of the model element to the enclosure
            // destinationPosition is needed for the tween return animation
            movingObject.destinationPosition = modelViewTransform.viewToModelPosition( viewPosition );

            // determine the center of the view element we clicked on in the local view
            var position = {
              x: staticObject.center.x,
              y: staticObject.center.y
            };

            // move the movingObject upward (by offset) to get a pop like effect
            var animationTween = new TWEEN.Tween( position ).
              to( {
                x: staticObject.center.plus( offset ).x,
                y: staticObject.center.plus( offset ).y
              }, 100 ).
              easing( TWEEN.Easing.Cubic.InOut ).
              onUpdate( function() {
                movingObject.translation = { x: position.x, y: position.y };
              } );
            animationTween.start();

            // set the position of the fake view element in the model coordinate
            // note that the movingObjectPosition is subject to the dragBounds
            movingObjectPositionProperty.set( modelViewTransform.viewToModelPosition( viewPosition.plus( offset ) ) );
          },

          endDrag: function( event ) {

            // Create the new model element.
            var modelElement = modelElementCreator( movingObjectPositionProperty.value );

            // set the destination position of the model based on where it was picked up in the enclosure
            modelElement.destinationPosition = movingObject.destinationPosition;
            addModelElementToObservableArray( modelElement, observableArray );

            // remove the fake view element
            movingObject.removeAllChildren();
          }
        } );

    // Add the listener that will allow the user to click on this and create a model element, then position it in the model.
    this.addInputListener( movableDragHandler );

    // no need to dispose of this link since this is present for the lifetime of the sim
    availableModelBoundsProperty.link( function( bounds ) {
      movableDragHandler.setDragBounds( bounds );
    } );

// Pass options through to parent.
    this.mutate( options );
  }

  return inherit( Node, UserCreatorNode );
} );

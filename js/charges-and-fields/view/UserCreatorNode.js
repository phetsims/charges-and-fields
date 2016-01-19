// Copyright 2014-2015, University of Colorado Boulder

/**
 * A Scenery node that can be clicked upon to create a model element.
 *
 * The behavior that is sought after is
 * (1) when clicked upon, an inactive model element is created is created and "jump up".
 * (2) the model element can be dragged onto the board but is subject to the some dragBounds
 * (3) when released, the model element becomes active
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Function} addModelElementToObservableArray - A function that add a modelElement to an Observable Array in the model
   * @param {Function} hookDragHandler - function(modelElement,array) Called when the element is dropped into the play area, to add its normal listener.
   * @param {ObservableArray} observableArray
   * @param {Bounds2} enclosureBounds - bounds in the model coordinate frame of the charge and sensor enclosure
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds for the moving view element
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function UserCreatorNode( addModelElementToObservableArray,
                            hookDragHandler,
                            observableArray,
                            enclosureBounds,
                            modelViewTransform,
                            availableModelBoundsProperty,
                            tandem,
                            options ) {

    var self = this;

    // Call the super constructor
    Node.call( this, {
      // Show a cursor hand over this node
      cursor: 'pointer'
    } );

    options = _.extend( {
      element: 'electricFieldSensor', // other valid inputs are 'positive' and 'negative'
      observableArrayLengthLimit: Number.POSITIVE_INFINITY // Max number of model Elements that can be put in the observable array.
    }, options );

    /**
     * Function that returns the view Node associated to options.element
     * @returns {Node}
     */
    function representationCreatorNode() {
      var representationNode;
      switch( options.element ) {
        case 'positive':
          representationNode = new ChargedParticleRepresentationNode( 1 );
          break;
        case 'negative':
          representationNode = new ChargedParticleRepresentationNode( -1 );
          break;
        case 'electricFieldSensor':
          representationNode = new ElectricFieldSensorRepresentationNode();
          break;
      }
      return representationNode;
    }

    /**
     * Function that returns the model element associated to options.element
     * @param {Vector2} initialModelPosition
     * @returns {ModelElement}
     */
    function modelElementCreator() {
      var modelElement;
      var initialPosition = new Vector2(); // overwritten by drag handler

      switch( options.element ) {
        case 'positive':
          modelElement = new ChargedParticle( initialPosition, 1 );
          break;
        case 'negative':
          modelElement = new ChargedParticle( initialPosition, -1 );
          break;
        case 'electricFieldSensor':
          modelElement = new SensorElement( initialPosition );
          break;
      }
      return modelElement;
    }

    // Create and add a static view node
    this.representationNode = representationCreatorNode();
    this.addChild( this.representationNode );

    // let's make this node very easy to pick
    this.touchArea = this.localBounds.dilated( 10 ); // large enough to be easy to pick but small enough that the touch area doesn't spill out of the enclosure

    // If the observableArray count exceeds the max, make this node invisible (which also makes it unusable).
    observableArray.lengthProperty.link( function( number ) {
      self.visible = (number < options.observableArrayLengthLimit);
    } );

    // When pressed, creates a model element and triggers startDrag() on the corresponding view
    this.addInputListener( {
      down: function( event ) {
        // Ignore non-left-mouse-button
        if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
          return;
        }

        // Representation node location, so that when being "disposed" it will animate back towards the the right place.
        var initialViewPosition = event.currentTarget.globalToParentPoint( self.representationNode.localToGlobalPoint( Vector2.ZERO ) );

        // Create the new model element.
        var modelElement = modelElementCreator();
        modelElement.initialPosition = modelViewTransform.viewToModelPosition( initialViewPosition );
        modelElement.isActive = false;

        // Add it to the model
        addModelElementToObservableArray( modelElement, observableArray );

        // Hook up the initial drag to the corresponding view element
        hookDragHandler( modelElement, event );
      }
    } );

    // Pass options through to parent.
    this.mutate( options );

    tandem.addInstance( this );
  }

  return inherit( Node, UserCreatorNode );
} );

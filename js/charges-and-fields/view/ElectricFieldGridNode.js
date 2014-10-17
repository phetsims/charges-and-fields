// Copyright 2002-2013, University of Colorado Boulder

/**
 * View for the equipotential Lines
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var MutableArrowNode = require( 'SCENERY_PHET/MutableArrowNode' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );


  // var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  //constants
  var CIRCLE_COLOR = 'white';
  var CIRCLE_RADIUS = 2; //in pixels
  var ARROW_COLOR = 'red';
  var ARROW_LENGTH = 20; //in pixels

  /**
   *
   * @param model
   * @param modelViewTransform
   * @param bounds
   * @param showResolutionProperty
   * @constructor
   */
  function ElectricFieldGridNode( model, modelViewTransform, bounds, eFieldIsVisibleProperty ) {

    var electricFieldGridNode = this;

    Node.call( this );

    model.electricFieldSensorGrid.forEach( function( electricFieldSensor ) {
      var positionInModel = electricFieldSensor.location;
      var electricField = electricFieldSensor.electricField;
      //  var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
      var locationInView = modelViewTransform.modelToViewPosition( positionInModel );
      // var magnitude = electricField.magnitude();
      // var angle = electricFieldInView.angle();

      // Add arrow
      //     var color = model.getColorElectricFieldMagnitude( positionInModel, magnitude );
      var arrowNode = new MutableArrowNode( -ARROW_LENGTH / 2, 0, ARROW_LENGTH, 0, {fill: ARROW_COLOR, stroke: ARROW_COLOR, pickable: false, tailWidth: 8, lineWidth: 0, headWidth: 16, headHeight: 10} );

      arrowNode.center = locationInView.plus( new Vector2( ARROW_LENGTH / 4, 0 ) );

      // Add the centered circle
      var circle = new Circle( CIRCLE_RADIUS, { fill: CIRCLE_COLOR, stroke: CIRCLE_COLOR} );
      circle.center = locationInView;

      electricFieldSensor.electricFieldProperty.link( function( electricField ) {
        var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
//        var magnitude = electricField.magnitude();
        var angle = electricFieldInView.angle();
        arrowNode.setRotation( angle );
        arrowNode.stroke = 'blue';
      } );
      electricFieldGridNode.addChild( arrowNode );
      electricFieldGridNode.addChild( circle );
    } );

    eFieldIsVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
      // for performance reason, the electric potential is calculated and updated only if the check is set to visible
      if ( isVisible === true ) {
        model.electricFieldSensorGrid.forEach( function( sensorElement ) {
          sensorElement.electricField = model.getElectricField( sensorElement.location );
        } );
      }
    } );

  }

  return inherit( Node, ElectricFieldGridNode );
} );
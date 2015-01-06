// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the equipotential Lines
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
//  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );


  // var ChargesAndFieldsScreenView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsScreenView' );
  // var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  //constants
  var CIRCLE_COLOR = 'black';
  var CIRCLE_RADIUS = 2; //in pixels
  var ARROW_COLOR = 'pink';
  var ARROW_LENGTH = 20; //in pixels

  /**
   *
   * @param model
   * @param modelViewTransform
   * @param eFieldIsVisibleProperty
   * @constructor
   */
  function ElectricFieldGridNode( model, modelViewTransform, eFieldIsVisibleProperty ) {

    var electricFieldGridNode = this;

    Node.call( this );

    model.electricFieldSensorGrid.forEach( function( electricFieldSensor ) {
      var positionInModel = electricFieldSensor.position;
      var positionInView = modelViewTransform.modelToViewPosition( positionInModel );

      // Add arrow
      //     var color = model.getColorElectricFieldMagnitude( positionInModel, magnitude );
      var arrowNode = new ArrowNode( -ARROW_LENGTH / 2, 0, ARROW_LENGTH, 0, {
        fill: ARROW_COLOR,
        stroke: ARROW_COLOR,
        pickable: false,
        tailWidth: 8,
        lineWidth: 0,
        headWidth: 16,
        headHeight: 10
      } );
      arrowNode.center = positionInView.plus( new Vector2( ARROW_LENGTH / 4, 0 ) );

      // Add the centered circle
      var circle = new Circle( CIRCLE_RADIUS, {fill: CIRCLE_COLOR, stroke: CIRCLE_COLOR} );
      circle.center = positionInView;

      electricFieldSensor.electricFieldProperty.link( function( electricField ) {
        var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
        arrowNode.setRotation( electricFieldInView.angle() );
        arrowNode.fill = model.getColorElectricFieldMagnitude( positionInModel, electricField.magnitude() );
        //arrowNode.stroke = model.getColorElectricFieldMagnitude( positionInView );
      } );
      electricFieldGridNode.addChild( arrowNode );
      electricFieldGridNode.addChild( circle );
    } );

    eFieldIsVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
      // for performance reason, the electric potential is calculated and updated only if the check is set to visible
      if ( isVisible === true ) {
        model.electricFieldSensorGrid.forEach( function( sensorElement ) {
          sensorElement.electricField = model.getElectricField( sensorElement.position );
        } );
      }
    } );
  }

  return inherit( Node, ElectricFieldGridNode );
} );
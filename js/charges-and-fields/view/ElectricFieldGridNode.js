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
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  //constants
  var CIRCLE_RADIUS = 2; //in scenery coordinates
  var ARROW_LENGTH = 20; //in scenery coordinates

  /**
   *
   * @param {Array.<StaticSensorElement>} electricFieldSensorGrid
   * @param {Function} getColorElectricFieldMagnitude - A function that maps a color to an Electric Field Magnitude
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} eFieldIsVisibleProperty
   * @constructor
   */
  function ElectricFieldGridNode( electricFieldSensorGrid, getColorElectricFieldMagnitude, modelViewTransform, eFieldIsVisibleProperty ) {

    var electricFieldGridNode = this;

    Node.call( this );

    electricFieldSensorGrid.forEach( function( electricFieldSensor ) {
      var positionInModel = electricFieldSensor.position;
      var positionInView = modelViewTransform.modelToViewPosition( positionInModel );

      //TODO: There are too many magic numbers. Find a robust way to get the arrow to rotate around its axis in a predictable way
      // Add arrow
      var arrowNode = new ArrowNode( -ARROW_LENGTH / 2, 0, ARROW_LENGTH, 0, {
        tailWidth: 8,
        lineWidth: 0, // If the lineWidth is equal to zero, we dont have to worry about the color of the stroke
        headWidth: 16,
        headHeight: 10
      } );
      arrowNode.center = positionInView.plus( new Vector2( ARROW_LENGTH / 4, 0 ) );

      // Add the centered circle
      var circle = new Circle( CIRCLE_RADIUS, {lineWidth: 0} );
      circle.center = positionInView;

      var circleFillColorFunction = function( color ) {
        circle.fill = color;
      };
      ChargesAndFieldsColors.link( 'background', circleFillColorFunction );

      //TODO this approach is not going to work for the arrow fill..
      // get a color scheme that is dependent on the background color
      var arrowNodeFillColorFunction = function( color ) {
        arrowNode.fill = color;
      };
      ChargesAndFieldsColors.link( 'background', arrowNodeFillColorFunction );

      electricFieldSensor.electricFieldProperty.link( function( electricField ) {
        var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
        arrowNode.setRotation( electricFieldInView.angle() );
        arrowNode.fill = getColorElectricFieldMagnitude( positionInModel, electricField.magnitude() );
      } );
      electricFieldGridNode.addChild( arrowNode );
      electricFieldGridNode.addChild( circle );
    } );

    eFieldIsVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
    } );
  }

  return inherit( Node, ElectricFieldGridNode );
} );
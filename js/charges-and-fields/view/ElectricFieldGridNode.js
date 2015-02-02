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
  var ARROW_LENGTH = 40; //in scenery coordinates

  /**
   *
   * @param {Array.<StaticSensorElement>} electricFieldSensorGrid
   * @param {Function} update -       model.on.bind(model),
   * @param {Function} getColorElectricFieldMagnitude - A function that maps a color to an Electric Field Magnitude
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isDirectionOnlyElectricFieldGridVisibleProperty - Controls the arrows Fill - from uniform (true) to variable colors (false)
   * @param {Property.<boolean>} isElectricFieldGridVisibleProperty
   * @constructor
   */
  function ElectricFieldGridNode( electricFieldSensorGrid,
                                  update,
                                  getColorElectricFieldMagnitude,
                                  modelViewTransform,
                                  isDirectionOnlyElectricFieldGridVisibleProperty,
                                  isElectricFieldGridVisibleProperty ) {

    var electricFieldGridNode = this;

    Node.call( this );


    var arrowArray = [];

    electricFieldSensorGrid.forEach( function( electricFieldSensor ) {

      var positionInModel = electricFieldSensor.position; // position of the sensor in model

      var positionInView = modelViewTransform.modelToViewPosition( positionInModel ); // position of the sensor in the view

      // Create the centered circle.
      var circle = new Circle( CIRCLE_RADIUS, { lineWidth: 0 } );
      circle.center = positionInView; // center the circle at the sensor position

      // attached a listener to the projector/default mode for setting the fill color
      var circleFillColorFunction = function( color ) {
        circle.fill = color;
      };
      ChargesAndFieldsColors.link( 'background', circleFillColorFunction );

      // Create the arrow

      // First we set the arrow horizontally to point along the positive x direction. its orientation will be updated later
      // The arrow will rotate around a point that is not necessarily its center.
      // The point of rotation is measured from the tail and is given by fraction*ARROW_LENGTH;
      // fraction=1/2 => rotate around the center,
      // fraction=0 => rotate around the tail,
      // fraction=1 => rotate around the tip,

      var fraction = 2 / 5;

      var tailX = -ARROW_LENGTH * (fraction);
      var tipX = ARROW_LENGTH * (1 - fraction);
      var offsetCenterX = (tailX + tipX) / 2;
      var offsetVector = new Vector2( offsetCenterX, 0 );
      var arrowNode = new ArrowNode( tailX, 0, tipX, 0, {
        tailWidth: 8,
        lineWidth: 0, // If the lineWidth is equal to zero, we don't have to worry about the color of the stroke
        headWidth: 16,
        headHeight: 10
      } );
      arrowNode.center = offsetVector.add( positionInView );

      arrowNode.electricFieldSensor = electricFieldSensor;
      arrowArray.push( arrowNode );

      electricFieldGridNode.addChild( arrowNode );
      electricFieldGridNode.addChild( circle ); //circle should come after arrowNode

      // Update the orientation of the arrow (and possibly its fill) according to the value of the electric field
      // at the position in the model
      electricFieldSensor.electricFieldProperty.link( function( electricField ) {

        // Rotate the arrow according to the direction of the electric field
        // Let's not make any assumption about inverted/notInverted Y
        // Just use the electricField in the view
        var electricFieldInView = modelViewTransform.modelToViewDelta( electricField );
        arrowNode.setRotation( electricFieldInView.angle() );

        // Controls the arrows fill - from uniform, i.e. single color (true) to variable color (false)
        isDirectionOnlyElectricFieldGridVisibleProperty.link( function( isVisible ) {
          if ( isVisible ) {
            arrowNode.fill = ChargesAndFieldsColors.electricFieldGridSaturation;
          }
          else {
            arrowNode.fill = getColorElectricFieldMagnitude( positionInModel, electricField.magnitude() );
          }
        } );
      } );
    } );

    update( 'updateElectricFieldGrid', updateElectricFieldGridColors );
    ChargesAndFieldsColors.on( 'profileChanged', updateElectricFieldGridColors );


    function updateElectricFieldGridColors() {
      arrowArray.forEach( function( arrowNode ) {
        if ( isDirectionOnlyElectricFieldGridVisibleProperty.value ) {
          arrowNode.fill = ChargesAndFieldsColors.electricFieldGridSaturation;
        }
        else {
          var specialColor = getColorElectricFieldMagnitude( arrowNode.electricFieldSensor.position, arrowNode.electricFieldSensor.electricField.magnitude() );
          arrowNode.fill = specialColor;
        }
      } );
    }





    // Show or Hide this node
    isElectricFieldGridVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
    } );
  }

  return inherit( Node, ElectricFieldGridNode );
} );
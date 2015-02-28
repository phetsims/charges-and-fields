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
  //var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CIRCLE_RADIUS = 2; // in scenery coordinates
  var ARROW_LENGTH = 40; // in scenery coordinates

  /**
   *
   * @param {Array.<StaticSensorElement>} electricFieldSensorGrid
   * @param {Function} update -       model.on.bind(model),
   * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given the magnitude of the electric field
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isDirectionOnlyElectricFieldGridVisibleProperty - Controls the arrows Fill - from uniform (true) to variable colors (false)
   * @param {Property.<boolean>} isElectricFieldGridVisibleProperty
   * @constructor
   */
  function ElectricFieldGridNode( electricFieldSensorGrid,
                                  update,
                                  colorInterpolationFunction,
                                  modelViewTransform,
                                  isDirectionOnlyElectricFieldGridVisibleProperty,
                                  isElectricFieldGridVisibleProperty ) {

    var electricFieldGridNode = this;

    Node.call( this );

    var arrowArray = []; // arrays of the arrows
    var circleArray = []; // array of the 'transparent' circles on the arrows.

    // First we set the arrow horizontally to point along the positive x direction. its orientation will be updated later
    // The arrow will rotate around a point (a circle in the view) that is not necessarily its center.
    // The point of rotation is measured from the tail and is given by fraction*ARROW_LENGTH;
    // fraction=1/2 => rotate around the center,
    // fraction=0 => rotate around the tail,
    // fraction=1 => rotate around the tip,

    var fraction = 2 / 5;
    var tailX = -ARROW_LENGTH * (fraction);
    var tipX = ARROW_LENGTH * (1 - fraction);
    var offsetCenterX = (tailX + tipX) / 2;
    var arrowOptions = {
      tailWidth: 8,
      lineWidth: 0, // If the lineWidth is equal to zero, we don't have to worry about the color of the stroke
      headWidth: 16,
      headHeight: 10
    };

    electricFieldSensorGrid.forEach( function( electricFieldSensor ) {

      var positionInModel = electricFieldSensor.position; // position of the sensor in model
      var positionInView = modelViewTransform.modelToViewPosition( positionInModel ); // position of the sensor in the view

      // Create the centered circle. The arrow will rotate around this center
      var circle = new Circle( CIRCLE_RADIUS, { lineWidth: 0 } );
      circle.center = positionInView; // center the circle at the sensor position
      circleArray.push( circle );

      // Create the arrow
      var arrowNode = new ArrowNode( tailX, 0, tipX, 0, arrowOptions );
      arrowNode.center = positionInView.addXY( offsetCenterX, 0 );
      arrowNode.electricFieldSensor = electricFieldSensor;
      arrowArray.push( arrowNode );

      electricFieldGridNode.addChild( arrowNode );
      electricFieldGridNode.addChild( circle ); // circle should come after arrowNode

    } ); // end of forEach loop

    /**
     *  Update the orientation of the arrows (and possibly their fill) according to the value of the electric field
     *  at the position in the model
     */
    function updateElectricFieldGrid() {
      arrowArray.forEach( function( arrowNode ) {
        // Rotate the arrow according to the direction of the electric field
        // Since the model View Transform is  Y inverted, the angle in the view and in the model
        // differ by a minus sign
        arrowNode.setRotation( -1 * arrowNode.electricFieldSensor.electricField.angle() );
        // Controls the arrows fill - from uniform, i.e. single color (true) to variable color (false)
        if ( isDirectionOnlyElectricFieldGridVisibleProperty.value ) {
          arrowNode.fill = ChargesAndFieldsColors.electricFieldGridSaturation;
        }
        else {
          arrowNode.fill = colorInterpolationFunction( arrowNode.electricFieldSensor.electricField.magnitude() );
        }
      } );
    }

    /**
     * Update the colors of the electric Field grid arrows
     */
    function updateElectricFieldGridColors() {

      // update the color of the button circles
      circleArray.forEach( function( circle ) {
        circle.fill = ChargesAndFieldsColors.background;
      } );

      // update the color of the arrows
      if ( isDirectionOnlyElectricFieldGridVisibleProperty.value ) {
        arrowArray.forEach( function( arrowNode ) {
          arrowNode.fill = ChargesAndFieldsColors.electricFieldGridSaturation;
        } );
      }
      else {
        arrowArray.forEach( function( arrowNode ) {
          arrowNode.fill = colorInterpolationFunction( arrowNode.electricFieldSensor.electricField.magnitude() );
        } );
      }
    }

    // update the orientation and colors of the electric field arrows upon an update of the electric field grid
    update( 'electricFieldGridUpdated', updateElectricFieldGrid );

    // update the colors of the electric field arrows upon an change of profile mode i.e. default/projector
    ChargesAndFieldsColors.on( 'profileChanged', updateElectricFieldGridColors );

    // update the colors of the electric field arrows if the checkbox 'Direction Only' is checked/unchecked
    // no need to unlink, present for the lifetime of the simulation
    isDirectionOnlyElectricFieldGridVisibleProperty.link( updateElectricFieldGridColors );

    // Show or Hide this node
    // no need to unlink, present for the lifetime of the simulation
    isElectricFieldGridVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
    } );
  }

  return inherit( Node, ElectricFieldGridNode );
} );
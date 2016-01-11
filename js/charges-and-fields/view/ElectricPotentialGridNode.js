// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the electric potential field
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

  /**
   *
   * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
   * @param {Function} update -  model.on.bind(model)
   * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given an electric potential
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - bounds of the canvas in model units
   * @param {Property.<boolean>} isVisibleProperty
   * @constructor
   */
  function ElectricPotentialGridNode( electricPotentialSensorGrid,
                                      update,
                                      colorInterpolationFunction,
                                      modelViewTransform,
                                      availableModelBoundsProperty,
                                      isVisibleProperty ) {

    // Call the super constructor
    CanvasNode.call( this, { canvasBounds: modelViewTransform.modelToViewBounds( availableModelBoundsProperty.get() ) } );

    var electricPotentialGridNode = this;

    this.availableModelBoundsProperty = availableModelBoundsProperty;
    this.modelViewTransform = modelViewTransform;
    this.colorInterpolationFunction = colorInterpolationFunction;

    // find the distance between two adjacent sensors in view coordinates.
    var unitDistance = modelViewTransform.modelToViewDeltaX( ELECTRIC_POTENTIAL_SENSOR_SPACING );

    // sets the positions of all the rectangles that forms our array
    this.rectangleArray = [];
    electricPotentialSensorGrid.forEach( function( electricPotentialSensor ) {
      var modelPosition = electricPotentialSensor.position;
      var viewPosition = modelViewTransform.modelToViewPosition( modelPosition );
      var rectangle = new Bounds2(
        viewPosition.x - unitDistance / 2,
        viewPosition.y - unitDistance / 2,
        viewPosition.x + unitDistance / 2,
        viewPosition.y + unitDistance / 2 );
      rectangle.electricPotentialSensor = electricPotentialSensor;
      electricPotentialGridNode.rectangleArray.push( rectangle );
    } );

    ChargesAndFieldsColors.on( 'profileChanged', function() {
      // redraw the canvas
      electricPotentialGridNode.invalidatePaint();
    } );

    update( 'electricPotentialGridUpdated', function() {
      // redraw the canvas
      electricPotentialGridNode.invalidatePaint();
    } );

    // in the model, the electric potential grid is not being updated if isVisible is false
    // hence there is no further performance optimization (or logic ) to be put in the view.
    isVisibleProperty.link( function( isVisible ) {
      electricPotentialGridNode.visible = isVisible;
    } );

    availableModelBoundsProperty.link( function( bounds ) {
      electricPotentialGridNode.setCanvasBounds( modelViewTransform.modelToViewBounds( bounds ) );
      electricPotentialGridNode.invalidatePaint(); // redraw the canvas
    } );

    this.invalidatePaint();

  }

  return inherit( CanvasNode, ElectricPotentialGridNode, {

    /**
     * Function responsible for painting the canvas Node as a grid array of squares
     * @override
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      var self = this;

      /**
       * Function that updates the fill of a square with a color that corresponds to the electricPotential value at the center
       * of the square
       * @param {Bounds2} rectangle
       */
      var updateRectangle = function( rectangle ) {
        // bounds that are slightly larger than the viewport to encompass rectangles that are within one row
        // or one column of the border
        var bounds = self.modelViewTransform.modelToViewBounds( self.availableModelBoundsProperty.get().dilated( ELECTRIC_POTENTIAL_SENSOR_SPACING / 2 ) );

        // update only the rectangles that are within the visible bounds
        if ( bounds.containsBounds( rectangle ) ) {
          // set the color of the rectangle
          context.fillStyle = self.colorInterpolationFunction( rectangle.electricPotentialSensor.electricPotential );
          // It is expensive to set the fill and the stroke of the rectangle. Instead of setting the stroke
          // with the same color as the fill, we set the fill on a rectangle that is slightly larger (hence the +1) than its nominal value
          // In this way we indirectly set the stroke. This simple optimization nearly doubled the number of fps.
          context.fillRect( rectangle.minX, rectangle.minY, rectangle.width + 1, rectangle.height + 1 );
        }
      };

      this.rectangleArray.forEach( updateRectangle );
    }
  } );
} );
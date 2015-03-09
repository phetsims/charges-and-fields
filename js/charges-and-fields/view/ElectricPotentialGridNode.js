// Copyright 2002-2015, University of Colorado Boulder

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
    //var DerivedProperty = require('AXON/DerivedProperty');
    var inherit = require( 'PHET_CORE/inherit' );
    //var Vector2 = require( 'DOT/Vector2' );

    // constants
    var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

    /**
     *
     * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
     * @param {Function} update -  model.on.bind(model)
     * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given an electric potential
     * @param {Property.<Bounds2>} boundsProperty - bounds of the canvas in model units
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isChargedParticlePresentProperty - is there at least one charged particle on the board
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridNode( electricPotentialSensorGrid,
                                        update,
                                        colorInterpolationFunction,
                                        boundsProperty,
                                        modelViewTransform,
                                        isChargedParticlePresentProperty,
                                        isVisibleProperty ) {

      // Call the super constructor
      CanvasNode.call( this, { canvasBounds: modelViewTransform.modelToViewBounds( boundsProperty.get() ) } );

      var electricPotentialGridNode = this;

      boundsProperty.link( function( bounds ) {
        electricPotentialGridNode.setCanvasBounds( modelViewTransform.modelToViewBounds( bounds ) );
      } );

      this.colorInterpolationFunction = colorInterpolationFunction;

      // find the distance between two adjacent sensors in view coordinates.
      var unitDistance = modelViewTransform.modelToViewDeltaX( ELECTRIC_POTENTIAL_SENSOR_SPACING );
      this.rectArray = [];
      electricPotentialSensorGrid.forEach( function( electricPotentialSensor ) {
        var positionInModel = electricPotentialSensor.position;
        var positionInView = modelViewTransform.modelToViewPosition( positionInModel );
        var rect = new Bounds2(
          positionInView.x - unitDistance / 2,
          positionInView.y - unitDistance / 2,
          positionInView.x + unitDistance / 2,
          positionInView.y + unitDistance / 2 );
        rect.electricPotentialSensor = electricPotentialSensor;
        electricPotentialGridNode.rectArray.push( rect );
      } );

      ChargesAndFieldsColors.on( 'profileChanged', function() {
        electricPotentialGridNode.invalidatePaint();
      } );

      update( 'electricPotentialGridUpdated', function() {
        electricPotentialGridNode.invalidatePaint();
      } );

      isVisibleProperty.link( function( isVisible ) {
        electricPotentialGridNode.visible = isVisible;
      } );

      this.invalidatePaint();

    }

    return inherit( CanvasNode, ElectricPotentialGridNode, {

        /*
         * Function responsible for painting the canvas Node as a grid array of squares
         * @override
         * @param {CanvasContextWrapper} wrapper
         */
        paintCanvas: function( wrapper ) {
          var self = this;
          var context = wrapper.context;
          this.rectArray.forEach( function( rect ) {
            context.fillStyle = self.colorInterpolationFunction( rect.electricPotentialSensor.electricPotential );
            // It is expensive to set the fill and the stroke of the rectangle. Instead of setting the stroke
            // we set the fill on a rectangle that is slightly larger (hence the +1) than its nominal value
            // In this way we indirectly set the stroke. This simple optimization nearly doubled the number of fps.
            context.fillRect( rect.minX, rect.minY, rect.width + 1, rect.height + 1 );
          } );
        }
      }
    );
  }
)
;
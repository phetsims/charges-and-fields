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
    var inherit = require( 'PHET_CORE/inherit' );
    //var Node = require( 'SCENERY/nodes/Node' );
    //var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    //var Vector2 = require( 'DOT/Vector2' );

    // constants
    var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

    /**
     *
     * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
     * @param {Function} update -       model.on.bind(model),
     * @param {Function} getColorElectricPotential - A function that maps a color to a value of the electric potential
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridNode( electricPotentialSensorGrid, update, getColorElectricPotential, modelViewTransform, isVisibleProperty ) {

      // Call the super constructor
      CanvasNode.call( this, { canvasBounds: new Bounds2( 0, 0, 1024, 618 ) } );

      var electricPotentialGridNode = this;

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

      update( 'updateElectricPotentialGrid', function() {
        electricPotentialGridNode.invalidatePaint();
      } );

      this.getColorElectricPotential = getColorElectricPotential;

      isVisibleProperty.link( function( isVisible ) {
        electricPotentialGridNode.visible = isVisible;
      } );

      this.invalidatePaint();
    }

    return inherit( CanvasNode, ElectricPotentialGridNode, {

        /*
         * @override
         * @param {CanvasContextWrapper} wrapper
         */
        paintCanvas: function( wrapper ) {
          var electricPotentialGridNode = this;
          var context = wrapper.context;

          this.rectArray.forEach( function( rect ) {
            context.fillStyle = electricPotentialGridNode.getColorElectricPotential( rect.electricPotentialSensor.position, rect.electricPotentialSensor.electricPotential );
            context.fillRect( rect.minX, rect.minY, rect.width, rect.height );
          } );
        }
      }
    );
  }
)
;
// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the electric potential field
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
    'use strict';

    // modules
    //var Bounds2 = require( 'DOT/Bounds2' );
    //var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );

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

      var electricPotentialGridNode = this;
      // Call the super constructor

      Node.call( this );
      //TODO ask JO how to use canvas node
      //CanvasNode.call( this, { canvasBounds: new Bounds2( 0, 0, 1024, 618 )  } );

      // find the distance between two adjacent sensors in view coordinates.
      var unitDistance = modelViewTransform.modelToViewDeltaX( ELECTRIC_POTENTIAL_SENSOR_SPACING );
      var rectArray = [];
      electricPotentialSensorGrid.forEach( function( electricPotentialSensor ) {
        var positionInModel = electricPotentialSensor.position;
        var positionInView = modelViewTransform.modelToViewPosition( positionInModel );
        var rect = new Rectangle( 0, 0, unitDistance, unitDistance, { center: positionInView } );
        rect.electricPotentialSensor = electricPotentialSensor;

        rectArray.push( rect );
        electricPotentialGridNode.addChild( rect );
      } );

      /**
       * Update the electric Potential Grid Colors
       */
      function updateElectricPotentialGridColors() {
        rectArray.forEach( function( rect ) {
          var specialColor = getColorElectricPotential( rect.electricPotentialSensor.position, rect.electricPotentialSensor.electricPotential );
          rect.fill = specialColor;
          rect.stroke = specialColor;
        } );
      }
      update( 'updateElectricPotentialGrid', updateElectricPotentialGridColors );
      ChargesAndFieldsColors.on( 'profileChanged', updateElectricPotentialGridColors );


      isVisibleProperty.link( function( isVisible ) {
        electricPotentialGridNode.visible = isVisible;
      } );

    }

    return inherit( Node, ElectricPotentialGridNode
    );
  }
)
;
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
    var DOM = require( 'SCENERY/nodes/DOM' );
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
    var inherit = require( 'PHET_CORE/inherit' );
    //var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
    var Util = require( 'SCENERY/util/Util' );

    // constants
    var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

    /**
     *
     * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
     * @param {Function} update -       model.on.bind(model),
     * @param {Bounds2} bounds
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridWebGLNode( electricPotentialSensorGrid, update, bounds, modelViewTransform, isVisibleProperty ) {

      // prepare the canvas
      this.canvas = document.createElement( 'canvas' );
      this.gl = this.canvas.getContext( 'webgl' ) || this.canvas.getContext( 'experimental-webgl' );
      this.gl.getExtension( 'OES_texture_float' );
      this.backingScale = Util.backingScale( this.gl );
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = '0';
      this.canvas.style.top = '0';

      // construct ourself with the canvas (now properly initially sized)
      DOM.call( this, this.canvas, {
        preventTransform: true
      } );
      // TODO: work in progress
      var electricPotentialGridWebGLNode = this;


      //var ShaderProgram = new ShaderProgram( this.gl, vertexSource, fragmentSource, attributeNames, uniformNames );


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
        electricPotentialGridWebGLNode.rectArray.push( rect );
      } );

      ChargesAndFieldsColors.on( 'profileChanged', function() {
        electricPotentialGridWebGLNode.invalidatePaint();
      } );


      update( 'electricPotentialGridUpdated', function() {
        electricPotentialGridWebGLNode.invalidatePaint();
      } );

      isVisibleProperty.link( function( isVisible ) {
        electricPotentialGridWebGLNode.visible = isVisible;
      } );

      this.invalidatePaint();
    }

    return inherit( DOM, ElectricPotentialGridWebGLNode, {

        /*
         * @override
         * @param {CanvasContextWrapper} wrapper
         */
        paintCanvas: function( wrapper ) {
          var context = wrapper.context;
          this.rectArray.forEach( function( rect ) {
            context.fillStyle = rect.electricPotentialSensor.electricPotentialColor;
            context.fillRect( rect.minX, rect.minY, rect.width + 1, rect.height + 1 );
          } );
        }
      }
    );
  }
)
;
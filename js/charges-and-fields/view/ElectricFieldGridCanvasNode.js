// Copyright 2015, University of Colorado Boulder

/**
 * Canvas Node for the electric field grid
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ElectricFieldArrowCanvas = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldArrowCanvas' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // constants
  var ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;

  /**
   *
   * @param {Array.<StaticSensorElement>} electricFieldSensorGrid
   * @param {Function} update - function that registers a listener when the specified eventName is triggered. (model.on.bind(model)),
   * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given the magnitude of the electric field
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - bounds of the canvas in model units
   * @param {Property.<boolean>} isPlayAreaChargedProperty - is there at least one charged particle on the board
   * @param {Property.<boolean>} isElectricFieldDirectionOnlyProperty - Controls the arrows Fill - from uniform (true) to variable colors (false)
   * @param {Property.<boolean>} isElectricFieldVisibleProperty
   * @constructor
   */
  function ElectricFieldGridCanvasNode( electricFieldSensorGrid,
                                        update,
                                        colorInterpolationFunction,
                                        modelViewTransform,
                                        availableModelBoundsProperty,
                                        isPlayAreaChargedProperty,
                                        isElectricFieldDirectionOnlyProperty,
                                        isElectricFieldVisibleProperty ) {

    var electricFieldGridNode = this;

    // Call the super constructor
    CanvasNode.call( this, { canvasBounds: modelViewTransform.modelToViewBounds( availableModelBoundsProperty.get() ) } );

    this.modelViewTransform = modelViewTransform;
    this.colorInterpolationFunction = colorInterpolationFunction;
    this.electricFieldSensorGrid = electricFieldSensorGrid;
    this.isElectricFieldDirectionOnlyProperty = isElectricFieldDirectionOnlyProperty;
    this.localBounds = modelViewTransform.modelToViewBounds( availableModelBoundsProperty.get().dilated( ELECTRIC_FIELD_SENSOR_SPACING / 2 ) );

    availableModelBoundsProperty.link( function( bounds ) {
      electricFieldGridNode.setCanvasBounds( modelViewTransform.modelToViewBounds( bounds ) );
      // bounds that are slightly larger than the viewport to encompass arrows that are within one row
      // or one column of the border
      electricFieldGridNode.localBounds = modelViewTransform.modelToViewBounds( bounds.dilated( ELECTRIC_FIELD_SENSOR_SPACING / 2 ) );
      electricFieldGridNode.invalidatePaint(); // redraw the canvas
    } );

    // this node is visible if (1) the electricField is checked AND (2) there is at least one charge particle  on the board
    var isElectricFieldGridNodeVisibleProperty = new DerivedProperty( [ isElectricFieldVisibleProperty, isPlayAreaChargedProperty ],
      function( isElectricFieldVisible, isPlayAreaCharged ) {
        return isElectricFieldVisible && isPlayAreaCharged;
      } );

    var invalidatePaintListener = this.invalidatePaint.bind( this );

    // TODO: bad way of listening to events!
    update( 'electricFieldGridUpdated', invalidatePaintListener );
    ChargesAndFieldsColors.on( 'profileChanged', invalidatePaintListener );
    isElectricFieldDirectionOnlyProperty.link( invalidatePaintListener );
    ElectricFieldArrowCanvas.updateEmitter.addListener( invalidatePaintListener );

    isElectricFieldGridNodeVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
    } );
  }

  chargesAndFields.register( 'ElectricFieldGridCanvasNode', ElectricFieldGridCanvasNode );

  return inherit( CanvasNode, ElectricFieldGridCanvasNode, {

    /**
     * Function responsible for painting the canvas Node as a grid array of squares
     * @override
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      var self = this;

      /**
       * Updates the direction and fill of an arrow : the fill color corresponds to the electricField value at the center
       * of the arrow
       */
      this.electricFieldSensorGrid.forEach( function( electricFieldSensor ) {
        // update only the arrows that are within the visible bounds
        var location = self.modelViewTransform.modelToViewPosition( electricFieldSensor.position );

        // Don't draw the arrow if it won't be seen
        if ( self.localBounds.containsPoint( location ) ) {
          // Saving the context allows us to restore the current state at a later time
          context.save();

          // change the opacity of the arrow (as a function of the magnitude of the electric field) (unless isDirection is checked)
          if(self.isElectricFieldDirectionOnlyProperty.value) {
            context.globalAlpha = 1;
          }
          else{
            // Instead of varying the fill, we change the opacity of the arrow
            context.globalAlpha = electricFieldSensor.electricField.magnitude() / ChargesAndFieldsConstants.MAX_ELECTRIC_FIELD_MAGNITUDE;
          }


          context.translate( location.x, location.y );
          context.rotate( -electricFieldSensor.electricField.angle() );
          context.scale( 1 / ElectricFieldArrowCanvas.scale, 1 / ElectricFieldArrowCanvas.scale );
          context.translate( ElectricFieldArrowCanvas.xOffset, ElectricFieldArrowCanvas.yOffset );
          context.drawImage( ElectricFieldArrowCanvas.canvas, 0, 0 );
          context.restore();
        }
      } );
    }
  } );
} );
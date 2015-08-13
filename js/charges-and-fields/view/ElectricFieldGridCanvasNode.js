// Copyright 2002-2015, University of Colorado Boulder

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
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var CIRCLE_RADIUS = ChargesAndFieldsConstants.ELECTRIC_FIELD_GRID_CIRCLE_RADIUS; // in scenery coordinates
  var ARROW_LENGTH = ChargesAndFieldsConstants.ELECTRIC_FIELD_GRID_ARROW_LENGTH; // in scenery coordinates
  var ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;
  /**
   *
   * @param {Array.<StaticSensorElement>} electricFieldSensorGrid
   * @param {Function} update - function that registers a listener when the specified eventName is triggered. (model.on.bind(model)),
   * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given the magnitude of the electric field
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - bounds of the canvas in model units
   * @param {Property.<boolean>} isPlayAreaChargedProperty - is there at least one charged particle on the board
   * @param {Property.<boolean>} isDirectionOnlyElectricFieldGridVisibleProperty - Controls the arrows Fill - from uniform (true) to variable colors (false)
   * @param {Property.<boolean>} isElectricFieldGridVisibleProperty
   * @constructor
   */
  function ElectricFieldGridCanvasNode( electricFieldSensorGrid,
                                        update,
                                        colorInterpolationFunction,
                                        modelViewTransform,
                                        availableModelBoundsProperty,
                                        isPlayAreaChargedProperty,
                                        isDirectionOnlyElectricFieldGridVisibleProperty,
                                        isElectricFieldGridVisibleProperty ) {

    var electricFieldGridNode = this;

    // Call the super constructor
    CanvasNode.call( this, { canvasBounds: modelViewTransform.modelToViewBounds( availableModelBoundsProperty.get() ) } );

    this.modelViewTransform = modelViewTransform;
    this.colorInterpolationFunction = colorInterpolationFunction;
    this.electricFieldSensorGrid = electricFieldSensorGrid;
    this.isDirectionOnlyElectricFieldGridVisibleProperty = isDirectionOnlyElectricFieldGridVisibleProperty;
    this.localBounds = modelViewTransform.modelToViewBounds( availableModelBoundsProperty.get().dilated( ELECTRIC_FIELD_SENSOR_SPACING / 2 ) );

    availableModelBoundsProperty.link( function( bounds ) {
      electricFieldGridNode.setCanvasBounds( modelViewTransform.modelToViewBounds( bounds ) );
      // bounds that are slightly larger than the viewport to encompass arrows that are within one row
      // or one column of the border
      electricFieldGridNode.localBounds = modelViewTransform.modelToViewBounds( bounds.dilated( ELECTRIC_FIELD_SENSOR_SPACING / 2 ) );
      electricFieldGridNode.invalidatePaint(); // redraw the canvas
    } );

    // this node is visible if (1) the electricField is checked AND (2) there is at least one charge particle  on the board
    var isElectricFieldGridNodeVisibleProperty = new DerivedProperty( [ isElectricFieldGridVisibleProperty, isPlayAreaChargedProperty ],
      function( isElectricFieldVisible, isPlayAreaCharged ) {
        return isElectricFieldVisible && isPlayAreaCharged;
      } );

    isDirectionOnlyElectricFieldGridVisibleProperty.link( function() {
      electricFieldGridNode.invalidatePaint(); // redraw the canvas );
    } );

    ChargesAndFieldsColors.on( 'profileChanged', function() {
      // redraw the canvas
      electricFieldGridNode.updateArrowImage();
      electricFieldGridNode.invalidatePaint();
    } );

    update( 'electricFieldGridUpdated', function() {
      // redraw the canvas
      electricFieldGridNode.invalidatePaint();
    } );

    // in the model, the electric potential grid is not being updated if isVisible is false
    // hence there is no further performance optimization (or logic ) to be put in the view.
    isElectricFieldGridNodeVisibleProperty.link( function( isVisible ) {
      electricFieldGridNode.visible = isVisible;
    } );

    // We store an image of the arrow to be drawn in arrowCanvas. It is scaled up by arrowScale (to deal with
    // resolution), and the pivot point of the arrow on the image is at arrowScale*arrowOffset[X/Y].
    this.arrowScale = 2;
    this.arrowOffsetX = 25;
    this.arrowOffsetY = 10;
    this.arrowCanvas = null; // will be filled in by updateArrowImage()
    this.updateArrowImage();

    this.invalidatePaint();
  }

  return inherit( CanvasNode, ElectricFieldGridCanvasNode, {
    updateArrowImage: function() {
      /*
       * The arrow is drawn pointing to the right, inside a Canvas to be used for drawing in the future.
       */
      var fraction = 2 / 5;
      var tailLength = ARROW_LENGTH * (fraction);
      var tipLength = ARROW_LENGTH * (1 - fraction);
      var options = {
        tailWidth: 8,
        headWidth: 16,
        headHeight: 10
      };

      var canvas = document.createElement( 'canvas' );
      var context = canvas.getContext( '2d' );
      canvas.width = (ARROW_LENGTH + options.headHeight) * this.arrowScale;
      canvas.height = (options.headWidth + 2) * this.arrowScale;

      var locationX = this.arrowOffsetX;
      var locationY = this.arrowOffsetY;

      context.fillStyle = ChargesAndFieldsColors.electricFieldGridSaturation.toCSS();

      context.scale( this.arrowScale, this.arrowScale );

      // start arrow path
      context.beginPath();
      // move to the tip of the arrow
      context.moveTo(
        locationX + tipLength,
        locationY );
      context.lineTo(
        locationX + (tipLength - options.headHeight),
        locationY + options.headWidth / 2 );
      context.lineTo(
        locationX + (tipLength - options.headHeight),
        locationY + options.tailWidth / 2 );
      // line to the tail end of the arrow
      context.lineTo(
        locationX - (tailLength),
        locationY + options.tailWidth / 2 );
      context.lineTo(
        locationX - (tailLength),
        locationY - options.tailWidth / 2 );
      context.lineTo(
        locationX + (tipLength - options.headHeight),
        locationY - options.tailWidth / 2 );
      context.lineTo(
        locationX + (tipLength - options.headHeight),
        locationY - options.headWidth / 2 );
      context.closePath();
      context.fill();

      // add circle representing the pivot point
      context.fillStyle = ChargesAndFieldsColors.background.toCSS();
      context.beginPath();
      context.arc( locationX, locationY, CIRCLE_RADIUS, 0, 2 * Math.PI );
      context.closePath();
      context.fill();

      this.arrowCanvas = canvas;
    },

    /**
     * Function responsible for painting the canvas Node as a grid array of squares
     * @override
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var self = this;
      var context = wrapper.context;

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

          // Instead of varying the fill, we change the opacity of the arrow
          context.globalAlpha = electricFieldSensor.electricField.magnitude() / ChargesAndFieldsConstants.MAX_ELECTRIC_FIELD_MAGNITUDE;

          context.translate( location.x, location.y );
          context.rotate( -electricFieldSensor.electricField.angle() );
          context.translate( -self.arrowOffsetX, -self.arrowOffsetY ); // put our pivot point on the origin
          context.scale( 1 / self.arrowScale, 1 / self.arrowScale ); // compensate for the scaling
          context.drawImage( self.arrowCanvas, 0, 0 );
          context.restore();
        }
      } );
    }
  } );
} );
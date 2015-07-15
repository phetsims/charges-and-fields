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
  var CIRCLE_RADIUS = 2; // in scenery coordinates
  var ARROW_LENGTH = 40; // in scenery coordinates
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
    this.localBounds = modelViewTransform.modelToViewBounds( bounds.dilated( ELECTRIC_FIELD_SENSOR_SPACING / 2 ) )

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



    this.invalidatePaint();

  }

  return inherit( CanvasNode, ElectricFieldGridCanvasNode, {

    /**
     * Function responsible for painting the canvas Node as a grid array of squares
     * @override
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var self = this;
      var context = wrapper.context;

      /*
       * First we set the arrow horizontally to point along the positive x direction. its orientation will be updated later
       * The point for the center of rotation is measured from the tail and is given by fraction*ARROW_LENGTH;
       *
       * fraction=1/2 => rotate around the center of the arrow,
       * fraction=0 => rotate around the tail
       * fraction=1 => rotate around the tip,
       */
      var fraction = 2 / 5;
      var tailLength = ARROW_LENGTH * (fraction);
      var tipLength = ARROW_LENGTH * (1 - fraction);
      var options = {
        tailWidth: 8,
        headWidth: 16,
        headHeight: 10
      };

      /**
       * Function that updates the direction and fill of an arrow : the fill color corresponds to the electricField value at the center
       * of the arrow
       */
      var updateArrow = function( electricFieldSensor ) {

        // update only the arrows that are within the visible bounds
        var location = self.modelViewTransform.modelToViewPosition( electricFieldSensor.position );
        if ( self.localBounds.containsPoint( location ) ) {
          // minus sign for the angle since the modelViewTransform inverts the y-axis
          var angle = -electricFieldSensor.electricField.angle();
          // convenience variables
          var cosine = Math.cos( angle );
          var sine = Math.sin( angle );


          if ( self.isDirectionOnlyElectricFieldGridVisibleProperty.value ) {
            context.fillStyle = ChargesAndFieldsColors.electricFieldGridSaturation.toCSS();
          }
          else {
            context.fillStyle = self.colorInterpolationFunction( electricFieldSensor.electricField.magnitude() );
          }
          // start arrow path
          context.beginPath();
          // move to the tip of the arrow
          context.moveTo(
            location.x + tipLength * cosine,
            location.y + tipLength * sine );
          context.lineTo(
            location.x + (tipLength - options.headHeight) * cosine - options.headWidth / 2 * sine,
            location.y + (tipLength - options.headHeight) * sine + options.headWidth / 2 * cosine );
          context.lineTo(
            location.x + (tipLength - options.headHeight) * cosine - options.tailWidth / 2 * sine,
            location.y + (tipLength - options.headHeight) * sine + options.tailWidth / 2 * cosine );
          // line to the tail end of the arrow
          context.lineTo(
            location.x - (tailLength) * cosine - options.tailWidth / 2 * sine,
            location.y - (tailLength) * sine + options.tailWidth / 2 * cosine );
          context.lineTo(
            location.x - (tailLength) * cosine + options.tailWidth / 2 * sine,
            location.y - (tailLength) * sine - options.tailWidth / 2 * cosine );
          context.lineTo(
            location.x + (tipLength - options.headHeight) * cosine + options.tailWidth / 2 * sine,
            location.y + (tipLength - options.headHeight) * sine - options.tailWidth / 2 * cosine );
          context.lineTo(
            location.x + (tipLength - options.headHeight) * cosine + options.headWidth / 2 * sine,
            location.y + (tipLength - options.headHeight) * sine - options.headWidth / 2 * cosine );
          context.closePath();
          context.fill();

          // add circle representing the pivot point
          context.fillStyle = ChargesAndFieldsColors.background.toCSS();
          context.beginPath();
          context.arc( location.x, location.y, CIRCLE_RADIUS, 0, 2 * Math.PI );
          context.closePath();
          context.fill();
        }
      };

      this.electricFieldSensorGrid.forEach( updateArrow );
    }
  } );
} );
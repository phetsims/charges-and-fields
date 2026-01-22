// Copyright 2016, University of Colorado Boulder

/**
 * View for the electric potential Node that uses Canvas.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Vector2 = require( 'DOT/Vector2' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargeTracker = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargeTracker' );
  var inherit = require( 'PHET_CORE/inherit' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // Spacing in the model coordinate frame.
  var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

  /**
   * @constructor
   *
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} modelBounds - The bounds in the model that need to be drawn
   * @param {Property.<boolean>} isVisibleProperty
   */
  function ElectricPotentialCanvasNode( chargedParticles,
                                        modelViewTransform,
                                        modelBounds,
                                        isVisibleProperty ) {

    CanvasNode.call( this, {
      canvasBounds: modelViewTransform.modelToViewBounds( modelBounds )
    } );

    this.chargeTracker = new ChargeTracker( chargedParticles );

    this.modelViewTransform = modelViewTransform;
    this.modelBounds = modelBounds;
    this.viewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    var invalidateSelfListener = this.forceRepaint.bind( this );
    ChargesAndFieldsColors.on( 'profileChanged', invalidateSelfListener ); // color change
    isVisibleProperty.link( invalidateSelfListener ); // visibility change
    chargedParticles.addItemAddedListener( function( particle ) {
      particle.positionProperty.link( invalidateSelfListener );
    } ); // particle added
    chargedParticles.addItemRemovedListener( function( particle ) {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } ); // particle removed

    isVisibleProperty.linkAttribute( this, 'visible' );

    this.modelPositions = []; // {Array.<Vector2>}
    var width = modelBounds.width;
    var height = modelBounds.height;
    var numHorizontal = Math.ceil( width / ELECTRIC_POTENTIAL_SENSOR_SPACING );
    var numVertical = Math.ceil( height / ELECTRIC_POTENTIAL_SENSOR_SPACING );
    for ( var row = 0; row < numVertical; row++ ) {
      var y = modelBounds.minY + ( row + 0.5 ) * height / numVertical;

      for ( var col = 0; col < numHorizontal; col++ ) {
        var x = modelBounds.minX + ( col + 0.5 ) * width / numHorizontal;

        this.modelPositions.push( new Vector2( x, y ) );
      }
    }

    this.electricPotentials = new Float64Array( this.modelPositions.length );

    this.directCanvas = document.createElement( 'canvas' );
    this.directCanvas.width = numHorizontal;
    this.directCanvas.height = numVertical;
    this.directContext = this.directCanvas.getContext( '2d' );
    this.directCanvasDirty = true; // Store a dirty flag, in case there weren't charge changes detected

    this.imageData = this.directContext.getImageData( 0, 0, numHorizontal, numVertical );
    assert && assert( this.imageData.width === numHorizontal );
    assert && assert( this.imageData.height === numVertical );

    this.disposeElectricPotentialCanvasNode = function() {
      isVisibleProperty.unlink( invalidateSelfListener ); // visibility change
    };

  }

  chargesAndFields.register( 'ElectricPotentialCanvasNode', ElectricPotentialCanvasNode );

  return inherit( CanvasNode, ElectricPotentialCanvasNode, {

    forceRepaint: function() {
      this.invalidatePaint();
      this.directCanvasDirty = true;
    },

    updateElectricPotentials: function() {
      var kConstant = ChargesAndFieldsConstants.K_CONSTANT;

      var numChanges = this.chargeTracker.queue.length;

      for ( var i = 0; i < numChanges; i++ ) {
        var item = this.chargeTracker.queue[ i ];
        var oldPosition = item.oldPosition;
        var newPosition = item.newPosition;
        var charge = item.charge;

        for ( var j = 0; j < this.modelPositions.length; j++ ) {
          var position = this.modelPositions[ j ];
          var electricPotential = this.electricPotentials[ j ];

          if ( oldPosition ) {
            var oldDistance = position.distance( oldPosition );
            if ( oldDistance !== 0 ) {
              electricPotential -= charge * kConstant / oldDistance;
            }
          }

          if ( newPosition ) {
            var newDistance = position.distance( newPosition );
            if ( newDistance !== 0 ) {
              electricPotential += charge * kConstant / newDistance;
            }
          }

          this.electricPotentials[ j ] = electricPotential;
        }
      }

      this.chargeTracker.clear();

      // Update our direct canvas if necessary
      if ( numChanges || this.directCanvasDirty ) {
        var zeroColor = ChargesAndFieldsColors.electricPotentialGridZero;
        var positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositive;
        var negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegative;
        var data = this.imageData.data;

        for ( var k = 0; k < this.electricPotentials.length; k++ ) {
          var value = this.electricPotentials[ k ] / 40; // mapped with special constant

          var extremeColor;
          if ( value > 0 ) {
            extremeColor = positiveColor;
          }
          else {
            value = -value;
            extremeColor = negativeColor;
          }
          value = Math.min( value, 1 ); // clamp to [0,1]

          var offset = 4 * k;
          data[ offset + 0 ] = extremeColor.r * value + zeroColor.r * ( 1 - value );
          data[ offset + 1 ] = extremeColor.g * value + zeroColor.g * ( 1 - value );
          data[ offset + 2 ] = extremeColor.b * value + zeroColor.b * ( 1 - value );
          data[ offset + 3 ] = 255 * ( extremeColor.a * value + zeroColor.a * ( 1 - value ) );
        }

        this.directContext.putImageData( this.imageData, 0, 0 );

        this.directCanvasDirty = false;
      }
    },

    /**
     * Function responsible for painting the canvas Node as a grid array of squares
     * @override
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      this.updateElectricPotentials();

      context.save();

      var sx = this.viewBounds.width / this.directCanvas.width;
      var sy = -this.viewBounds.height / this.directCanvas.height;
      var tx = this.viewBounds.minX;
      var ty = this.viewBounds.maxY;
      context.transform( sx, 0, 0, sy, tx, ty );

      context.drawImage( this.directCanvas, 0, 0 );

      context.restore();
    },

    dispose: function() {
      this.disposeElectricPotentialCanvasNode();
    }

  } );
} );
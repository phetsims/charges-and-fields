// Copyright 2016-2019, University of Colorado Boulder

/**
 * View for the electric field arrows that uses Canvas
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargeTracker = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargeTracker' );
  var ElectricFieldArrowCanvas = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldArrowCanvas' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Spacing in the model coordinate frame.
  var ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;

  var MIN_VISIBLE_ELECTRIC_FIELD_MAG = 1e-9; // V/m

  var scratchVector = new Vector2( 0, 0 );

  /**
   * @constructor
   *
   * @param {ObservableArray.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} modelBounds - The bounds in the model that need to be drawn
   * @param {Property.<boolean>} isElectricFieldDirectionOnlyProperty
   * @param {Property.<boolean>} isVisibleProperty
   */
  function ElectricFieldCanvasNode( chargedParticles,
                                    modelViewTransform,
                                    modelBounds,
                                    isElectricFieldDirectionOnlyProperty,
                                    isVisibleProperty ) {

    CanvasNode.call( this, {
      canvasBounds: modelViewTransform.modelToViewBounds( modelBounds )
    } );

    this.chargeTracker = new ChargeTracker( chargedParticles );

    this.modelViewTransform = modelViewTransform;
    this.modelBounds = modelBounds;
    this.viewBounds = this.modelViewTransform.modelToViewBounds( modelBounds );
    this.isElectricFieldDirectionOnlyProperty = isElectricFieldDirectionOnlyProperty;
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    var invalidateSelfListener = this.invalidatePaint.bind( this );

    ChargesAndFieldsColorProfile.electricFieldGridSaturationProperty.link( invalidateSelfListener ); // color change

    isVisibleProperty.link( invalidateSelfListener ); // visibility change

    isElectricFieldDirectionOnlyProperty.link( invalidateSelfListener ); // visibility change

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
    var numHorizontal = Math.ceil( width / ELECTRIC_FIELD_SENSOR_SPACING );
    var numVertical = Math.ceil( height / ELECTRIC_FIELD_SENSOR_SPACING );
    for ( var row = 0; row < numVertical; row++ ) {
      var y = modelBounds.minY + ( row + 0.5 ) * height / numVertical;

      for ( var col = 0; col < numHorizontal; col++ ) {
        var x = modelBounds.minX + ( col + 0.5 ) * width / numHorizontal;

        this.modelPositions.push( new Vector2( x, y ) );
      }
    }

    // {Array.<Vector2>}
    this.viewPositions = this.modelPositions.map( function( position ) {
      return modelViewTransform.modelToViewPosition( position );
    } );

    // {Array.<Vector2>}, where electricField[ i ] is the 2D field at positions[ i ]
    this.electricField = this.modelPositions.map( function() {
      return new Vector2( 0, 0 );
    } );

    this.disposeElectricFieldCanvasNode = function() {
      isVisibleProperty.unlink( invalidateSelfListener ); // visibility change
      isElectricFieldDirectionOnlyProperty.unlink( invalidateSelfListener ); // visibility change
    };
  }

  chargesAndFields.register( 'ElectricFieldCanvasNode', ElectricFieldCanvasNode );

  return inherit( CanvasNode, ElectricFieldCanvasNode, {

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
          var electricField = this.electricField[ j ];

          if ( oldPosition ) {
            var oldDistanceSquared = position.distanceSquared( oldPosition );
            if ( oldDistanceSquared !== 0 ) {
              electricField.subtract( scratchVector.set( position )
                .subtract( oldPosition )
                .multiplyScalar( kConstant * charge / Math.pow( oldDistanceSquared, 1.5 ) ) );
            }
          }

          if ( newPosition ) {
            var newDistanceSquared = position.distanceSquared( newPosition );
            if ( newDistanceSquared !== 0 ) {
              electricField.add( scratchVector.set( position )
                .subtract( newPosition )
                .multiplyScalar( kConstant * charge / Math.pow( newDistanceSquared, 1.5 ) ) );
            }
          }
        }
      }

      this.chargeTracker.clear();
    },

    /**
     * Function responsible for painting electric field arrows
     * @override
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      this.updateElectricPotentials();

      var isDirectionOnly = this.isElectricFieldDirectionOnlyProperty.get();
      var maxMagnitude = ChargesAndFieldsConstants.EFIELD_COLOR_SAT_MAGNITUDE;

      for ( var i = 0; i < this.viewPositions.length; i++ ) {
        var viewPosition = this.viewPositions[ i ];
        var electricField = this.electricField[ i ];

        context.save();
        context.globalAlpha = Util.clamp( electricField.magnitude() / maxMagnitude, 0, 1 );
        if ( isDirectionOnly && electricField.magnitude() > MIN_VISIBLE_ELECTRIC_FIELD_MAG ) {
          context.globalAlpha = 1.0;
        }

        context.translate( viewPosition.x, viewPosition.y );
        context.rotate( -electricField.angle );
        context.scale( 1 / ElectricFieldArrowCanvas.scale, 1 / ElectricFieldArrowCanvas.scale );
        context.translate( ElectricFieldArrowCanvas.xOffset, ElectricFieldArrowCanvas.yOffset );
        context.drawImage( ElectricFieldArrowCanvas.canvas, 0, 0 );

        context.restore();
      }
    },

    dispose: function() {
      this.disposeElectricFieldCanvasNode();
    }
  } );
} );


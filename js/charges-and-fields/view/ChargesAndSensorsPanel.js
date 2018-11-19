// Copyright 2015-2018, University of Colorado Boulder

/**
 * Scenery Node that contains an enclosure for a positive, a negative electric charge and an electric sensor.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargedParticleRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleRepresentationNode' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var ElectricFieldSensorRepresentationNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorRepresentationNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var minusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/minusOneNanoC' );
  var plusOneNanoCString = require( 'string!CHARGES_AND_FIELDS/plusOneNanoC' );
  var sensorsString = require( 'string!CHARGES_AND_FIELDS/sensors' );

  var HORIZONTAL_SPACING = 60;
  var VERTICAL_SPACING = 25;
  var Y_MARGIN = 10;

  /**
   * Enclosure that contains the charges and sensor
   *
   * @param {ChargesAndFieldsModel} model
   * @param {ChargesAndFieldsScreenView} screenView
   * @param {Function} hookDragHandler - function(modelElement,event) Called when the element is dropped into the play
   *                                     area, hooks up the provided event to the modelElement's corresponding view's
   *                                     drag handler (starts the drag).
   * @param {Property.<boolean>} canAddMoreChargedParticlesProperty - Whether more charged particles can be added.
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   * @constructor
   */
  function ChargesAndSensorsPanel( model,
                                   screenView,
                                   hookDragHandler,
                                   canAddMoreChargedParticlesProperty,
                                   modelViewTransform,
                                   tandem ) {
    var self = this;

    // @private {Array.<Node>}
    this.draggableItems = [];

    /**
     * @param {Tandem} itemTandem
     * @param {string} label
     * @param {Function} createModelElement - Adds one of these items to the model, and returns the model object.
     * @param {Node} previewNode
     * @param {Property.<boolean>} isVisibleProperty
     */
    function createDraggableItem( itemTandem, label, createModelElement, previewNode, isVisibleProperty ) {
      var labelText = new Text( label, {
        font: ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT,
        fill: ChargesAndFieldsColorProfile.enclosureTextProperty,
        centerX: 0,
        maxWidth: 200
      } );

      var node = new Node( {
        children: [
          previewNode,
          labelText
        ],
        cursor: 'pointer',
        tandem: itemTandem
      } );

      // layout
      labelText.top = 0;
      previewNode.centerY = -VERTICAL_SPACING;

      // When pressed, creates a model element and triggers press() on the corresponding view
      node.addInputListener( {
        down: function( event ) {

          // Don't try to start drags with a right mouse button or an attached pointer.
          if ( !event.canStartPress() ) { return; }

          // Representation node location, so that when being "disposed" it will animate back towards the right place.
          var initialViewPosition = previewNode.getUniqueTrailTo( screenView ).getAncestorMatrix().timesVector2( Vector2.ZERO );

          // Create the new model element.
          var modelElement = createModelElement();
          modelElement.initialPosition = modelViewTransform.viewToModelPosition( initialViewPosition );
          modelElement.isActiveProperty.set( false );

          // Hook up the initial drag to the corresponding view element
          hookDragHandler( modelElement, event );
        }
      } );

      node.mouseArea = node.localBounds;
      node.touchArea = node.localBounds.dilatedXY( HORIZONTAL_SPACING / 2, Y_MARGIN );

      isVisibleProperty.linkAttribute( node, 'visible' );

      self.draggableItems.push( node );

      return node;
    }

    // {Property.<boolean>}
    var positiveVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewPositiveChargesProperty ], function( canAdd, allowNew ) {
      return canAdd && allowNew;
    } );

    // {Property.<boolean>}
    var negativeVisibleProperty = new DerivedProperty( [ canAddMoreChargedParticlesProperty, model.allowNewNegativeChargesProperty ], function( canAdd, allowNew ) {
      return canAdd && allowNew;
    } );

    // {Property.<boolean>}
    var electricFieldSensorVisibleProperty = model.allowNewElectricFieldSensorsProperty;

    this.hboxContent = new HBox( {
      align: 'bottom',
      spacing: HORIZONTAL_SPACING,
      children: [
        createDraggableItem( tandem.createTandem( 'positiveCharge' ),
          plusOneNanoCString,
          function() {
            return model.addPositiveCharge( model.chargedParticleGroupTandem.createNextTandem() );
          },
          new ChargedParticleRepresentationNode( 1 ),
          positiveVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'negativeCharge' ),
          minusOneNanoCString,
          function() {
            return model.addNegativeCharge( model.chargedParticleGroupTandem.createNextTandem() );
          },
          new ChargedParticleRepresentationNode( -1 ),
          negativeVisibleProperty ),

        createDraggableItem( tandem.createTandem( 'electricFieldSensor' ),
          sensorsString,
          function() {
            return model.addElectricFieldSensor( model.electricFieldSensorGroupTandem.createNextTandem() );
          },

          new ElectricFieldSensorRepresentationNode(),
          electricFieldSensorVisibleProperty )
      ]
    } );

    Panel.call( this, this.hboxContent, {
      lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH,
      cornerRadius: 5,
      stroke: ChargesAndFieldsColorProfile.enclosureBorderProperty,
      fill: ChargesAndFieldsColorProfile.enclosureFillProperty,
      xMargin: HORIZONTAL_SPACING / 2,
      yMargin: Y_MARGIN,
      tandem: tandem
    } );

    this.draggableItems.forEach( function( draggableItem ) {
      draggableItem.on( 'visibility', self.updateChildrenWithVisibility.bind( self ) );
    } );
    this.updateChildrenWithVisibility();
  }

  chargesAndFields.register( 'ChargesAndSensorsPanel', ChargesAndSensorsPanel );

  return inherit( Panel, ChargesAndSensorsPanel, {
    /**
     * Ensures visible items are children, and invisible items are removed.
     * @private
     */
    updateChildrenWithVisibility: function() {
      this.hboxContent.children = this.draggableItems.filter( function( draggableItem ) {
        return draggableItem.visible;
      } );
    }
  } );

} );

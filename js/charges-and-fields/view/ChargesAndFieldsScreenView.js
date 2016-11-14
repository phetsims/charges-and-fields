// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main screen View of the Charges and Fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsControlPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsControlPanel' );
  var ChargesAndFieldsToolboxPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsToolboxPanel' );
  var ChargesAndSensorsPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndSensorsPanel' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ChargedParticleNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode' );
  var ElectricFieldCanvasNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldCanvasNode' );
  var ElectricFieldSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode' );
  var ElectricPotentialSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode' );
  var ElectricPotentialCanvasNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialCanvasNode' );
  var ElectricPotentialWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialWebGLNode' );
  var ElectricPotentialMobileWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialMobileWebGLNode' );
  var ElectricPotentialLinesNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialLinesNode' );
  var ChargesAndFieldsMeasuringTapeNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsMeasuringTapeNode' );
  var GridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GridNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var DotUtil = require( 'DOT/Util' ); // eslint-disable-line require-statement-match
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Util = require( 'SCENERY/util/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // constants
  var linear = DotUtil.linear;
  var MAX_ELECTRIC_POTENTIAL = 40; // electric potential (in volts) at which color will saturate to colorMax
  var MIN_ELECTRIC_POTENTIAL = -40; // electric potential at which color will saturate to minColor

  // True (final arg) clamps the linear interpolation function
  var ELECTRIC_FIELD_LINEAR_FUNCTION = new LinearFunction( 0, ChargesAndFieldsConstants.EFIELD_COLOR_SAT_MAGNITUDE, 0, 1, true );
  var ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION = new LinearFunction( MIN_ELECTRIC_POTENTIAL, 0, 0, 1, true );
  var ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION = new LinearFunction( 0, MAX_ELECTRIC_POTENTIAL, 0, 1, true );

  var IS_DEBUG_MODE = false; // debug mode that displays a push button capable of adding multiple electric field lines

  /**
   * @constructor
   *
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsScreenView( model, tandem ) {

    var self = this;
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    // Create a property that registers the model bounds based on the screen size
    // Note that unlike the viewPropertySet above, the availableModelBounds should not be reset when
    // the resetAllButton is pressed, hence the reason it is not part of the previous propertySet
    this.availableModelBoundsProperty = new Property( model.enlargedBounds );

    // The origin of the model is set to the middle of the dev bounds. There are 8 meters across the width of the dev bounds.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.width / 2, this.layoutBounds.height / 2 ),
      this.layoutBounds.width / ChargesAndFieldsConstants.WIDTH );

    // convenience variables
    this.modelViewTransform = modelViewTransform;
    this.model = model;

    // The mobile WebGL implementation will work with basic WebGL support
    var allowMobileWebGL = Util.checkWebGLSupport() && phet.chipper.queryParameters.webgl;

    // The unlimited-particle implementation will work only with OES_texture_float where writing to
    // float textures is supported.
    var allowWebGL = allowMobileWebGL && Util.checkWebGLSupport( [ 'OES_texture_float' ] ) &&
      ElectricPotentialWebGLNode.supportsRenderingToFloatTexture();

    var electricPotentialGridNode;

    // Create the electric Potential grid node that displays an array of contiguous rectangles of changing colors
    if ( allowWebGL ) {
      electricPotentialGridNode = new ElectricPotentialWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialVisibleProperty
      );
    } else if ( allowMobileWebGL ) {
      electricPotentialGridNode = new ElectricPotentialMobileWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialVisibleProperty
      );
    } else {
      electricPotentialGridNode = new ElectricPotentialCanvasNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.enlargedBounds,
        model.isElectricPotentialVisibleProperty
      );
    }

    // Create a grid of electric field arrow sensors
    var electricFieldGridNode = new ElectricFieldCanvasNode(
      model.activeChargedParticles,
      modelViewTransform,
      model.enlargedBounds,
      model.isElectricFieldDirectionOnlyProperty,
      model.isElectricFieldVisibleProperty );


    // Create the scenery node responsible for drawing the electricPotential lines
    var electricPotentialLinesNode = new ElectricPotentialLinesNode(
      model.electricPotentialLines,
      modelViewTransform,
      model.areValuesVisibleProperty,
      tandem.createTandem( 'electricPotentialLinesNode' ) );

    // Create the draggable electric potential sensor node with a electric potential readout
    var electricPotentialSensorNode = new ElectricPotentialSensorNode(
      model.electricPotentialSensor,
      this.getElectricPotentialColor.bind( this ),
      model.clearElectricPotentialLines.bind( model ),
      model.addElectricPotentialLine.bind( model ),
      modelViewTransform,
      this.availableModelBoundsProperty,
      model.isPlayAreaChargedProperty,
      tandem.createTandem( 'electricPotentialSensorNode' ) );

    // Create a visual grid with major and minor lines on the view
    var gridNode = new GridNode(
      modelViewTransform,
      new Property( model.enlargedBounds ),
      model.isGridVisibleProperty,
      model.areValuesVisibleProperty );

    // Create the electric control panel on the upper right hand side
    var controlPanel = new ChargesAndFieldsControlPanel( model, tandem.createTandem( 'controlPanel' ) );

    // Create the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        // do not reset the availableDragBoundsProperty
        model.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // Create a measuring tape (set to invisible initially)
    var measuringTapeNode = new ChargesAndFieldsMeasuringTapeNode( model.measuringTape,
      modelViewTransform,
      this.availableModelBoundsProperty,
      tandem.createTandem( 'measuringTapeNode' ) );

    // The color of measurement text of the measuring tape updates itself when the projector/default color scheme changes
    ChargesAndFieldsColorProfile.measuringTapeTextProperty.linkAttribute( measuringTapeNode, 'textColor' );

    // Create the toolboxPanel with the measuring tape and the electric potential sensor icons
    var toolboxPanel = new ChargesAndFieldsToolboxPanel(
      model.measuringTape,
      model.electricPotentialSensor,
      measuringTapeNode,
      electricPotentialSensorNode,
      modelViewTransform,
      this.availableModelBoundsProperty,
      tandem.createTandem( 'toolboxPanel' )
    );

    // Create the layer where the charged Particles and electric Field Sensors will be placed.
    // Force the moving charged Particles and electric Field Sensors into a separate layer for performance reasons.
    var draggableElementsLayer = new Node( { layerSplit: true } );

    // webGL devices that do not have have full WebGL support can only have a finite number of charges on board
    var isNumberChargesLimited = allowMobileWebGL && !( allowWebGL );

    var numberChargesLimit = ( isNumberChargesLimited ) ?
      ElectricPotentialMobileWebGLNode.getNumberOfParticlesSupported() :
      Number.POSITIVE_INFINITY;

    var canAddMoreChargedParticlesProperty = new DerivedProperty( [ model.chargedParticles.lengthProperty ],
      function( length ) {
        return length < numberChargesLimit;
      } );

    // Create the charge and sensor enclosure, will be displayed at the bottom of the screen
    var chargesAndSensorsPanel = new ChargesAndSensorsPanel(
      model, this,
      function( modelElement, event ) {
        // Horrible horrible hacks
        draggableElementsLayer.children.forEach( function( potentialView ) {
          if ( potentialView.modelElement === modelElement ) {
            potentialView.movableDragHandler.startDrag( event );
          }
        } );
      },
      canAddMoreChargedParticlesProperty, modelViewTransform, tandem.createTandem( 'chargesAndSensorsPanel' ) );

    function updateSensorPanelLayout() {
      chargesAndSensorsPanel.bottom = self.layoutBounds.bottom - 15;
      chargesAndSensorsPanel.centerX = self.layoutBounds.centerX;

      model.chargesAndSensorsEnclosureBounds.set( modelViewTransform.viewToModelBounds( chargesAndSensorsPanel.bounds ) );
    }
    chargesAndSensorsPanel.on( 'localBounds', updateSensorPanelLayout );
    updateSensorPanelLayout();

    // Only show the ChargesAndSensorsPanel when at least one of its elements is visible
    new DerivedProperty( [
      model.allowNewPositiveChargesProperty,
      model.allowNewNegativeChargesProperty,
      model.allowNewElectricFieldSensorsProperty
    ], function( positive, negative, electricFieldSensors ) {
      return positive || negative || electricFieldSensors;
    } ).linkAttribute( chargesAndSensorsPanel, 'visible' );

    // Handle the comings and goings of charged particles.
    var chargedParticleNodeGroupTandem = tandem.createGroupTandem( 'chargedParticleNode' );
    model.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {
      // Create and add the view representation for this chargedParticle.
      var chargedParticleNode = new ChargedParticleNode(
        addedChargedParticle,
        modelViewTransform,
        self.availableModelBoundsProperty,
        model.chargesAndSensorsEnclosureBounds,
        chargedParticleNodeGroupTandem.createNextTandem() );
      draggableElementsLayer.addChild( chargedParticleNode );

      addedChargedParticle.disposeEmitter.addListener( function callback() {
        addedChargedParticle.disposeEmitter.removeListener( callback );
        chargedParticleNode.dispose();
        draggableElementsLayer.removeChild( chargedParticleNode );
      } );
    } );

    // Handle the comings and goings of charged electric field sensors.
    var electricFieldSensorNodeGroupTandem = tandem.createGroupTandem( 'electricFieldSensorNode' );
    model.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {
      // Create and add the view representation for this electric Field Sensor
      var electricFieldSensorNode = new ElectricFieldSensorNode(
        addedElectricFieldSensor,
        modelViewTransform,
        self.availableModelBoundsProperty,
        model.isPlayAreaChargedProperty,
        model.areValuesVisibleProperty,
        model.chargesAndSensorsEnclosureBounds,
        electricFieldSensorNodeGroupTandem.createNextTandem() );
      draggableElementsLayer.addChild( electricFieldSensorNode );

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.electricFieldSensors.addItemRemovedListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          removedElectricFieldSensor.dispose();
          electricFieldSensorNode.dispose();
          draggableElementsLayer.removeChild( electricFieldSensorNode );
          model.electricFieldSensors.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // listens to the isUserControlled property of the electric potential sensor
    // return the electric Potential sensor to the toolboxPanel if it is not user Controlled and the
    // location of the sensor is inside the toolboxPanel panel
    electricPotentialSensorNode.isUserControlledProperty.link( function( isUserControlled ) {
      if ( !isUserControlled && toolboxPanel.bounds.intersectsBounds( electricPotentialSensorNode.bounds.eroded( 5 ) ) ) {
        model.electricPotentialSensor.isActiveProperty.set( false );
      }
    } );

    // listens to the isUserControlled property of the measuring tape
    // return the measuring tape to the toolboxPanel if not user Controlled and
    // its position is located within the toolbox panel
    measuringTapeNode.isBaseUserControlledProperty.link( function( isUserControlled ) {
      var tapeBaseBounds = measuringTapeNode.localToParentBounds( measuringTapeNode.getLocalBaseBounds() );
      if ( !isUserControlled && toolboxPanel.bounds.intersectsBounds( tapeBaseBounds.eroded( 5 ) ) ) {
        model.measuringTape.isActiveProperty.set( false );
      }
    } );

    // dynamic parts of the control layout
    function updateControlLayout() {
      // right-align control panels
      var right = modelViewTransform.modelToViewX( self.availableModelBoundsProperty.value.right ) - 10;
      controlPanel.right = right;
      resetAllButton.right = right;
      toolboxPanel.right = right;

      toolboxPanel.top = controlPanel.bottom + 10;
    }

    // link the available model bounds
    this.availableModelBoundsProperty.link( function( bounds ) {

      // the measuring Tape is subject to dragBounds (specified in model coordinates)
      measuringTapeNode.dragBounds = bounds;

      updateControlLayout();
    } );

    controlPanel.on( 'localBounds', updateControlLayout );

    // static parts of the control layout
    controlPanel.top = 30;
    gridNode.centerX = this.layoutBounds.centerX;
    gridNode.top = modelViewTransform.modelToViewY( model.enlargedBounds.maxY );
    resetAllButton.bottom = this.layoutBounds.maxY - 20;

    this.addChild( electricPotentialGridNode ); // it is the bottom of the z-order
    this.addChild( gridNode );
    this.addChild( electricFieldGridNode );
    this.addChild( electricPotentialLinesNode );
    this.addChild( toolboxPanel );
    this.addChild( controlPanel );
    this.addChild( resetAllButton );
    this.addChild( chargesAndSensorsPanel );
    this.addChild( draggableElementsLayer );
    this.addChild( electricPotentialSensorNode );
    this.addChild( measuringTapeNode );

    // if in debug mode, add a button that allows to add (many at a time) electric potential lines
    // and set up initial charges on the play area
    if ( IS_DEBUG_MODE ) {
      this.addChild( new RectangularPushButton( {
        listener: function() {
          model.addManyElectricPotentialLines( 20 );
        },
        baseColor: 'rgb( 0, 222, 120 )',
        minWidth: 20,
        minHeight: 20,
        centerX: resetAllButton.centerX,
        centerY: resetAllButton.centerY - 40
      } ) );


      var position1 = new Vector2( 0.1, 0.1 );
      var position2 = new Vector2( 1.2, 1.2 );
      var charge1 = new ChargedParticle( position1, 1 );
      var charge2 = new ChargedParticle( position2, -1 );
      charge1.initialPosition = new Vector2( 0, -1.5 );
      charge2.initialPosition = new Vector2( 0, -1.5 );
      charge1.isActiveProperty.set( true );
      charge2.isActiveProperty.set( true );

      model.chargedParticles.push( charge1 );
      model.chargedParticles.push( charge2 );

      model.activeChargedParticles.push( charge1 );
      model.activeChargedParticles.push( charge2 );

      model.isPlayAreaCharged = true; // set isPlayAreaCharged to true since there are charges
    }


  }

  chargesAndFields.register( 'ChargesAndFieldsScreenView', ChargesAndFieldsScreenView );

  return inherit( ScreenView, ChargesAndFieldsScreenView, {

    /**
     * Function that returns a color string for a given value of the electricPotential.
     * The interpolation scheme is somewhat unusual in the sense that it is performed via a piecewise function
     * which relies on three colors and three electric potential anchors. It is essentially two linear interpolation
     * functions put end to end so that the entire domain is covered.
     * @private
     * @param {number} electricPotential
     * @param {Object} [options] - useful to set transparency
     * @returns {string} color -  e.g. 'rgba(255, 255, 255, 1)'
     */
    getElectricPotentialColor: function( electricPotential, options ) {

      var finalColor; // {string} e.g. 'rgba(0,0,0,1)'
      var distance; // {number}  between 0 and 1

      // for positive electric potential
      if ( electricPotential > 0 ) {

        // clamped linear interpolation function, output lies between 0 and 1;
        distance = ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION( electricPotential );
        finalColor = this.interpolateRGBA(
          // {Color} color that corresponds to the Electric Potential being zero
          ChargesAndFieldsColorProfile.electricPotentialGridZeroProperty.value,
          // {Color} color of Max Electric Potential
          ChargesAndFieldsColorProfile.electricPotentialGridSaturationPositiveProperty.value,
          distance, // {number} distance must be between 0 and 1
          options );
      }
      // for negative (or zero) electric potential
      else {

        // clamped linear interpolation function, output lies between 0 and 1
        distance = ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION( electricPotential );
        finalColor = this.interpolateRGBA(
          // {Color} color that corresponds to the lowest (i.e. negative) Electric Potential
          ChargesAndFieldsColorProfile.electricPotentialGridSaturationNegativeProperty.value,
          // {Color} color that corresponds to the Electric Potential being zero zero
          ChargesAndFieldsColorProfile.electricPotentialGridZeroProperty.value,
          distance, // {number} distance must be between 0 and 1
          options );
      }
      return finalColor;
    },

    /**
     * Function that returns a color that is proportional to the magnitude of the electric Field.
     * The color interpolates between ChargesAndFieldsColorProfile.electricFieldGridZero (for an
     * electric field value of zero) and ChargesAndFieldsColorProfile.electricFieldGridSaturation (which corresponds to an
     * electric field value of EFIELD_COLOR_SAT_MAGNITUDE).
     * @private
     * @param {number} electricFieldMagnitude - a non negative number
     * @param {Object} [options] - useful to set transparency
     * @returns {string} color - e.g. 'rgba(255, 255, 255, 1)'
     *
     */
    getElectricFieldMagnitudeColor: function( electricFieldMagnitude, options ) {

      // ELECTRIC_FIELD_LINEAR_FUNCTION is a clamped linear function
      var distance = ELECTRIC_FIELD_LINEAR_FUNCTION( electricFieldMagnitude ); // a value between 0 and 1

      return this.interpolateRGBA(
        ChargesAndFieldsColorProfile.electricFieldGridZeroProperty.value, // {Color} color that corresponds to zero electric Field
        ChargesAndFieldsColorProfile.electricFieldGridSaturationProperty.value, // {Color} color that corresponds to the largest electric field
        distance, // {number} distance must be between 0 and 1
        options );
    },

    /**
     * Function that interpolates between two color. The transparency can be set vis a default options
     * The function returns a string in order to minimize the number of allocations
     * @private
     * @param {Color} color1
     * @param {Color} color2
     * @param {number} distance - a value from 0 to 1
     * @param {Object} [options]
     * @returns {string} color - e.g. 'rgba(0,0,0,1)'
     */
    interpolateRGBA: function( color1, color2, distance, options ) {
      options = _.extend( {
        // defaults
        transparency: 1
      }, options );

      if ( distance < 0 || distance > 1 ) {
        throw new Error( 'distance must be between 0 and 1: ' + distance );
      }
      var r = Math.floor( linear( 0, 1, color1.r, color2.r, distance ) );
      var g = Math.floor( linear( 0, 1, color1.g, color2.g, distance ) );
      var b = Math.floor( linear( 0, 1, color1.b, color2.b, distance ) );
      return 'rgba(' + r + ',' + g + ',' + b + ',' + options.transparency + ')';
    },

    /**
     * Function responsible for the layout of the ScreenView.
     * It overrides the layout strategy in ScreenView.js
     * It scales the scene graph up and down with
     * the size of the screen to ensure a minimally visible area,
     * but keeping it centered at the bottom of the screen.
     * @public
     * @param {number} width
     * @param {number} height
     */
    layout: function( width, height ) {

      this.resetTransform();

      var scale = this.getLayoutScale( width, height ); // {number}
      this.setScaleMagnitude( scale );

      var offsetX = 0;
      var offsetY = 0;

      // Move to bottom vertically
      if ( scale === width / this.layoutBounds.width ) {
        offsetY = ( height / scale - this.layoutBounds.height );
      }

      // center horizontally
      else if ( scale === height / this.layoutBounds.height ) {
        offsetX = ( width / scale - this.layoutBounds.width ) / 2;
      }
      this.translate( offsetX, offsetY );

      // nominal view Bounds
      var viewBounds = new Rectangle( -offsetX, -offsetY, width / scale, height / scale );

      // the modelBounds are the nominal viewBounds (in model coordinates) or the model.enlargedBounds, whichever is smaller.
      this.availableModelBoundsProperty.set( this.modelViewTransform.viewToModelBounds( viewBounds ).intersection( this.model.enlargedBounds ) );
    }

  } );
} );


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
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsControlPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsControlPanel' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsToolboxPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsToolboxPanel' );
  var ChargesAndSensorsEnclosureNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndSensorsEnclosureNode' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ChargedParticleNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode' );
  var ElectricFieldGridCanvasNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldGridCanvasNode' );
  var ElectricFieldSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode' );
  var ElectricPotentialSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode' );
  var ElectricPotentialGridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialGridNode' );
  var ElectricPotentialGridWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialGridWebGLNode' );
  var ElectricPotentialGridMobileWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialGridMobileWebGLNode' );
  var ElectricPotentialLinesNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialLinesNode' );
  var GridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GridNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var linear = require( 'DOT/Util' ).linear;
  var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Util = require( 'SCENERY/util/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var centimeterUnitString = require( 'string!CHARGES_AND_FIELDS/centimeterUnit' );

  // constants
  var MAX_ELECTRIC_POTENTIAL = 40; // electric potential (in volts) at which color will saturate to colorMax
  var MIN_ELECTRIC_POTENTIAL = -40; // electric potential at which color will saturate to minColor
  var ELECTRIC_FIELD_LINEAR_FUNCTION = new LinearFunction( 0, ChargesAndFieldsConstants.MAX_ELECTRIC_FIELD_MAGNITUDE, 0, 1, true ); // true clamps the linear interpolation function;
  var ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION = new LinearFunction( MIN_ELECTRIC_POTENTIAL, 0, 0, 1, true ); // clamp the linear interpolation function;
  var ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION = new LinearFunction( 0, MAX_ELECTRIC_POTENTIAL, 0, 1, true ); // clamp the linear interpolation function;
  var IS_DEBUG_MODE = false; // debug mode that displays a push button capable of adding multiple electric field lines

  /**
   *
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @constructor
   */
  function ChargesAndFieldsScreenView( model ) {

    var screenView = this;
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    // Create many properties for checkboxes and Measuring Tape
    var viewPropertySet = new PropertySet( {
      isDirectionOnlyElectricFieldGridVisible: false, // controls the color shading in the fill of
      isValuesVisible: false, // control the visibility of many numerical values ( e field sensors, electricPotential lines, etc)
      isElectricPotentialSensorVisible: false, // control the visibility of the electricPotential sensor
      isGridVisible: false, // control the visibility of the simple grid with minor and major axes
      isMeasuringTapeVisible: false, // control the visibility of the measuring tape
      measuringTapeUnits: { name: centimeterUnitString, multiplier: 100 }, // needed for the measuring tape scenery node
      measuringTapeBasePosition: new Vector2( 0, 0 ),
      measuringTapeTipPosition: new Vector2( 1, 0 )
    } );

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

    // Check to see if WebGL was prevented by a query parameter
    var disallowWebGL = ChargesAndFieldsGlobals.disallowWebGL;

    // The mobile WebGL implementation will work with basic WebGL support
    var allowMobileWebGL = Util.checkWebGLSupport() && !disallowWebGL;

    // The unlimited-particle implementation will work only with OES_texture_float where writing to
    // float textures is supported.
    var allowWebGL = allowMobileWebGL && Util.checkWebGLSupport( [ 'OES_texture_float' ] ) &&
                     ElectricPotentialGridWebGLNode.supportsRenderingToFloatTexture();

    var electricPotentialGridNode;

    // Create the electric Potential grid node that displays an array of contiguous rectangles of changing colors
    if ( allowWebGL ) {
      electricPotentialGridNode = new ElectricPotentialGridWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialGridVisibleProperty
      );
    }
    else if ( allowMobileWebGL ) {
      electricPotentialGridNode = new ElectricPotentialGridMobileWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialGridVisibleProperty
      );
    }
    else {
      electricPotentialGridNode = new ElectricPotentialGridNode(
        model.electricPotentialSensorGrid,
        model.on.bind( model ),
        this.getElectricPotentialColor.bind( this ),
        modelViewTransform,
        this.availableModelBoundsProperty,
        model.isElectricPotentialGridVisibleProperty
      );
    }

    // Create a grid of electric field arrow sensors
    var electricFieldGridNode = new ElectricFieldGridCanvasNode(
        model.electricFieldSensorGrid,
        model.on.bind( model ),
        this.getElectricFieldMagnitudeColor.bind( this ),
        modelViewTransform,
        this.availableModelBoundsProperty,
        model.isPlayAreaChargedProperty,
        viewPropertySet.isDirectionOnlyElectricFieldGridVisibleProperty,
        model.isElectricFieldGridVisibleProperty );


    // Create the scenery node responsible for drawing the electricPotential lines
    var electricPotentialLinesNode = new ElectricPotentialLinesNode(
      model.electricPotentialLinesArray,
      modelViewTransform,
      viewPropertySet.isValuesVisibleProperty );

    // Create the draggable electric potential sensor node with a electric potential readout
    var electricPotentialSensorNode = new ElectricPotentialSensorNode(
      model.electricPotentialSensor,
      this.getElectricPotentialColor.bind( this ),
      model.clearElectricPotentialLines.bind( model ),
      model.addElectricPotentialLine.bind( model ),
      modelViewTransform,
      this.availableModelBoundsProperty,
      viewPropertySet.isElectricPotentialSensorVisibleProperty );

    // Create a visual grid with major and minor lines on the view
    var gridNode = new GridNode(
      modelViewTransform,
      new Property( model.enlargedBounds ),
      viewPropertySet.isGridVisibleProperty,
      viewPropertySet.isValuesVisibleProperty );

    // Create the electric control panel on the upper right hand side
    var controlPanel = new ChargesAndFieldsControlPanel(
      model.isElectricFieldGridVisibleProperty,
      viewPropertySet.isDirectionOnlyElectricFieldGridVisibleProperty,
      model.isElectricPotentialGridVisibleProperty,
      viewPropertySet.isValuesVisibleProperty,
      viewPropertySet.isGridVisibleProperty );

    // Create the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        // do not reset the availableDragBoundsProperty
        model.reset();
        viewPropertySet.reset();
      }
    } );

    // Create the options for a draggable but (subject to some dragBound) Measuring Tape
    var tapeOptions = {
      dragBounds: this.availableModelBoundsProperty.value,
      modelViewTransform: modelViewTransform,
      basePositionProperty: viewPropertySet.measuringTapeBasePositionProperty,
      tipPositionProperty: viewPropertySet.measuringTapeTipPositionProperty,
      isTipDragBounded: true
    };

    // Create a measuring tape (set to invisible initially)
    var measuringTape = new MeasuringTape( viewPropertySet.measuringTapeUnitsProperty, viewPropertySet.isMeasuringTapeVisibleProperty,
      tapeOptions );

    // The color of measurement text of the measuring tape updates itself when the projector/default color scheme changes
    ChargesAndFieldsColors.link( 'measuringTapeText', function( color ) {
      measuringTape.textColor = color;
    } );

    // Create the toolboxPanel with the measuring tape and the electric potential sensor icons
    var toolboxPanel = new ChargesAndFieldsToolboxPanel(
      model.electricPotentialSensor.positionProperty,
      model.electricPotentialSensor.isUserControlledProperty,
      viewPropertySet.measuringTapeBasePositionProperty,
      viewPropertySet.measuringTapeTipPositionProperty,
      measuringTape.isBaseUserControlledProperty,
      viewPropertySet.isElectricPotentialSensorVisibleProperty,
      viewPropertySet.isMeasuringTapeVisibleProperty,
      modelViewTransform,
      this.availableModelBoundsProperty
    );

    // Create the layer where the charged Particles and electric Field Sensors will be placed.
    // Force the moving charged Particles and electric Field Sensors into a separate layer for performance reasons.
    var draggableElementsLayer = new Node( { layerSplit: true } );

    // webGL devices that do not have have full WebGL support can only have a finite number of charges on board
    var isNumberChargesLimited = allowMobileWebGL && !(allowWebGL);

    var numberChargesLimit = ( isNumberChargesLimited ) ?
                             ElectricPotentialGridMobileWebGLNode.getNumberOfParticlesSupported() :
                             Number.POSITIVE_INFINITY;

    // Create the charge and sensor enclosure, will be displayed at the bottom of the screen
    var chargesAndSensorsEnclosureNode = new ChargesAndSensorsEnclosureNode(
      model.addUserCreatedModelElementToObservableArray.bind( model ),
      function( modelElement, array ) {
        // if ( array === model.chargedParticles ) {
        // }
        // else if ( array === model.electricFieldSensors ) {
        // }

        // Horrible horrible hacks
        draggableElementsLayer.children.forEach( function( potentialView ) {
          if ( potentialView.modelElement === modelElement ) {
            potentialView.addInputListener( potentialView.movableDragHandler );
          }
        } );
      },
      model.chargedParticles,
      model.electricFieldSensors,
      numberChargesLimit,
      model.chargesAndSensorsEnclosureBounds,
      modelViewTransform,
      this.availableModelBoundsProperty );

    // Handle the comings and goings of charged particles.
    model.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {
      // Create and add the view representation for this chargedParticle.
      var chargedParticleNode = new ChargedParticleNode(
        addedChargedParticle,
        modelViewTransform,
        screenView.availableModelBoundsProperty );
      draggableElementsLayer.addChild( chargedParticleNode );

      // Add the removal listener for if and when this chargedParticle is removed from the model.
      model.chargedParticles.addItemRemovedListener( function removalListener( removedChargedParticle ) {
        if ( removedChargedParticle === addedChargedParticle ) {
          chargedParticleNode.dispose();
          draggableElementsLayer.removeChild( chargedParticleNode );
          model.chargedParticles.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Handle the comings and goings of charged electric field sensors.
    model.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {
      // Create and add the view representation for this electric Field Sensor
      var electricFieldSensorNode = new ElectricFieldSensorNode(
        addedElectricFieldSensor,
        modelViewTransform,
        screenView.availableModelBoundsProperty,
        model.isPlayAreaChargedProperty,
        viewPropertySet.isValuesVisibleProperty );
      draggableElementsLayer.addChild( electricFieldSensorNode );

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.electricFieldSensors.addItemRemovedListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          electricFieldSensorNode.dispose();
          draggableElementsLayer.removeChild( electricFieldSensorNode );
          model.electricFieldSensors.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // listens to the isUserControlled property of the electric potential sensor
    // return the electric Potential sensor to the toolboxPanel if it is not user Controlled and the
    // location of the sensor is inside the toolboxPanel panel
    model.electricPotentialSensor.isUserControlledProperty.link( function( isUserControlled ) {
      if ( !isUserControlled && toolboxPanel.bounds.intersectsBounds( electricPotentialSensorNode.bounds.eroded( 40 ) ) ) {
        viewPropertySet.isElectricPotentialSensorVisibleProperty.set( false );
      }
    } );

    // listens to the isUserControlled property of the measuring tape
    // return the measuring tape to the toolboxPanel if not user Controlled and its position is located within the toolbox panel
    measuringTape.isBaseUserControlledProperty.link( function( isUserControlled ) {
      if ( !isUserControlled && toolboxPanel.bounds.containsPoint( modelViewTransform.modelToViewPosition( viewPropertySet.measuringTapeBasePositionProperty.value ) ) ) {
        viewPropertySet.isMeasuringTapeVisibleProperty.set( false );
      }
    } );

    // link the available model bounds
    this.availableModelBoundsProperty.link( function( bounds ) {

      // the measuring Tape is subject to dragBounds (specified in model coordinates)
      measuringTape.dragBounds = bounds;

      // the control panel, toolbox panel and resetAllButtons are set to the right of the bounds
      var right = modelViewTransform.modelToViewX( bounds.maxX );
      controlPanel.right = right - 30;
      resetAllButton.right = controlPanel.right;
      toolboxPanel.right = right - 30;
    } );

    // layout the objects
    controlPanel.right = this.layoutBounds.maxX - 30;
    controlPanel.top = 30;
    gridNode.centerX = this.layoutBounds.centerX;
    gridNode.top = modelViewTransform.modelToViewY( model.enlargedBounds.maxY );
    resetAllButton.right = controlPanel.right;
    resetAllButton.bottom = this.layoutBounds.maxY - 20;
    toolboxPanel.right = controlPanel.right;
    toolboxPanel.top = controlPanel.bottom + 10;

    this.addChild( electricPotentialGridNode ); // it is the bottom of the z-order
    this.addChild( gridNode ); //
    this.addChild( electricFieldGridNode );
    this.addChild( electricPotentialLinesNode );
    this.addChild( toolboxPanel );
    this.addChild( controlPanel );
    this.addChild( resetAllButton );
    this.addChild( chargesAndSensorsEnclosureNode );
    this.addChild( draggableElementsLayer );
    this.addChild( electricPotentialSensorNode );
    this.addChild( measuringTape );

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
        }
      ) );


      var position1 = new Vector2( 0.1, 0.1 );
      var position2 = new Vector2( 1.2, 1.2 );
      var charge1 = new ChargedParticle( position1, 1 );
      var charge2 = new ChargedParticle( position2, -1 );
      charge1.destinationPosition = new Vector2( 0, -1.5 );
      charge2.destinationPosition = new Vector2( 0, -1.5 );
      charge1.isActiveProperty.set( true );
      charge2.isActiveProperty.set( true );

      model.chargedParticles.push( charge1 );
      model.chargedParticles.push( charge2 );

      model.activeChargedParticles.push( charge1 );
      model.activeChargedParticles.push( charge2 );

      model.isPlayAreaCharged = true; // set isPlayAreaCharged to true since there are charges
    }


  }

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

        distance = ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION( electricPotential ); // clamped linear interpolation function, output lies between 0 and 1;
        finalColor = this.interpolateRGBA(
          ChargesAndFieldsColors.electricPotentialGridZero, // {Color} color that corresponds to the Electric Potential being zero
          ChargesAndFieldsColors.electricPotentialGridSaturationPositive, // {Color} color of Max Electric Potential
          distance, // {number} distance must be between 0 and 1
          options );
      }
      // for negative (or zero) electric potential
      else {

        distance = ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION( electricPotential ); // clamped linear interpolation function, output lies between 0 and 1;
        finalColor = this.interpolateRGBA(
          ChargesAndFieldsColors.electricPotentialGridSaturationNegative, // {Color} color that corresponds to the lowest (i.e. negative) Electric Potential
          ChargesAndFieldsColors.electricPotentialGridZero,// {Color} color that corresponds to the Electric Potential being zero zero
          distance, // {number} distance must be between 0 and 1
          options );
      }
      return finalColor;
    },

    /**
     * Function that returns a color that is proportional to the magnitude of the electric Field.
     * The color interpolates between ChargesAndFieldsColors.electricFieldGridZero (for an
     * electric field value of zero) and ChargesAndFieldsColors.electricFieldGridSaturation (which corresponds to an
     * electric field value of MAX_ELECTRIC_FIELD_MAGNITUDE).
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
        ChargesAndFieldsColors.electricFieldGridZero,  // {Color} color that corresponds to zero electric Field
        ChargesAndFieldsColors.electricFieldGridSaturation, // {Color} color that corresponds to the largest electric field
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
        offsetY = (height / scale - this.layoutBounds.height);
      }

      // center horizontally
      else if ( scale === height / this.layoutBounds.height ) {
        offsetX = (width / scale - this.layoutBounds.width ) / 2;
      }
      this.translate( offsetX, offsetY );

      // nominal view Bounds
      var viewBounds = new Rectangle( -offsetX, -offsetY, width / scale, height / scale );

      // the modelBounds are the nominal viewBounds (in model coordinates) or the model.enlargedBounds, whichever is smaller.
      this.availableModelBoundsProperty.set( this.modelViewTransform.viewToModelBounds( viewBounds ).intersection( this.model.enlargedBounds ) );
    }

  } );
} );
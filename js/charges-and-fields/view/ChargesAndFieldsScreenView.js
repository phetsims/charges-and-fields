//  Copyright 2002-2015, University of Colorado Boulder

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
  var ChargesAndFieldsToolbox = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsToolbox' );
  var ChargeAndSensorEnclosure = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargeAndSensorEnclosure' );
  var ChargedParticleNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode' );
  var ElectricFieldSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode' );
  var ElectricPotentialSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode' );
  var ElectricPotentialGridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialGridNode' );
  var ElectricPotentialGridWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialGridWebGLNode' );
  var ElectricFieldGridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldGridNode' );
  var EquipotentialLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EquipotentialLineNode' );
  var ElectricFieldLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldLineNode' );
  var GridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GridNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var linear = require( 'DOT/Util' ).linear;
  //var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var MeasuringTape = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/MeasuringTape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Rectangle = require( 'DOT/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  //var Shape = require( 'KITE/Shape' );
  var Util = require( 'SCENERY/util/Util' );
  var Vector2 = require( 'DOT/Vector2' );


  // constants
  var MAX_ELECTRIC_FIELD_MAGNITUDE = 5; // electricField at which color will saturate to maxColor (in Volts/meter)
  var MAX_ELECTRIC_POTENTIAL = 40; // electric potential   (in volts) at which color will saturate to colorMax
  var MIN_ELECTRIC_POTENTIAL = -40; // electric potential   at which color will saturate to minColor

  var ELECTRIC_FIELD_LINEAR_FUNCTION = new LinearFunction( 0, MAX_ELECTRIC_FIELD_MAGNITUDE, 0, 1, true ); // true clamps the linear interpolation function;
  var ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION = new LinearFunction( MIN_ELECTRIC_POTENTIAL, 0, 0, 1, true );  // clamp the linear interpolation function;
  var ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION = new LinearFunction( 0, MAX_ELECTRIC_POTENTIAL, 0, 1, true );  // clamp the linear interpolation function;

  var IS_DEBUG = true;

  /**
   *
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @constructor
   */
  function ChargesAndFieldsScreenView( model ) {

    //var screenView = this;
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    // Create many properties for checkboxes and Measuring Tape
    var viewProperty = new PropertySet( {
      availableModelBounds: model.enlargedBounds, // will be used for dragBounds, and the gridNode, set by this.layout
      isDirectionOnlyElectricFieldGridVisible: false, // controls the color shading in the fill of
      isValuesVisible: false,  // control the visibility of many numerical values ( e field sensors, equipotential lines, etc)
      isElectricPotentialSensorVisible: false, // control the visibility of the equipotential sensor
      isGridVisible: false,  //  control the visibility of the simple grid with minor and major axes
      isMeasuringTapeVisible: false, // control the visibility of the measuring tape
      measuringTapeUnits: { name: 'cm', multiplier: 100 }, // needed for the measuring tape scenery node
      measuringTapeBasePosition: new Vector2( 0, 0 ),
      measuringTapeTipPosition: new Vector2( 1, 0 )
    } );

    // The origin of the model is sets in the middle of the scree. There are 8 meters across the width of the dev bounds.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.width / 2, this.layoutBounds.height / 2 ),
      this.layoutBounds.width / ChargesAndFieldsConstants.WIDTH );

    // convenience variables
    this.modelViewTransform = modelViewTransform;
    this.model = model;
    this.availableModelBoundsProperty = viewProperty.availableModelBoundsProperty;

    // Check to see if WebGL was prevented by a query parameter
    var allowWebGL = phet.chipper.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.checkWebGLSupport( [ 'OES_texture_float' ] ) && allowWebGL;

    var electricPotentialGridNode;
    // Create the electric Potential grid node that displays an array of contiguous rectangles of changing colors
    // TODO: remove false
    if ( webGLSupported && false ) {
      electricPotentialGridNode = new ElectricPotentialGridWebGLNode(
        model,
        model.electricPotentialSensorGrid,
        model.on.bind( model ),
        this.getElectricPotentialColor.bind( this ),
        modelViewTransform.modelToViewBounds( model.enlargedBounds ),
        modelViewTransform,
        model.isChargedParticlePresentProperty,
        model.isElectricPotentialGridVisibleProperty
      );
    }
    else {
      electricPotentialGridNode = new ElectricPotentialGridNode(
        model.electricPotentialSensorGrid,
        model.on.bind( model ),
        this.getElectricPotentialColor.bind( this ),
        viewProperty.availableModelBoundsProperty,
        modelViewTransform,
        model.isChargedParticlePresentProperty,
        model.isElectricPotentialGridVisibleProperty
      );
    }

    // Create a grid of electric field arrow sensors
    var electricFieldGridNode = new ElectricFieldGridNode(
      model.electricFieldSensorGrid,
      model.on.bind( model ),
      this.getElectricFieldMagnitudeColor.bind( this ),
      viewProperty.availableModelBoundsProperty,
      modelViewTransform,
      model.isChargedParticlePresentProperty,
      viewProperty.isDirectionOnlyElectricFieldGridVisibleProperty,
      model.isElectricFieldGridVisibleProperty );

    // Create the scenery node responsible for drawing the equipotential lines
    var equipotentialLineNode = new EquipotentialLineNode(
      model.equipotentialLinesArray,
      modelViewTransform,
      model.isChargedParticlePresentProperty,
      viewProperty.isValuesVisibleProperty );

    // Create the scenery node responsible for drawing the electric field lines
    var electricFieldLineNode = new ElectricFieldLineNode(
      model.electricFieldLinesArray,
      modelViewTransform,
      model.isChargedParticlePresentProperty );

    // Create the draggable electric potential sensor node with a electric potential readout
    var electricPotentialSensorNode = new ElectricPotentialSensorNode(
      model.electricPotentialSensor,
      this.getElectricPotentialColor.bind( this ),
      model.clearEquipotentialLines.bind( model ),
      model.addElectricPotentialLine.bind( model ),
      modelViewTransform,
      viewProperty.availableModelBoundsProperty,
      viewProperty.isElectricPotentialSensorVisibleProperty );

    // Create a visual grid with major and minor lines on the view
    var gridNode = new GridNode(
      modelViewTransform,
      new Property( model.enlargedBounds ),
      viewProperty.isGridVisibleProperty,
      viewProperty.isValuesVisibleProperty );

    // Create the electric control panel on the upper right hand side
    var controlPanel = new ChargesAndFieldsControlPanel(
      model.isElectricFieldGridVisibleProperty,
      viewProperty.isDirectionOnlyElectricFieldGridVisibleProperty,
      model.isElectricPotentialGridVisibleProperty,
      viewProperty.isValuesVisibleProperty,
      viewProperty.isGridVisibleProperty );

    // Create the toolbox with the measuring tape and the electric potential sensor icons
    var toolbox = new ChargesAndFieldsToolbox(
      model.electricPotentialSensor.positionProperty,
      viewProperty.measuringTapeBasePositionProperty,
      viewProperty.measuringTapeTipPositionProperty,
      viewProperty.isElectricPotentialSensorVisibleProperty,
      viewProperty.isMeasuringTapeVisibleProperty,
      modelViewTransform,
      viewProperty.availableModelBoundsProperty
    );

    // Create the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        //TODO: reset everything but the availableModelBoundsProperty
        viewProperty.reset();
      }
    } );


    // Create a draggable but dragBound Measuring Tape
    var tapeOptions = {
      dragBounds: viewProperty.availableModelBoundsProperty.value,
      modelViewTransform: modelViewTransform,
      basePositionProperty: viewProperty.measuringTapeBasePositionProperty,
      tipPositionProperty: viewProperty.measuringTapeTipPositionProperty
    };

    // Create a measuring tape
    var measuringTape = new MeasuringTape( viewProperty.measuringTapeUnitsProperty, viewProperty.isMeasuringTapeVisibleProperty,
      tapeOptions );

    viewProperty.availableModelBoundsProperty.link( function( bounds ) {
      measuringTape.dragBounds = bounds;
    } );

    ChargesAndFieldsColors.link( 'measuringTapeText', function( color ) {
      measuringTape.textColor = color;
    } );


    // Create the layer where the charged Particles and electric Field Sensors will be placed.
    var draggableElementsLayer = new Node( { layerSplit: true } ); // Force the moving charged Particles and electric Field Sensors into a separate layer for performance reasons.

    // Create the charge and sensor enclosure

    var chargeAndSensorEnclosure = new ChargeAndSensorEnclosure(
      model.addUserCreatedModelElementToObservableArray.bind( model ),
      model.chargedParticles,
      model.electricFieldSensors,
      model.chargeAndSensorEnclosureBounds,
      modelViewTransform,
      viewProperty.availableModelBoundsProperty );

    // Handle the comings and goings of charged particles.
    model.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {
      // Create and add the view representation for this chargedParticle.
      var chargedParticleNode = new ChargedParticleNode(
        addedChargedParticle,
        modelViewTransform,
        viewProperty.availableModelBoundsProperty );
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

    // Handle the comings and goings of charged particles.
    model.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {
      // Create and add the view representation for this electric Field Sensor
      var electricFieldSensorNode = new ElectricFieldSensorNode(
        addedElectricFieldSensor,
        model.addElectricFieldLine.bind( model ),
        modelViewTransform,
        viewProperty.availableModelBoundsProperty,
        viewProperty.isValuesVisibleProperty );
      draggableElementsLayer.addChild( electricFieldSensorNode );

      // Add the removal listener for if and when this chargedParticle is removed from the model.
      model.electricFieldSensors.addItemRemovedListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          electricFieldSensorNode.dispose();
          draggableElementsLayer.removeChild( electricFieldSensorNode );
          model.electricFieldSensors.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // layout the objects
    controlPanel.right = this.layoutBounds.maxX - 30;
    controlPanel.top = 30;
    toolbox.right = controlPanel.right;
    toolbox.top = controlPanel.bottom + 10;
    gridNode.centerX = this.layoutBounds.centerX;
    gridNode.top = modelViewTransform.modelToViewY( model.enlargedBounds.maxY );
    resetAllButton.right = this.layoutBounds.maxX - 30;
    resetAllButton.bottom = this.layoutBounds.maxY - 20;

    // listens to the userControlled property of the electric potential sensor
    // return the electric Potential sensor to the toolbox if not user Controlled and over the toolbox panel
    model.electricPotentialSensor.userControlledProperty.link( function( userControlled ) {
      if ( !userControlled && toolbox.bounds.containsPoint( modelViewTransform.modelToViewPosition( model.electricPotentialSensor.position ) ) ) {
        viewProperty.isElectricPotentialSensorVisibleProperty.set( false );
      }
    } );

    // listens to the userControlled property of the measuring tape
    // return the measuring tape to the toolbox if not user Controlled and its position is over the toolbox panel
    measuringTape.isBaseUserControlledProperty.link( function( userControlled ) {
      if ( !userControlled && toolbox.bounds.containsPoint( modelViewTransform.modelToViewPosition( viewProperty.measuringTapeBasePositionProperty.value ) ) ) {
        viewProperty.isMeasuringTapeVisibleProperty.set( false );
      }
    } );

    // if in debug mode
    if ( IS_DEBUG ) {
      this.addChild( new RectangularPushButton( {
          listener: function() {
            model.addManyEquipotentialLines( 20 );
          },
          baseColor: 'rgb( 0, 222, 120 )',
          minWidth: 20,
          minHeight: 20,
          centerX: resetAllButton.centerX,
          centerY: resetAllButton.centerY - 40
        }
      ) );

      this.addChild( new RectangularPushButton( {
          listener: function() {
            model.addManyElectricFieldLines( 20 );
          },
          baseColor: 'rgb( 204, 122, 24  )',
          minWidth: 20,
          minHeight: 20,
          centerX: resetAllButton.centerX,
          centerY: resetAllButton.centerY - 70
        }
      ) );
    }

    this.addChild( electricPotentialGridNode ); // it is the bottom of the z-order
    this.addChild( gridNode ); //
    this.addChild( electricFieldGridNode );
    this.addChild( electricFieldLineNode );
    this.addChild( equipotentialLineNode );
    this.addChild( controlPanel );
    this.addChild( resetAllButton );
    this.addChild( chargeAndSensorEnclosure );
    this.addChild( toolbox );
    this.addChild( draggableElementsLayer );
    this.addChild( electricPotentialSensorNode );
    this.addChild( measuringTape );

  }

  return inherit( ScreenView, ChargesAndFieldsScreenView, {

    /**
     * Function that returns a color string for a given value of the electricPotential.
     * The interpolation scheme is somewhat unusual in the sense that it is performed via a piecewise function
     * which relies on three colors and three electric potential anchors. It is essentially two linear interpolation
     * functions put end to end so that the entire domain is covered.
     *
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
     *
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
    // Layout the EnergySkateParkBasicsScreenView,

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
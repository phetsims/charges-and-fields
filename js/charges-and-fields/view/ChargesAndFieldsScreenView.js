// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main screen View of the Charges and Fields simulation
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import DotUtils from '../../../../dot/js/Utils.js'; // eslint-disable-line default-import-match-filename
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import platform from '../../../../phet-core/js/platform.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Text, Utils } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargedParticleNode from './ChargedParticleNode.js';
import ChargesAndFieldsControlPanel from './ChargesAndFieldsControlPanel.js';
import ChargesAndFieldsMeasuringTapeNode from './ChargesAndFieldsMeasuringTapeNode.js';
import ChargesAndFieldsToolboxPanel from './ChargesAndFieldsToolboxPanel.js';
import ChargesAndSensorsPanel from './ChargesAndSensorsPanel.js';
import ElectricFieldCanvasNode from './ElectricFieldCanvasNode.js';
import ElectricFieldSensorNode from './ElectricFieldSensorNode.js';
import ElectricPotentialCanvasNode from './ElectricPotentialCanvasNode.js';
import ElectricPotentialLinesNode from './ElectricPotentialLinesNode.js';
import ElectricPotentialMobileWebGLNode from './ElectricPotentialMobileWebGLNode.js';
import ElectricPotentialSensorNode from './ElectricPotentialSensorNode.js';
import ElectricPotentialWebGLNode from './ElectricPotentialWebGLNode.js';
import GridNode from './GridNode.js';

// constants
const linear = DotUtils.linear;
const MAX_ELECTRIC_POTENTIAL = 40; // electric potential (in volts) at which color will saturate to colorMax
const MIN_ELECTRIC_POTENTIAL = -40; // electric potential at which color will saturate to minColor

// True (final arg) clamps the linear interpolation function
const ELECTRIC_FIELD_LINEAR_FUNCTION = new LinearFunction( 0, ChargesAndFieldsConstants.EFIELD_COLOR_SAT_MAGNITUDE, 0, 1, true );
const ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION = new LinearFunction( MIN_ELECTRIC_POTENTIAL, 0, 0, 1, true );
const ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION = new LinearFunction( 0, MAX_ELECTRIC_POTENTIAL, 0, 1, true );

const IS_DEBUG_MODE = phet.chipper.queryParameters.dev; // debug mode that displays a push button capable of adding multiple electric potential lines

/**
 * Determine whether a node is visible in the display, it must be a child and visible.
 * @param {Node} node
 * @returns {boolean}
 */
const isDisplayed = node => {
  const trail = node.getUniqueTrail();
  return trail.isVisible() && trail.rootNode() === phet.joist.display.rootNode;
};

class ChargesAndFieldsScreenView extends ScreenView {

  /**
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    // Create a property that registers the model bounds based on the screen size
    // the availableModelBounds should not be reset when the resetAllButton is pressed,
    this.availableModelBoundsProperty = new Property( model.enlargedBounds, {
      tandem: tandem.createTandem( 'availableModelBoundsProperty' ),
      phetioValueType: Bounds2.Bounds2IO,
      phetioDocumentation: 'Registers the model bounds based on the screen size'
    } );

    // The origin of the model is set to the middle of the dev bounds. There are 8 meters across the width of the dev bounds.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.width / 2, this.layoutBounds.height / 2 ),
      this.layoutBounds.width / ChargesAndFieldsConstants.WIDTH );

    // convenience variables
    this.modelViewTransform = modelViewTransform;
    this.model = model;

    // The mobile WebGL implementation will work with basic WebGL support
    const allowMobileWebGL = Utils.checkWebGLSupport() && phet.chipper.queryParameters.webgl;

    // The unlimited-particle implementation will work only with OES_texture_float where writing to
    // float textures is supported.
    const allowWebGL = allowMobileWebGL && Utils.checkWebGLSupport( [ 'OES_texture_float' ] ) &&
                       ElectricPotentialWebGLNode.supportsRenderingToFloatTexture();

    let electricPotentialGridNode = null;

    // Create the electric Potential grid node that displays an array of contiguous rectangles of changing colors
    // Don't trust Safari's OES_texture_float support currently!
    if ( allowWebGL && !platform.safari ) {
      electricPotentialGridNode = new ElectricPotentialWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialVisibleProperty
      );
    }
    else if ( allowMobileWebGL ) {
      electricPotentialGridNode = new ElectricPotentialMobileWebGLNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.isElectricPotentialVisibleProperty
      );
    }
    else {
      electricPotentialGridNode = new ElectricPotentialCanvasNode(
        model.activeChargedParticles,
        modelViewTransform,
        model.enlargedBounds,
        model.isElectricPotentialVisibleProperty
      );
    }

    // Create a grid of electric field arrow sensors
    const electricFieldGridNode = new ElectricFieldCanvasNode(
      model.activeChargedParticles,
      modelViewTransform,
      model.enlargedBounds,
      model.isElectricFieldDirectionOnlyProperty,
      model.isElectricFieldVisibleProperty );

    // Create the scenery node responsible for drawing the electricPotential lines
    const electricPotentialLinesNode = new ElectricPotentialLinesNode(
      model.electricPotentialLineGroup,
      modelViewTransform,
      model.areValuesVisibleProperty,
      tandem.createTandem( 'electricPotentialLinesNode' ) );

    // function({Property.<Vector2>}) to be called at the end of drag event
    const snapToGridLines = model.snapToGridLines.bind( model );

    // Create the draggable electric potential sensor node with a electric potential readout
    const electricPotentialSensorNode = new ElectricPotentialSensorNode(
      model,
      snapToGridLines,
      this.getElectricPotentialColor.bind( this ),
      modelViewTransform,
      this.availableModelBoundsProperty,
      tandem.createTandem( 'electricPotentialSensorNode' )
    );

    // Create a visual grid with major and minor lines on the view
    const gridNode = new GridNode(
      modelViewTransform,
      new Property( model.enlargedBounds ),
      model.isGridVisibleProperty,
      model.areValuesVisibleProperty,
      tandem.createTandem( 'gridNode' ) );

    // Create the electric control panel on the upper right hand side
    const controlPanel = new ChargesAndFieldsControlPanel( model, tandem.createTandem( 'controlPanel' ) );

    // Create the Reset All Button in the bottom right, which resets the model
    const resetAllButton = new ResetAllButton( {

      // do not reset the availableDragBoundsProperty
      listener: () => model.reset(),
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // Create a measuring tape (set to invisible initially)
    const measuringTapeNode = new ChargesAndFieldsMeasuringTapeNode( model.measuringTape,
      snapToGridLines,
      modelViewTransform,
      this.availableModelBoundsProperty,
      tandem.createTandem( 'measuringTapeNode' ) );

    // The color of measurement text of the measuring tape updates itself when the projector/default color scheme changes
    ChargesAndFieldsColors.measuringTapeTextProperty.linkAttribute( measuringTapeNode, 'textColor' );

    // Create the toolboxPanel with the measuring tape and the electric potential sensor icons
    const toolboxPanel = new ChargesAndFieldsToolboxPanel(
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
    const draggableElementsLayer = new Node( { layerSplit: true, preventFit: true } );

    // webGL devices that do not have full WebGL support can only have a finite number of charges on board
    const isNumberChargesLimited = allowMobileWebGL && !( allowWebGL );

    const numberChargesLimit = ( isNumberChargesLimited ) ?
                               ElectricPotentialMobileWebGLNode.getNumberOfParticlesSupported() :
                               Number.POSITIVE_INFINITY;

    const canAddMoreChargedParticlesProperty = new BooleanProperty( false );
    const updateCanAddMoreChargedParticlesProperty = () => {
      canAddMoreChargedParticlesProperty.value = model.chargedParticleGroup.count < numberChargesLimit;
    };
    updateCanAddMoreChargedParticlesProperty();
    model.chargedParticleGroup.elementCreatedEmitter.addListener( updateCanAddMoreChargedParticlesProperty );
    model.chargedParticleGroup.elementDisposedEmitter.addListener( updateCanAddMoreChargedParticlesProperty );

    // Create the charge and sensor enclosure, will be displayed at the bottom of the screen
    const chargesAndSensorsPanel = new ChargesAndSensorsPanel(
      model, this,
      ( modelElement, event ) => {

        // Horrible horrible hacks
        draggableElementsLayer.children.forEach( potentialView => {
          if ( potentialView.modelElement === modelElement ) {
            potentialView.dragListener.press( event, potentialView );
          }
        } );
      },
      canAddMoreChargedParticlesProperty, modelViewTransform, tandem.createTandem( 'chargesAndSensorsPanel' ) );

    model.isChargesAndSensorsPanelDisplayed = () => {
      const trail = chargesAndSensorsPanel.getUniqueTrail();
      return trail.isVisible() && trail.rootNode() === phet.joist.display.rootNode;
    };

    const updateSensorPanelLayout = () => {
      chargesAndSensorsPanel.bottom = this.layoutBounds.bottom - 15;
      chargesAndSensorsPanel.centerX = this.layoutBounds.centerX;

      model.chargesAndSensorsEnclosureBoundsProperty.set( modelViewTransform.viewToModelBounds( chargesAndSensorsPanel.bounds ) );
    };

    chargesAndSensorsPanel.localBoundsProperty.lazyLink( updateSensorPanelLayout );
    updateSensorPanelLayout();

    // Only show the ChargesAndSensorsPanel when at least one of its elements is visible
    new DerivedProperty( [
      model.allowNewPositiveChargesProperty,
      model.allowNewNegativeChargesProperty,
      model.allowNewElectricFieldSensorsProperty
    ], ( positive, negative, electricFieldSensorGroup ) => positive || negative || electricFieldSensorGroup )
      .linkAttribute( chargesAndSensorsPanel, 'visible' );

    // Handle the comings and goings of charged particles.
    model.chargedParticleGroup.elementCreatedEmitter.addListener( addedChargedParticle => {

      // Create and add the view representation for this chargedParticle.
      const chargedParticleNode = chargedParticleNodeGroup.createCorrespondingGroupElement(
        addedChargedParticle.tandem.name, addedChargedParticle );

      draggableElementsLayer.addChild( chargedParticleNode );

      addedChargedParticle.disposeEmitter.addListener( function callback() {
        addedChargedParticle.disposeEmitter.removeListener( callback );
        draggableElementsLayer.removeChild( chargedParticleNode );
        chargedParticleNodeGroup.disposeElement( chargedParticleNode );
      } );
    } );

    const chargedParticleNodeGroup = new PhetioGroup( ( tandem, chargedParticle ) => {
      return new ChargedParticleNode(
        chargedParticle,
        snapToGridLines,
        modelViewTransform,
        this.availableModelBoundsProperty,
        model.chargesAndSensorsEnclosureBoundsProperty.get(),
        tandem
      );
    }, () => [ model.chargedParticleGroup.archetype ], {
      tandem: tandem.createTandem( 'chargedParticleNodeGroup' ),
      phetioType: PhetioGroup.PhetioGroupIO( Node.NodeIO ),

      // These elements are not created by the PhET-IO state engine, they can just listen to the model for supporting
      // state in the same way they do for sim logic.
      supportsDynamicState: false
    } );

    const electricFieldSensorNodeGroup = new PhetioGroup( ( tandem, electricFieldSensor ) => {

      // Create and add the view representation for this electric Field Sensor
      const electricFieldSensorNode = new ElectricFieldSensorNode(
        electricFieldSensor,
        snapToGridLines,
        modelViewTransform,
        this.availableModelBoundsProperty,
        model.isPlayAreaChargedProperty,
        model.areValuesVisibleProperty,
        model.chargesAndSensorsEnclosureBoundsProperty.get(),
        tandem
      );

      return electricFieldSensorNode;
    }, () => [ model.electricFieldSensorGroup.archetype ], {
      tandem: tandem.createTandem( 'electricFieldSensorNodeGroup' ),
      phetioType: PhetioGroup.PhetioGroupIO( Node.NodeIO ),

      // These elements are not created by the PhET-IO state engine, they can just listen to the model for supporting
      // state in the same way they do for sim logic.
      supportsDynamicState: false
    } );

    // Handle the comings and goings of charged electric field sensors.
    model.electricFieldSensorGroup.elementCreatedEmitter.addListener( addedElectricFieldSensor => {
      const electricFieldSensorNode = electricFieldSensorNodeGroup.createCorrespondingGroupElement(
        addedElectricFieldSensor.tandem.name, addedElectricFieldSensor );

      draggableElementsLayer.addChild( electricFieldSensorNode );

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.electricFieldSensorGroup.elementDisposedEmitter.addListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          electricFieldSensorNodeGroup.disposeElement( electricFieldSensorNode );
          model.electricFieldSensorGroup.elementDisposedEmitter.removeListener( removalListener );
        }
      } );
    } );

    // listens to the isUserControlled property of the electric potential sensor
    // return the electric Potential sensor to the toolboxPanel if it is not user Controlled and the
    // position of the sensor is inside the toolboxPanel panel
    electricPotentialSensorNode.isUserControlledProperty.link( isUserControlled => {
      if ( !isUserControlled && toolboxPanel.bounds.intersectsBounds( electricPotentialSensorNode.bounds.eroded( 5 ) ) && isDisplayed( toolboxPanel ) ) {
        model.electricPotentialSensor.isActiveProperty.set( false );
      }
    } );

    // listens to the isUserControlled property of the measuring tape
    // return the measuring tape to the toolboxPanel if not user Controlled and its position is located within the
    // toolbox panel
    measuringTapeNode.isBaseUserControlledProperty.link( isBaseUserControlled => {
      const tapeBaseBounds = measuringTapeNode.localToParentBounds( measuringTapeNode.getLocalBaseBounds() );
      if ( !isBaseUserControlled && toolboxPanel.bounds.intersectsBounds( tapeBaseBounds.eroded( 5 ) ) && isDisplayed( toolboxPanel ) ) {
        model.measuringTape.isActiveProperty.set( false );
      }
    } );

    // dynamic parts of the control layout
    const updateControlLayout = () => {

      // right-align control panels
      const right = modelViewTransform.modelToViewX( this.availableModelBoundsProperty.get().right ) - 10;
      controlPanel.right = right;
      resetAllButton.right = right;
      toolboxPanel.right = right;

      // toolbox panel below the control panel
      toolboxPanel.top = controlPanel.bottom + 10;
    };

    // link the available model bounds
    this.availableModelBoundsProperty.link( bounds => {

      // the measuring Tape is subject to dragBounds (specified in model coordinates)
      measuringTapeNode.setDragBounds( bounds );

      updateControlLayout();
    } );
    updateControlLayout();

    controlPanel.localBoundsProperty.lazyLink( updateControlLayout );

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
        listener: () => model.addManyElectricPotentialLines( 20 ),
        baseColor: 'rgb( 0, 222, 120 )',
        top: this.layoutBounds.top,
        left: this.layoutBounds.left,
        content: new Text( 'add some potential lines' ),
        tandem: tandem.createTandem( 'debugButton' )
      } ) );

      const charge1 = model.chargedParticleGroup.createNextElement( 1, new Vector2( 0, -1.5 ) );
      const charge2 = model.chargedParticleGroup.createNextElement( -1, new Vector2( 0, -1.5 ) );
      charge1.isActiveProperty.set( true );
      charge2.isActiveProperty.set( true );
      charge1.positionProperty.set( new Vector2( 2, 2 ) );
      charge2.positionProperty.set( new Vector2( 0, 1 ) );

      model.isPlayAreaChargedProperty.set( true ); // set isPlayAreaCharged to true since there are charges
    }
  }


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
  getElectricPotentialColor( electricPotential, options ) {

    let finalColor; // {string} e.g. 'rgba(0,0,0,1)'
    let distance; // {number}  between 0 and 1

    // for positive electric potential
    if ( electricPotential > 0 ) {

      // clamped linear interpolation function, output lies between 0 and 1;
      distance = ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION.evaluate( electricPotential );
      finalColor = this.interpolateRGBA(
        // {Color} color that corresponds to the Electric Potential being zero
        ChargesAndFieldsColors.electricPotentialGridZeroProperty.get(),
        // {Color} color of Max Electric Potential
        ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get(),
        distance, // {number} distance must be between 0 and 1
        options );
    }
    // for negative (or zero) electric potential
    else {

      // clamped linear interpolation function, output lies between 0 and 1
      distance = ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION.evaluate( electricPotential );
      finalColor = this.interpolateRGBA(
        // {Color} color that corresponds to the lowest (i.e. negative) Electric Potential
        ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get(),
        // {Color} color that corresponds to the Electric Potential being zero zero
        ChargesAndFieldsColors.electricPotentialGridZeroProperty.get(),
        distance, // {number} distance must be between 0 and 1
        options );
    }
    return finalColor;
  }

  /**
   * Function that returns a color that is proportional to the magnitude of the electric Field.
   * The color interpolates between ChargesAndFieldsColors.electricFieldGridZero (for an
   * electric field value of zero) and ChargesAndFieldsColors.electricFieldGridSaturation (which corresponds to an
   * electric field value of EFIELD_COLOR_SAT_MAGNITUDE).
   * @private
   * @param {number} electricFieldMagnitude - a non negative number
   * @param {Object} [options] - useful to set transparency
   * @returns {string} color - e.g. 'rgba(255, 255, 255, 1)'
   *
   */
  getElectricFieldMagnitudeColor( electricFieldMagnitude, options ) {

    // ELECTRIC_FIELD_LINEAR_FUNCTION is a clamped linear function
    const distance = ELECTRIC_FIELD_LINEAR_FUNCTION.evaluate( electricFieldMagnitude ); // a value between 0 and 1

    return this.interpolateRGBA(
      ChargesAndFieldsColors.electricFieldGridZeroProperty.get(), // {Color} color that corresponds to zero electric Field
      ChargesAndFieldsColors.electricFieldGridSaturationProperty.get(), // {Color} color that corresponds to the largest electric field
      distance, // {number} distance must be between 0 and 1
      options );
  }

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
  interpolateRGBA( color1, color2, distance, options ) {
    options = merge( {
      // defaults
      transparency: 1
    }, options );

    if ( distance < 0 || distance > 1 ) {
      throw new Error( `distance must be between 0 and 1: ${distance}` );
    }
    const r = Math.floor( linear( 0, 1, color1.r, color2.r, distance ) );
    const g = Math.floor( linear( 0, 1, color1.g, color2.g, distance ) );
    const b = Math.floor( linear( 0, 1, color1.b, color2.b, distance ) );
    return `rgba(${r},${g},${b},${options.transparency})`;
  }

  /**
   * Function responsible for the layout of the ScreenView.
   * It overrides the layout strategy in ScreenView.js
   * It scales the scene graph up and down with
   * the size of the screen to ensure a minimally visible area,
   * but keeping it centered at the bottom of the screen.
   * @public
   * @param {Bounds2} viewBounds
   */
  layout( viewBounds ) {

    this.resetTransform();

    const scale = this.getLayoutScale( viewBounds ); // {number}
    this.setScaleMagnitude( scale );

    const width = viewBounds.width;
    const height = viewBounds.height;

    let offsetX = 0;
    let offsetY = 0;

    // Move to bottom vertically
    if ( scale === width / this.layoutBounds.width ) {
      offsetY = ( height / scale - this.layoutBounds.height );
    }

    // center horizontally
    else if ( scale === height / this.layoutBounds.height ) {
      offsetX = ( width / scale - this.layoutBounds.width ) / 2;
    }
    this.translate( offsetX + viewBounds.left / scale, offsetY + viewBounds.top / scale );

    const nominalViewBounds = new Rectangle( -offsetX, -offsetY, width / scale, height / scale );

    // the modelBounds are the nominal viewBounds (in model coordinates) or the model.enlargedBounds, whichever is smaller.
    this.availableModelBoundsProperty.set( this.modelViewTransform.viewToModelBounds( nominalViewBounds ).intersection( this.model.enlargedBounds ) );
  }
}

chargesAndFields.register( 'ChargesAndFieldsScreenView', ChargesAndFieldsScreenView );
export default ChargesAndFieldsScreenView;

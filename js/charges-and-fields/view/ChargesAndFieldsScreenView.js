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
  //var ChargesAndFieldsConstants = require('CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants');
  var ChargeAndSensorEnclosure = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargeAndSensorEnclosure' );
  var ChargedParticleNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargedParticleNode' );
  var ControlPanel = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ControlPanel' );
  var ElectricFieldSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldSensorNode' );
  var ElectricPotentialSensorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialSensorNode' );
  var ElectricPotentialFieldNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldNode' );
  //var ElectricPotentialFieldWebGLNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialFieldWebGLNode' );
  var ElectricFieldGridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldGridNode' );
  var EquipotentialLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EquipotentialLineNode' );
  var ElectricFieldLineNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricFieldLineNode' );
  var GridNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GridNode' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MeasuringTape = require( 'SCENERY_PHET/MeasuringTape' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Util = require( 'SCENERY/util/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var mockup01Image = require( 'image!CHARGES_AND_FIELDS/mockup01.png' );
  var mockup02Image = require( 'image!CHARGES_AND_FIELDS/mockup02.png' );

  /**
   *
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @constructor
   */
  function ChargesAndFieldsScreenView( model ) {

    ScreenView.call( this, {renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 1024, 618 )} );

    // The origin of the model is sets in the middle of the scree. There are 5 meters across the height of the sim.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.width / 2, this.layoutBounds.height / 2 ),
      this.layoutBounds.height / 5 );

    // Check to see if WebGL was prevented by a query parameter
    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;
    var renderer = webGLSupported ? 'webgl' : 'svg';
    if ( renderer ) {
    } // make lint happy

    //var electricPotentialFieldNode = (renderer === 'webgl') ? new ElectricPotentialFieldNode(model.electricPotentialGrid, model.getColorElectricPotential.bind(model), modelViewTransform, model.showResolutionProperty) :
    //    new ElectricPotentialFieldNode(model.electricPotentialGrid, model.getColorElectricPotential.bind(model), modelViewTransform, model.showResolutionProperty);

    // Create the electric Potential field node that displays an array of contiguous rectangles of changing colors
    var electricPotentialFieldNode = new ElectricPotentialFieldNode(
      model.electricPotentialGrid,
      model.getColorElectricPotential.bind( model ),
      modelViewTransform,
      model.voltageIsVisibleProperty );

    // Create a grid of electric field arrow sensors
    var electricFieldGridNode = new ElectricFieldGridNode(
      model.electricFieldSensorGrid,
      model.getColorElectricFieldMagnitude.bind( model ),
      modelViewTransform,
      model.eFieldIsVisibleProperty );

    // Create the scenery node responsible for drawing the equipotential lines
    var equipotentialLineNode = new EquipotentialLineNode(
      model.equipotentialLinesArray,
      modelViewTransform,
      model.valuesIsVisibleProperty );

    // Create the scenery node responsible for drawing the electric field lines
    var electricFieldLineNode = new ElectricFieldLineNode(
      model.electricFieldLinesArray,
      model.clearElectricFieldLines.bind( model ),
      modelViewTransform );

    // Create the draggable electric potential sensor node with a electric potential readout
    var electricPotentialSensorNode = new ElectricPotentialSensorNode(
      model.electricPotentialSensor,
      model.getColorElectricPotential.bind( model ),
      model.clearEquipotentialLines.bind( model ),
      model.addElectricPotentialLine.bind( model ),
      modelViewTransform
    );

    // Create the electric Field sensors
    var parentElectricFieldSensorsNode = new Node();
    model.electricFieldSensors.forEach( function( electricFieldSensor ) {
      parentElectricFieldSensorsNode.addChild( new ElectricFieldSensorNode(
        electricFieldSensor,
        modelViewTransform,
        model.valuesIsVisibleProperty ) );
    } );

    // Create a visual grid with major and minor lines on the view
    var gridNode = new GridNode( modelViewTransform, model.gridIsVisibleProperty );

    // Create a draggable but dragBound Measuring Tape
    var tape_options = {
      dragBounds: this.layoutBounds.eroded( 5 ),
      modelViewTransform: modelViewTransform
    };
    var measuringTape = new MeasuringTape( model.tapeMeasureUnitsProperty, model.tapeMeasureIsVisibleProperty,
      tape_options );

    // TODO: doesn't work: find fix
    ChargesAndFieldsColors.link( 'measuringTapeText', function( color ) {
      measuringTape.textColor = color;
    } );

    // Create the electric control panel on the upper right hand side
    var controlPanel = new ControlPanel( model.eFieldIsVisibleProperty, model.directionOnlyIsVisibleProperty,
      model.voltageIsVisibleProperty, model.valuesIsVisibleProperty, model.gridIsVisibleProperty, model.tapeMeasureIsVisibleProperty );

    // Create the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        measuringTape.reset();
      },
      right:  this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );


    // Create the nodes that will be used to layer things visually.
    var backLayer = new Node();

    // Create the layer where the charged Particles will be placed.
    var chargedParticlesLayer = new Node( {layerSplit: true} ); // Force the moving charged Particles into a separate layer for performance reasons.

    // Create and add the charge and sensor enclosure (including the charges and sensors)
    var chargeAndSensorEnclosure = new ChargeAndSensorEnclosure( model, model.chargeAndSensorEnclosureBounds, modelViewTransform );
    backLayer.addChild( chargeAndSensorEnclosure );

    // Handle the comings and goings of charged particles.
    model.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {
      // Create and add the view representation for this chargedParticle.
      var chargedParticleNode = new ChargedParticleNode( addedChargedParticle, modelViewTransform );
      chargedParticlesLayer.addChild( chargedParticleNode );

      // Add the removal listener for if and when this chargedParticle is removed from the model.
      model.chargedParticles.addItemRemovedListener( function removalListener( removedChargedParticle ) {
        if ( removedChargedParticle === addedChargedParticle ) {
          chargedParticlesLayer.removeChild( chargedParticleNode );
          model.chargedParticles.removeItemRemovedListener( removalListener );
        }
      } );
    } );


    // Handle the comings and goings of charged particles.
    model.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {
      // Create and add the view representation for this electric Field Sensor
      var electricFieldSensorNode = new ElectricFieldSensorNode( addedElectricFieldSensor, modelViewTransform, model.valuesIsVisibleProperty );
      chargedParticlesLayer.addChild( electricFieldSensorNode );

      // Add the removal listener for if and when this chargedParticle is removed from the model.
      model.electricFieldSensors.addItemRemovedListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          chargedParticlesLayer.removeChild( electricFieldSensorNode );
          model.electricFieldSensors.removeItemRemovedListener( removalListener );
        }
      } );
    } );


    // layout the objects
    controlPanel.right = this.layoutBounds.maxX - 20;
    controlPanel.top = 20;
    gridNode.centerX = this.layoutBounds.centerX;
    gridNode.centerY = this.layoutBounds.centerY;

    this.addChild( electricPotentialFieldNode );
    this.addChild( gridNode );
    this.addChild( electricFieldGridNode );
    this.addChild( equipotentialLineNode );
    this.addChild( electricFieldLineNode );
    this.addChild( measuringTape );
    this.addChild( resetAllButton );
    this.addChild( backLayer );
    this.addChild( controlPanel );
    this.addChild( electricPotentialSensorNode );
    this.addChild( parentElectricFieldSensorsNode );
    this.addChild( chargedParticlesLayer );

    //TODO: Delete when done with the layout
    ////////////////////////////////////////////////////////////////
    //Show the mock-up and a slider to change its transparency
    //////////////////////////////////////////////////////////////
    var mockup01OpacityProperty = new Property( 0.02 );
    var mockup02OpacityProperty = new Property( 0.02 );

    var image01 = new Image( mockup01Image, {pickable: false} );
    var image02 = new Image( mockup02Image, {pickable: false} );

    image01.scale( this.layoutBounds.height / image01.height );
    image02.scale( this.layoutBounds.height / image02.height );

    mockup01OpacityProperty.linkAttribute( image01, 'opacity' );
    mockup02OpacityProperty.linkAttribute( image02, 'opacity' );
    this.addChild( image01 );
    this.addChild( image02 );

    this.addChild( new HSlider( mockup02OpacityProperty, {min: 0, max: 1}, {top: 200, left: 20} ) );
    this.addChild( new HSlider( mockup01OpacityProperty, {min: 0, max: 1}, {top: 300, left: 20} ) );
    /////////////////////////////////////////////////////////////////////////

  }

  return inherit( ScreenView, ChargesAndFieldsScreenView );
} );
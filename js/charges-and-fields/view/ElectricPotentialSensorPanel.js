// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node depicting a sensor panel that can generate or delete electric potential field lines.
 * The sensor has a readout of the electric potential at a given position.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  //var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  //var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  //strings
  var equipotentialString = require( 'string!CHARGES_AND_FIELDS/equipotential' );

  /**
   *
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @param {Object} [options] scenery options for rendering the control panel, see the constructor for options.
   * @constructor
   */
  function ElectricPotentialSensorPanel( model, options ) {

    // Demonstrate a common pattern for specifying options and providing default values.
    options = _.extend( {
        xMargin: 10,
        yMargin: 10,
        stroke: 'grey',
        fill: 'blue',
        lineWidth: 6,
        backgroundPickable: true
      },
      options );

    //var plotElectricFieldLineButton = new TextPushButton( 'Plot E', {
    //  font: new PhetFont( 16 ),
    //  baseColor: 'orange',
    //  xMargin: 10,
    //  listener: function() {
    //    model.addElectricFieldLine();
    //    //     model.addManyLine();
    //  }
    //} );

    // create the button that allows the board to be cleared of all lines.
    var clearButton = new EraserButton( {
      baseColor: 'white',
      iconWidth: 26, // width of eraser icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        model.clearEquipotentialLines = true;
        model.clearElectricFieldLines = true;
      }
    } );

    // create the button that allows to plot the ElectricPotential Lines
    var plotElectricPotentialLineButton = new EraserButton( {
      baseColor: 'white',
      iconWidth: 26, // width of eraser icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        model.addElectricPotentialLine();
      }
    } );

    var equipotential = new Text( equipotentialString, {
      font: new PhetFont( 12 ),
      fill: 'white'
    } );

    // TODO find a more robust way to set the textPanel content Width
    this.voltageReading = new Text( '0.0000', {
      font: new PhetFont( 14 ),
      fill: 'black',
      xMargin: 10
    } );

    var textPanel = new Panel( this.voltageReading, {
      fill: 'white',
      stroke: 'black',
      cornerRadius: 5,
      resize: false
    } );

    // The clear and plot buttons
    var buttons = new HBox( {
      align: 'center',
      spacing: 20,
      children: [clearButton, plotElectricPotentialLineButton],
      pickable: true
    } );

    // The contents of the control panel
    var content = new VBox( {
      align: 'center',
      spacing: 10,
      children: [equipotential, textPanel, //plotElectricFieldLineButton,
        buttons],
      pickable: true
    } );

    Panel.call( this, content, options );
  }

  return inherit( Panel, ElectricPotentialSensorPanel );
} );

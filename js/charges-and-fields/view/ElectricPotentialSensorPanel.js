// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node depicting a sensor panel that can generate or delete an electric potential field lines.
 * The sensor has a readout of the electric potential at a given position.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var EraserButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EraserButton' );
  //var EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PencilButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/PencilButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  // tools for drawing
  //var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  //var Node = require( 'SCENERY/nodes/Node' );
  //var Path = require( 'SCENERY/nodes/Path' );
  //var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  //var Shape = require( 'KITE/Shape' );

  //strings
  var equipotentialString = require( 'string!CHARGES_AND_FIELDS/equipotential' );

  /**
   * @param {Function} clearEquipotentialLines - A function for deleting all electric potential lines in the model
   * @param {Function} addElectricPotentialLine - A function for adding an electric potential line to the model
   * @param {Object} [options] scenery options for rendering the Electric Potential Sensor Panel, see the constructor for options.
   * @constructor
   */
  function ElectricPotentialSensorPanel( clearEquipotentialLines, addElectricPotentialLine, options ) {

    var self = this;
    // Demonstrate a common pattern for specifying options and providing default values.
    options = _.extend( {
        xMargin: 10,
        yMargin: 10,
        lineWidth: 6,
        backgroundPickable: true
      },
      options );


    // Create the button that allows the board to be cleared of all lines.
    var clearButton = new EraserButton( {
      iconWidth: 26, // width of eraser icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        clearEquipotentialLines();
      }
    } );

    // Create the button that allows to plot the ElectricPotential Lines
    var plotElectricPotentialLineButton = new PencilButton( {
      iconWidth: 26, // width of pencil icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        addElectricPotentialLine();
      }
    } );

    var buttonBaseColorFunction = function( color ) {
      clearButton.baseColor = color;
      plotElectricPotentialLineButton.baseColor = color;
    };
    // Link the stroke color for the default/projector mode
    ChargesAndFieldsColors.link( 'buttonBaseColor', buttonBaseColorFunction );

    // Create the text node above the readout
    var equipotentialPanelTitleText = new Text( equipotentialString, {
      font: ChargesAndFieldsConstants.DEFAULT_FONT
    } );

    var equipotentialPanelTitleTextColorFunction = function( color ) {
      equipotentialPanelTitleText.fill = color;
    };
    // Link the stroke color for the default/projector mode
    ChargesAndFieldsColors.link( 'electricPotentialPanelTitleText', equipotentialPanelTitleTextColorFunction );

    // TODO find a more robust way to set the textPanel content Width
    this.voltageReading = new Text( '-0.000 V', {
      font: ChargesAndFieldsConstants.DEFAULT_FONT,
      xMargin: 10
    } );
    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelTextFill', function( color ) {
      self.voltageReading.fill = color;
    } );

    var textPanel = new Panel( this.voltageReading, {
      cornerRadius: 5,
      resize: false
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBorder', function( color ) {
      textPanel.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBackground', function( color ) {
      textPanel.fill = color;
    } );


    // The clear and plot buttons
    var buttons = new HBox( {
      align: 'center',
      spacing: 20,
      children: [ clearButton, plotElectricPotentialLineButton ],
      pickable: true
    } );

    // The contents of the control panel
    var content = new VBox( {
      align: 'center',
      spacing: 10,
      children: [ equipotentialPanelTitleText, textPanel, buttons ],
      pickable: true
    } );

    Panel.call( this, content, options );


    ChargesAndFieldsColors.link( 'electricPotentialSensorBorder', function( color ) {
      self.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorBackgroundFill', function( color ) {
      self.fill = color;
    } );

  }

  return inherit( Panel, ElectricPotentialSensorPanel );
} );

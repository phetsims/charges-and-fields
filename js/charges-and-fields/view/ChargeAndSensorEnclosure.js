// Copyright 2002-2015, University of Colorado Boulder

/**
 * Panel with Check Boxes that control the electrical Properties of the Sim
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // imports
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var UserCreatorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/UserCreatorNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var minusOneNanoCoulombString = require( 'string!CHARGES_AND_FIELDS/minusOneNanoC' );
  var plusOneNanoCoulombString = require( 'string!CHARGES_AND_FIELDS/plusOneNanoC' );
  var sensorsString = require( 'string!CHARGES_AND_FIELDS/sensors' );

  // constants
  //var CIRCLE_RADIUS = ChargesAndFieldsConstants.CHARGE_RADIUS;// radius of charged particles.
  var FONT = ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT;
  var DATA_POINT_CREATOR_OFFSET_POSITIONS = [
    // Offsets used for initial position of point . Empirically determined.
    //new Vector2( (0.8) * CIRCLE_RADIUS, (0.8) * CIRCLE_RADIUS ),
    //new Vector2( (0.8) * CIRCLE_RADIUS, (-0.7) * CIRCLE_RADIUS ),
    //new Vector2( (-0.9) * CIRCLE_RADIUS, (0.8) * CIRCLE_RADIUS ),
    //new Vector2( (-0.6) * CIRCLE_RADIUS, (-0.75) * CIRCLE_RADIUS )
    new Vector2( 0, 0 )
  ];

  /**
   * Enclosure that contains the charges and sensors
   *
   * @param {Function} addUserCreatedModelElementToObservableArray
   * @param {Node} positiveChargedParticleRepresentation - visual representation of a positive charge
   * @param {Node} negativeChargedParticleRepresentation - visual representation of a negative charge
   * @param {Node} electricFieldSensorRepresentation -visual representation of an electric field sensor (doesn't include an arrow or text labels)
   * @param {ObservableArray} chargedParticles - observable array in the model that contains all the charged particles
   * @param {ObservableArray} electricFieldSensors - observable array in the model that contains all the electric field sensors
   * @param {Bounds2} bounds - model bounds of the outer enclosure
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ChargeAndSensorEnclosure( addUserCreatedModelElementToObservableArray,
                                     positiveChargedParticleRepresentation,
                                     negativeChargedParticleRepresentation,
                                     electricFieldSensorRepresentation,
                                     chargedParticles,
                                     electricFieldSensors,
                                     bounds,
                                     modelViewTransform ) {

    Node.call( this );
    var enclosureGroup = this;

    // bounds of the enclosure
    var viewBounds = modelViewTransform.modelToViewBounds( bounds );

    var rectangle = Rectangle.roundedBounds( viewBounds, 5, 5, { lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH } );
    this.addChild( rectangle );

    // TODO: find a layout scheme that will not be broken by translation

    var positiveChargeCenterX = viewBounds.centerX - viewBounds.width / 3;
    var positiveChargeCenterY = viewBounds.centerY - viewBounds.height / 5;
    var negativeChargeCenterX = viewBounds.centerX;
    var negativeChargeCenterY = positiveChargeCenterY;
    var electricFieldSensorCenterX = viewBounds.centerX + viewBounds.width / 3;
    var electricFieldSensorCenterY = positiveChargeCenterY;

    // Add the dataPoint creator nodes.
    DATA_POINT_CREATOR_OFFSET_POSITIONS.forEach( function( offset ) {
      var positiveCharge = new UserCreatorNode(
        addUserCreatedModelElementToObservableArray,
        chargedParticles,
        positiveChargedParticleRepresentation,
        modelViewTransform,
        {
          element: 'positive',
          centerX: positiveChargeCenterX + offset.x,
          centerY: positiveChargeCenterY + offset.y
        } );

      var negativeCharge = new UserCreatorNode(
        addUserCreatedModelElementToObservableArray,
        chargedParticles,
        negativeChargedParticleRepresentation,
        modelViewTransform,
        {
          element: 'negative',
          centerX: negativeChargeCenterX + offset.x,
          centerY: negativeChargeCenterY + offset.y
        } );

      var electricFieldSensor = new UserCreatorNode(
        addUserCreatedModelElementToObservableArray,
        electricFieldSensors,
        electricFieldSensorRepresentation,
        modelViewTransform,
        {
          element: 'electricFieldSensor',
          centerX: electricFieldSensorCenterX + offset.x,
          centerY: electricFieldSensorCenterY + offset.y
        } );

      enclosureGroup.addChild( positiveCharge );
      enclosureGroup.addChild( negativeCharge );
      enclosureGroup.addChild( electricFieldSensor );
    } );

    var textCenterY = viewBounds.centerY + viewBounds.height / 4;

    var positiveChargeText = new Text( plusOneNanoCoulombString, { font: FONT, centerX: positiveChargeCenterX, centerY: textCenterY } );
    var negativeChargeText = new Text( minusOneNanoCoulombString, { font: FONT, centerX: negativeChargeCenterX, centerY: textCenterY } );
    var electricFieldSensorText = new Text( sensorsString, { font: FONT, centerX: electricFieldSensorCenterX, centerY: textCenterY } );

    enclosureGroup.addChild( positiveChargeText );
    enclosureGroup.addChild( negativeChargeText );
    enclosureGroup.addChild( electricFieldSensorText );

    ChargesAndFieldsColors.link( 'enclosureText', function( color ) {
      positiveChargeText.fill = color;
      negativeChargeText.fill = color;
      electricFieldSensorText.fill = color;
    } );

    ChargesAndFieldsColors.link( 'enclosureBorder', function( color ) {
      rectangle.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'enclosureFill', function( color ) {
      rectangle.fill = color;
    } );
  }

  return inherit( Node, ChargeAndSensorEnclosure );

} )
;
// Copyright 2002-2013, University of Colorado Boulder

/**
 * Control panel.
 *
 */
define( function( require ) {
  'use strict';

  // imports

  // var Color = require( 'SCENERY/util/Color' );
//  var Font = require( 'SCENERY/util/Font' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
//  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VerticalCheckBoxGroup = require( 'SUN/VerticalCheckBoxGroup' );

  // strings
  var showEFieldString = require( 'string!CHARGES_AND_FIELDS/showEField' );
//  var showDirectionOnlyString = require( 'string!CHARGES_AND_FIELDS/showDirectionOnly' );
  var showLoResVString = require( 'string!CHARGES_AND_FIELDS/showLoResV' );
//  var showHiResVString = require( 'string!CHARGES_AND_FIELDS/showHiResV' );
  var gridString = require( 'string!CHARGES_AND_FIELDS/grid' );
  var showNumbersString = require( 'string!CHARGES_AND_FIELDS/showNumbers' );
  var tapeMeasureString = require( 'string!CHARGES_AND_FIELDS/tapeMeasure' );
//  var clearAllString = require( 'string!CHARGES_AND_FIELDS/clearAll' );
//  var moreSpeedLessRes = require( 'string!CHARGES_AND_FIELDS/moreSpeedLessRes' );

// constants
  var CHECK_BOX_GROUP_OPTION_FONT = {font: new PhetFont( 14 )};

  /**
   *
   * @param model
   * @constructor
   */
  function ControlPanel( model ) {

    Node.call( this, {x: 5, scale: 0.7} );

    var checkBoxGroup = new VerticalCheckBoxGroup( [
      {
        content: new Text( showEFieldString, CHECK_BOX_GROUP_OPTION_FONT ),
        property: model.eFieldIsVisibleProperty,
        indent: 0
      },
      {
//                content: new Text(showDirectionOnlyString, CHECK_BOX_GROUP_OPTION_FONT),
//                property: model.directionOnlyIsVisibleProperty,
//                indent: 0
//            }, {
//                content:  new Text(showHiResVString, CHECK_BOX_GROUP_OPTION_FONT),
//                property: model.showResolutionProperty,
//                indent: 0
//            }, {
        content: new Text( showLoResVString, CHECK_BOX_GROUP_OPTION_FONT ),
        property: model.showResolutionProperty,
        indent: 0
      },
      {
        content: new Text( gridString, CHECK_BOX_GROUP_OPTION_FONT ),
        property: model.gridIsVisibleProperty,
        indent: 0
      },
      {
        content: new Text( showNumbersString, CHECK_BOX_GROUP_OPTION_FONT ),
        property: model.showNumbersIsVisibleProperty,
        indent: 0
      },
      {
        content: new Text( tapeMeasureString, CHECK_BOX_GROUP_OPTION_FONT ),
        property: model.tapeMeasureIsVisibleProperty,
        indent: 0
      }
    ], {
      centerY: 55
    } );


    var controlPanel = new Panel( new Node( {
      children: [checkBoxGroup]
    } ), {
      fill: '#D9FCC5', xMargin: 10, yMargin: 5
    } );

    this.addChild( controlPanel );
  }

  return inherit( Node, ControlPanel );

} );
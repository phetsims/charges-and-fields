//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Warning displayed when we have to fall back to Canvas
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );

  var titleString = require( 'string!CHARGES_AND_FIELDS/webglWarning.title' );
  var bodyString = require( 'string!CHARGES_AND_FIELDS/webglWarning.body' );

  function CanvasWarningNode() {
    LayoutBox.call( this, _.extend( {
      children: [
        new FontAwesomeNode( 'warning_sign', {
          fill: '#E87600', // "safety orange", according to Wikipedia
          scale: 0.6
        } ),
        new LayoutBox( {
          children: [
            new Text( titleString, {
              font: new PhetFont( 14 ),
              fill: '#ddd'
            } ),
            new Text( bodyString, {
              font: new PhetFont( 10 ),
              fill: '#999'
            } )
          ],
          spacing: 3,
          align: 'left'
        } )
      ],
      orientation: 'horizontal',
      spacing: 12,
      align: 'center',
      cursor: 'pointer'
    } ) );

    this.mouseArea = this.touchArea = this.localBounds;

    this.addInputListener( {
      up: function() {
        var phetWindow = window.open( 'http://phet.colorado.edu/webgl-disabled-page?simLocale=' + ( phet.chipper && phet.chipper.locale ), '_blank' );
        phetWindow.focus();
      }
    } );
  }

  return inherit( LayoutBox, CanvasWarningNode );
} );
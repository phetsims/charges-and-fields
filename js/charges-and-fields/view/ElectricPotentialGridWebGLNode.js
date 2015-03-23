// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the electric potential field
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
    'use strict';

    // modules
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var inherit = require( 'PHET_CORE/inherit' );
    var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
    var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
    var Util = require( 'SCENERY/util/Util' );

    /**
     *
     * @param model
     * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
     * @param {Function} update -  model.on.bind(model)
     * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given an electric potential
     * @param {Property.<Bounds2>} boundsProperty - bounds of the canvas in model units
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isChargedParticlePresentProperty - is there at least one charged particle on the board
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridWebGLNode( model,
                                             electricPotentialSensorGrid,
                                             update,
                                             colorInterpolationFunction,
                                             boundsProperty,
                                             modelViewTransform,
                                             isChargedParticlePresentProperty,
                                             isVisibleProperty ) {
      var self = this;

      this.model = model;
      this.modelViewTransform = modelViewTransform;

      WebGLNode.call( this, {} );

      // update the bounds when needed
      boundsProperty.link( function() {
        self.canvasBounds = boundsProperty.get();
      } );

      ChargesAndFieldsColors.on( 'profileChanged', function() {
        self.invalidatePaint();
      } );

      isVisibleProperty.link( function( isVisible ) {
        self.visible = isVisible;
      } );

      // Queued changes of type { charge: {number}, oldPosition: {Vector2}, newPosition: {Vector2} }
      this.queue = [];

      this.positionListeners = []; // functions to be called back when particle positions change
      model.chargedParticles.addItemAddedListener( this.onParticleAdded.bind( this ) );
      model.chargedParticles.addItemRemovedListener( this.onParticleRemoved.bind( this ) );

      this.invalidatePaint();
    }

    return inherit( WebGLNode, ElectricPotentialGridWebGLNode, {
      onParticleAdded: function( particle ) {
        this.queue.push( {
          charge: particle.charge,
          oldPosition: null,
          newPosition: particle.position.copy()
        } );
        console.log( 'add ' + particle.charge + ' ' + particle.position.toString() );

        // add the position listener
        var positionListener = this.onParticleMoved.bind( this, particle );
        positionListener.particle = particle;
        this.positionListeners.push( positionListener );
        particle.positionProperty.lazyLink( positionListener );

        this.invalidatePaint();
      },

      onParticleMoved: function( particle, newPosition, oldPosition ) {
        // Check to see if we can update an add/move for the same particle to a new position instead of creating
        // multiple queue entries for a single particle
        var modified = false;
        for ( var i = 0; i < this.queue.length; i++ ) {
          var item = this.queue[i];
          if ( item.newPosition && item.newPosition.equals( oldPosition ) && item.charge === particle.charge ) {
            item.newPosition = newPosition;
            console.log( 'update ' + particle.charge + ' ' + newPosition.toString() );
            modified = true;
            break;
          }
        }

        if ( !modified ) {
          this.queue.push( {
            charge: particle.charge,
            oldPosition: oldPosition.copy(),
            newPosition: newPosition.copy()
          } );
          console.log( 'move ' + particle.charge + ' ' + oldPosition.toString() + ' to ' + newPosition.toString() );
        }

        this.invalidatePaint();
      },

      onParticleRemoved: function( particle ) {
        var modified = false;
        for ( var i = 0; i < this.queue.length; i++ ) {
          var item = this.queue[i];
          if ( item.newPosition && item.newPosition.equals( particle.position ) && item.charge === particle.charge ) {
            item.newPosition = null;
            console.log( 'update ' + particle.charge + ' null' );
            // remove the item from the list if we would add-remove it
            if ( item.oldPosition === null && item.newPosition === null ) {
              this.queue.splice( i, 1 );
              console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
            }
            modified = true;
            break;
          }
        }

        if ( !modified ) {
          this.queue.push( {
            charge: particle.charge,
            oldPosition: particle.position.copy(),
            newPosition: null
          } );
          console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
        }

        // remove the position listener
        for ( var k = 0; k < this.positionListeners.length; k++ ) {
          if ( this.positionListeners[k].particle === particle ) {
            particle.positionProperty.unlink( this.positionListeners[k] );
            this.positionListeners.splice( k, 1 );
            break;
          }
        }

        this.invalidatePaint();
      },

      initializeWebGLDrawable: function( drawable ) {
        var gl = drawable.gl;

        // we will need this extension
        gl.getExtension( 'OES_texture_float' );

        drawable.framebuffer = gl.createFramebuffer();

        drawable.currentTexture = gl.createTexture();
        this.sizeTexture( drawable, drawable.currentTexture );

        drawable.computeShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;\n',
          'varying vec2 vPos;\n',
          'void main() {\n',
          '  vPos = aPosition.xy * 0.5 + 0.5;\n',
          '  gl_Position = vec4( aPosition, 1 );\n',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;\n',
          'varying vec2 vPos;\n',
          'void main() {\n',
          '  gl_FragColor = vec4( sin( vPos.x * 40.0 ) + 2.0 * cos( vPos.y * vPos.x * 50.0 ), 0.0, 0.0, 1.0 );\n',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          uniforms: []
        } );

        drawable.displayShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;\n',
          'varying vec2 texCoord;\n',
          'void main() {\n',
          '  texCoord = aPosition.xy * 0.5 + 0.5;\n',
          '  gl_Position = vec4( aPosition, 1 );\n',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;\n',
          'varying vec2 texCoord;\n',
          'uniform sampler2D uTexture;\n',
          'uniform vec2 uScale;\n',
          'void main() {\n',
          // '  gl_FragColor = texture2D( uTexture, texCoord );\n',
          '  float value = texture2D( uTexture, vec2( texCoord.x * uScale.x, texCoord.y * uScale.y ) ).x;\n', // TODO: optimize?
          '  if ( value > 0.0 ) {\n',
          '    gl_FragColor = vec4( value, value, 0.0, 1.0 );\n',
          '  } else {\n',
          '    gl_FragColor = vec4( 0.0, 0.0, -value, 1.0 );\n',
          '  }\n',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          // uniforms: []
          uniforms: [ 'uTexture', 'uScale' ]
        } );

        drawable.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
          -1, -1,
          -1, +1,
          +1, -1,
          +1, +1
        ] ), gl.STATIC_DRAW );
      },

      sizeTexture: function( drawable, texture ) {
        var gl = drawable.gl;
        var width = gl.canvas.width;
        var height = gl.canvas.height;
        var powerOf2Width = Util.toPowerOf2( width );
        var powerOf2Height = Util.toPowerOf2( height );
        drawable.canvasWidth = width;
        drawable.canvasHeight = height;
        drawable.textureWidth = powerOf2Width;
        drawable.textureHeight = powerOf2Height;

        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, powerOf2Width, powerOf2Height, 0, gl.RGB, gl.FLOAT, null );
        gl.bindTexture( gl.TEXTURE_2D, null );
      },

      paintWebGLDrawable: function( drawable, matrix ) {
        var gl = drawable.gl;
        var computeShaderProgram = drawable.computeShaderProgram;
        var displayShaderProgram = drawable.displayShaderProgram;

        /*---------------------------------------------------------------------------*
        * Compute step
        *----------------------------------------------------------------------------*/

        computeShaderProgram.use();

        gl.bindFramebuffer( gl.FRAMEBUFFER, drawable.framebuffer );
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, drawable.currentTexture, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

        gl.activeTexture( gl.TEXTURE0 );
        // TODO: read from other texture

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );

        computeShaderProgram.unuse();

        // this.modelViewTransform.modelToViewPosition( this.model.chargedParticles.get( 0 ).position );

        // computeShaderProgram.use();

        // gl.uniformMatrix3fv( computeShaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
        // gl.uniformMatrix3fv( computeShaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

        // gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        // gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

        // gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
        // gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

        // gl.drawArrays( gl.TRIANGLES, 0, 3 );

        // computeShaderProgram.unuse();

        displayShaderProgram.use();

        gl.uniform2f( displayShaderProgram.uniformLocations.uScale, drawable.canvasWidth / drawable.textureWidth, drawable.canvasHeight / drawable.textureHeight );

        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.vertexAttribPointer( displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, drawable.currentTexture );
        gl.uniform1i( displayShaderProgram.uniformLocations.uTexture, 0 );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        gl.bindTexture( gl.TEXTURE_2D, null );

        displayShaderProgram.unuse();

        this.queue = [];
      },

      disposeWebGLDrawable: function( drawable ) {
        drawable.computeShaderProgram.dispose();
        drawable.displayShaderProgram.dispose();
        drawable.gl.deleteTexture( drawable.currentTexture );
        drawable.gl.deleteBuffer( drawable.vertexBuffer );
        drawable.gl.deleteFramebuffer( drawable.framebuffer );

        drawable.computeShaderProgram = null;
        drawable.displayShaderProgram = null;
      }
    } );
  }
);

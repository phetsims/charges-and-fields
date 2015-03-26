// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the
 * electric potential field, rendering in WebGL.
 *
 * Relies on storing floating-point data for current potential in a texture, and displays this texture with the needed
 * color mapping. In order to update, we actually have two textures that alternate being the previous texture
 * (reference for before a change) and the current texture (rendered into, combines the last texture and any changes).
 *
 * Every frame, we do one "compute" draw call per changed particle (adding the deltas in potential for its movement/
 * addition/removal), and then one "display" draw call that will render the potential data into our visual display.
 * The compute draws switch back and forth between two textures with a framebuffer, e.g.:
 * - Textures A and B are blank.
 * - We render ( A + changes for particle change 1 ) into B
 * - We render ( B + changes for particle change 2 ) into A
 * - We render ( A + changes for particle change 3 ) into B
 * - We render ( B + changes for particle change 4 ) into A
 * - Display colorized contents of A (it was the last one with all data)
 * - We render ( A + changes for particle change 5 ) into B
 * - Display colorized contents of B (it was the last one with all data)
 * - etc.
 *
 * Additionally, we request the WebGL extension OES_texture_float so that we can make these textures store floating-point
 * values instead of unsigned integers.
 *
 * Things are slightly complicated by the fact that the framebuffer textures need to have power-of-2 dimensions, so our
 * textures are frequently bigger (and only part of the texture is shown). We still keep things 1-to-1 as far as pixels
 * are concerned.
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
    'use strict';

    // modules
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Matrix3 = require( 'DOT/Matrix3' );
    var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
    var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
    var Util = require( 'SCENERY/util/Util' );

    // integer constants for our shader
    var TYPE_ADD = 0;
    var TYPE_REMOVE = 1;
    var TYPE_MOVE = 2;

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
      this.isVisibleProperty = isVisibleProperty;

      WebGLNode.call( this, {
        layerSplit: true // ensure we're on our own layer
      } );

      // update the bounds when needed
      boundsProperty.link( function() {
        self.canvasBounds = boundsProperty.get();
      } );

      // if our color scheme changes, make sure we update
      ChargesAndFieldsColors.on( 'profileChanged', function() {
        self.invalidatePaint();
      } );

      // we handle visibility in our rendering process
      isVisibleProperty.link( function( isVisible ) {
        self.invalidatePaint();
      } );

      // Queued changes of type { charge: {number}, oldPosition: {Vector2}, newPosition: {Vector2} } that will
      // accumulate. oldPosition === null means "add it", newPosition === null means "remove it". We'll apply these
      // graphical deltas at the next rendering.
      this.queue = [];

      // functions to be called back when particle positions change, tagged with listener.particle = particle
      this.positionListeners = [];
      model.chargedParticles.addItemAddedListener( this.onParticleAdded.bind( this ) );
      model.chargedParticles.addItemRemovedListener( this.onParticleRemoved.bind( this ) );

      this.invalidatePaint();
    }

    return inherit( WebGLNode, ElectricPotentialGridWebGLNode, {
      // Add notes to the queue to color all particles (without adding listeners)
      addAllParticles: function() {
        for ( var i = 0; i < this.model.chargedParticles.length; i++ ) {
          this.addParticle( this.model.chargedParticles.get( i ) );
        }
      },

      // Add a note to the queue to color this particle (without adding listeners)
      addParticle: function( particle ) {
        this.queue.push( {
          charge: particle.charge,
          oldPosition: null,
          newPosition: particle.position.copy()
        } );
        // console.log( 'add ' + particle.charge + ' ' + particle.position.toString() );

        this.invalidatePaint();
      },

      onParticleAdded: function( particle ) {
        this.addParticle( particle );

        // add the position listener (need a reference to the particle with the listener, so we can't use the same one)
        var positionListener = this.onParticleMoved.bind( this, particle );
        positionListener.particle = particle;
        this.positionListeners.push( positionListener );
        particle.positionProperty.lazyLink( positionListener );
      },

      onParticleMoved: function( particle, newPosition, oldPosition ) {
        // Check to see if we can update an add/move for the same particle to a new position instead of creating
        // multiple queue entries for a single particle. This will help collapse multiple moves of the same particle in
        // one frame.
        var modified = false;
        for ( var i = 0; i < this.queue.length; i++ ) {
          var item = this.queue[i];
          if ( item.newPosition && item.newPosition.equals( oldPosition ) && item.charge === particle.charge ) {
            item.newPosition = newPosition;
            // console.log( 'update ' + particle.charge + ' ' + newPosition.toString() );
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
          // console.log( 'move ' + particle.charge + ' ' + oldPosition.toString() + ' to ' + newPosition.toString() );
        }

        this.invalidatePaint();
      },

      onParticleRemoved: function( particle ) {
        // See if we can update an already-in-queue item with a null location.
        var modified = false;
        for ( var i = 0; i < this.queue.length; i++ ) {
          var item = this.queue[i];
          if ( item.newPosition && item.newPosition.equals( particle.position ) && item.charge === particle.charge ) {
            item.newPosition = null;
            // console.log( 'update ' + particle.charge + ' null' );
            // remove the item from the list if we would add-remove it
            if ( item.oldPosition === null && item.newPosition === null ) {
              this.queue.splice( i, 1 );
              // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
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
          // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
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

        // the framebuffer we'll be drawing into (with either of the two textures)
        drawable.framebuffer = gl.createFramebuffer();

        // the two textures we'll be switching between
        drawable.currentTexture = gl.createTexture();
        drawable.previousTexture = gl.createTexture();
        this.sizeTexture( drawable, drawable.currentTexture );
        this.sizeTexture( drawable, drawable.previousTexture );

        // reset the queue if we are put in another block
        this.queue = [];
        this.addAllParticles();

        // shader meant to clear a texture (renders solid black everywhere)
        drawable.clearShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;',
          'void main() {',
          '  gl_Position = vec4( aPosition, 1 );',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;',
          'void main() {',
          '  gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          uniforms: []
        } );

        // shader for the "compute" step, that adds a texture lookup + change to the other texture
        drawable.computeShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;', // vertex attribute
          'varying vec2 vPosition;',
          'void main() {',
          '  vPosition = aPosition.xy;',
          '  gl_Position = vec4( aPosition, 1 );',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;',
          'varying vec2 vPosition;',
          'uniform sampler2D uTexture;', // our other texture (that we read from)
          'uniform float uCharge;',
          'uniform vec2 uOldPosition;',
          'uniform vec2 uNewPosition;',
          'uniform int uType;', // see types at the top of the file
          'uniform vec2 uCanvasSize;', // dimensions of the Canvas
          'uniform vec2 uTextureSize;', // dimensions of the texture that covers the Canvas
          'uniform mat3 uMatrixInverse;', // matrix to transform from normalized-device-coordinates to the model
          'const float kConstant = 9.0;',
          'void main() {',
          // homogeneous model-view transformation
          '  vec2 modelPosition = ( uMatrixInverse * vec3( vPosition, 1 ) ).xy;',
          // look up the value before our change (vPosition NDC => [0,1] => scaled to match the part of the texture)
          '  float oldValue = texture2D( uTexture, ( vPosition * 0.5 + 0.5 ) * uCanvasSize / uTextureSize ).x;',
          '  float change = 0.0;',
          // if applicable, add the particle's contribution in the new position
          '  if ( uType == ' + TYPE_ADD + ' || uType == ' + TYPE_MOVE + ' ) {',
          '    change += uCharge * kConstant / length( modelPosition - uNewPosition );',
          '  }',
          // if applicable, remove the particle's contribution in the old position
          '  if ( uType == ' + TYPE_REMOVE + ' || uType == ' + TYPE_MOVE + ' ) {',
          '    change -= uCharge * kConstant / length( modelPosition - uOldPosition );',
          '  }',
          // stuff the result in the x coordinate
          '  gl_FragColor = vec4( oldValue + change, 0.0, 0.0, 1.0 );',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          uniforms: [ 'uTexture', 'uCanvasSize', 'uTextureSize', 'uCharge', 'uOldPosition', 'uNewPosition', 'uType', 'uMatrixInverse' ]
        } );

        // shader for the "display" step, that colorizes the latest potential data
        drawable.displayShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;', // vertex attribute
          'varying vec2 texCoord;',
          'void main() {',
          '  texCoord = aPosition.xy * 0.5 + 0.5;',
          '  gl_Position = vec4( aPosition, 1 );',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;',
          'varying vec2 texCoord;',
          'uniform sampler2D uTexture;', // the texture that contains our floating-point potential data
          'uniform vec2 uScale;', // how to scale our texture lookup
          'uniform vec3 uZeroColor;',
          'uniform vec3 uPositiveColor;',
          'uniform vec3 uNegativeColor;',
          'void main() {',
          '  float value = texture2D( uTexture, texCoord * uScale ).x;',
          // rules to color pulled from ChangesAndFieldsScreenView
          '  if ( value > 0.0 ) {',
          '    value = min( value / 40.0, 1.0 );', // clamp to [0,1]
          '    gl_FragColor = vec4( uPositiveColor * value + uZeroColor * ( 1.0 - value ), 1.0 );',
          '  } else {',
          '    value = min( -value / 40.0, 1.0 );', // clamp to [0,1]
          '    gl_FragColor = vec4( uNegativeColor * value + uZeroColor * ( 1.0 - value ), 1.0 );',
          '  }',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          uniforms: [ 'uTexture', 'uScale', 'uZeroColor', 'uPositiveColor', 'uNegativeColor' ]
        } );

        // we only need one vertex buffer with the same contents for all three shaders!
        drawable.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
          -1, -1,
          -1, +1,
          +1, -1,
          +1, +1
        ] ), gl.STATIC_DRAW );
      },

      // resizes a texture to be able to cover the canvas area, and sets drawable properties for the size
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

      // does the actual painting
      paintWebGLDrawable: function( drawable, matrix ) {
        var gl = drawable.gl;
        var clearShaderProgram = drawable.clearShaderProgram;
        var computeShaderProgram = drawable.computeShaderProgram;
        var displayShaderProgram = drawable.displayShaderProgram;

        // If we're not visible, clear everything and exit. Our layerSplit above guarantees this won't clear other
        // node's renderings.
        if ( !this.isVisibleProperty.get() ) {
          gl.clearColor( 0, 0, 0, 1 );
          gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
          return;
        }

        // If our dimensions changed, resize our textures and reinitialize all of our potentials.
        if ( drawable.canvasWidth !== gl.canvas.width || drawable.canvasHeight !== gl.canvas.height ) {
          this.sizeTexture( drawable, drawable.currentTexture );
          this.sizeTexture( drawable, drawable.previousTexture );
          this.addAllParticles();

          // clears the buffer to be used
          clearShaderProgram.use();
          gl.bindFramebuffer( gl.FRAMEBUFFER, drawable.framebuffer );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, drawable.previousTexture, 0 );

          gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
          gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

          gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
          gl.bindFramebuffer( gl.FRAMEBUFFER, null );
          clearShaderProgram.unuse();
        }

        /*---------------------------------------------------------------------------*
        * Compute steps
        *----------------------------------------------------------------------------*/

        computeShaderProgram.use();

        gl.uniform2f( computeShaderProgram.uniformLocations.uCanvasSize, drawable.canvasWidth, drawable.canvasHeight );
        gl.uniform2f( computeShaderProgram.uniformLocations.uTextureSize, drawable.textureWidth, drawable.textureHeight );

        // TODO: reduce allocations
        var projectionMatrixInverse = new Matrix3().setArray( drawable.webGLBlock.projectionMatrixArray ).invert();
        var matrixInverse = this.modelViewTransform.getInverse().timesMatrix( matrix.inverted().multiplyMatrix( projectionMatrixInverse ) );
        var matrixInverseEntries = new Float32Array( matrixInverse.entries );
        gl.uniformMatrix3fv( computeShaderProgram.uniformLocations.uMatrixInverse, false, matrixInverseEntries );

        // do a draw call for each particle change
        for ( var i = 0; i < this.queue.length; i++ ) {
          var item = this.queue[i];

          // make future rendering output into currentTexture
          gl.bindFramebuffer( gl.FRAMEBUFFER, drawable.framebuffer );
          gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, drawable.currentTexture, 0 );

          // use our vertex buffer to say where to render (two triangles covering the screen)
          gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
          gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

          // make previous data from the other texture available to the shader
          gl.activeTexture( gl.TEXTURE0 );
          gl.bindTexture( gl.TEXTURE_2D, drawable.previousTexture );
          gl.uniform1i( computeShaderProgram.uniformLocations.uTexture, 0 );

          // make the positions available to the shader
          gl.uniform1f( computeShaderProgram.uniformLocations.uCharge, item.charge );
          if ( item.oldPosition ) {
            gl.uniform2f( computeShaderProgram.uniformLocations.uOldPosition, item.oldPosition.x, item.oldPosition.y );
          }
          else {
            gl.uniform2f( computeShaderProgram.uniformLocations.uOldPosition, 0, 0 );
          }
          if ( item.newPosition ) {
            gl.uniform2f( computeShaderProgram.uniformLocations.uNewPosition, item.newPosition.x, item.newPosition.y );
          }
          else {
            gl.uniform2f( computeShaderProgram.uniformLocations.uNewPosition, 0, 0 );
          }

          // tell the shader the type of change we are making
          var type = item.oldPosition ? ( item.newPosition ? TYPE_MOVE : TYPE_REMOVE ) : TYPE_ADD;
          gl.uniform1i( computeShaderProgram.uniformLocations.uType, type );
          // console.log( type );

          // actually draw it
          gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
          // make future rendering output go into our visual display
          gl.bindFramebuffer( gl.FRAMEBUFFER, null );

          // swap buffers (since currentTexture now has the most up-to-date info, we'll want to use it for reading)
          var tmp = drawable.currentTexture;
          drawable.currentTexture = drawable.previousTexture;
          drawable.previousTexture = tmp;
        }

        computeShaderProgram.unuse();

        /*---------------------------------------------------------------------------*
        * Display step
        *----------------------------------------------------------------------------*/

        displayShaderProgram.use();

        // tell the shader our colors / scale
        var zeroColor = ChargesAndFieldsColors.electricPotentialGridZero;
        var positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositive;
        var negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegative;
        gl.uniform3f( displayShaderProgram.uniformLocations.uZeroColor, zeroColor.red / 255, zeroColor.green / 255, zeroColor.blue / 255 );
        gl.uniform3f( displayShaderProgram.uniformLocations.uPositiveColor, positiveColor.red / 255, positiveColor.green / 255, positiveColor.blue / 255 );
        gl.uniform3f( displayShaderProgram.uniformLocations.uNegativeColor, negativeColor.red / 255, negativeColor.green / 255, negativeColor.blue / 255 );
        gl.uniform2f( displayShaderProgram.uniformLocations.uScale, drawable.canvasWidth / drawable.textureWidth, drawable.canvasHeight / drawable.textureHeight );

        // data to draw 2 triangles that cover the screen
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.vertexAttribPointer( displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

        // read from the most up-to-date texture (our potential data)
        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, drawable.previousTexture );
        gl.uniform1i( displayShaderProgram.uniformLocations.uTexture, 0 );

        // actually draw it
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        // release the texture
        gl.bindTexture( gl.TEXTURE_2D, null );

        displayShaderProgram.unuse();

        this.queue = [];
      },

      disposeWebGLDrawable: function( drawable ) {
        // clears all of our resources
        drawable.computeShaderProgram.dispose();
        drawable.displayShaderProgram.dispose();
        drawable.gl.deleteTexture( drawable.currentTexture );
        drawable.gl.deleteTexture( drawable.previousTexture );
        drawable.gl.deleteBuffer( drawable.vertexBuffer );
        drawable.gl.deleteFramebuffer( drawable.framebuffer );

        drawable.computeShaderProgram = null;
        drawable.displayShaderProgram = null;
      }
    }, {
      /**
       * Detection for support, because iOS Safari 8 doesn't support rendering to a float texture, AND doesn't support
       * classic detection via an extension (OES_texture_float works).
       */
      supportsRenderingToFloatTexture: function() {
        var canvas = document.createElement( 'canvas' );
        var gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
        gl.getExtension( 'OES_texture_float' );
        var framebuffer = gl.createFramebuffer();
        var texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 128, 128, 0, gl.RGB, gl.FLOAT, null );
        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0 );
        return gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE;
      }
    } );
  }
);

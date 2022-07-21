// Copyright 2014-2022, University of Colorado Boulder

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

import ObservableArrayDef from '../../../../axon/js/ObservableArrayDef.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import { ShaderProgram, Utils, WebGLNode } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargeTracker from './ChargeTracker.js';

// integer constants for our shader
const TYPE_ADD = 0;
const TYPE_REMOVE = 1;
const TYPE_MOVE = 2;

// persistent matrices/arrays so we minimize the number of created objects during rendering
const scratchProjectionMatrix = new Matrix3();
const scratchInverseMatrix = new Matrix3();
const scratchFloatArray = new Float32Array( 9 );

class ElectricPotentialWebGLNode extends WebGLNode {

  /**
   * @param {ObservableArrayDef.<ChargedParticle>} chargedParticles - only chargedParticles that active are in this array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isVisibleProperty
   */
  constructor( chargedParticles, modelViewTransform, isVisibleProperty ) {
    assert && assert( ObservableArrayDef.isObservableArray( chargedParticles ), 'invalid chargedParticles' );

    super( ElectricPotentialPainter, {
      layerSplit: true // ensure we're on our own layer
    } );

    this.chargedParticles = chargedParticles;
    this.modelViewTransform = modelViewTransform;
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    const invalidateSelfListener = this.invalidatePaint.bind( this );
    ChargesAndFieldsColors.electricPotentialGridZeroProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.link( invalidateSelfListener );
    isVisibleProperty.link( invalidateSelfListener ); // visibility change

    // particle added
    chargedParticles.addItemAddedListener( particle => particle.positionProperty.link( invalidateSelfListener ) );

    // particle removed
    chargedParticles.addItemRemovedListener( particle => {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } );

    // visibility change
    this.disposeElectricPotentialWebGLNode = () => isVisibleProperty.unlink( invalidateSelfListener );
  }

  /**
   * Detection for support, because iOS Safari 8 doesn't support rendering to a float texture, AND doesn't support
   * classic detection via an extension (OES_texture_float works).
   * @public
   */
  static supportsRenderingToFloatTexture() {
    const canvas = document.createElement( 'canvas' );
    const gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
    gl.getExtension( 'OES_texture_float' );
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 128, 128, 0, gl.RGB, gl.FLOAT, null );
    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0 );
    return gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.disposeElectricPotentialWebGLNode();
  }
}

chargesAndFields.register( 'ElectricPotentialWebGLNode', ElectricPotentialWebGLNode );

class ElectricPotentialPainter {

  /**
   * @param {WebGLRenderingContext} gl
   * @param {WaveWebGLNode} node
   */
  constructor( gl, node ) {
    this.gl = gl;
    this.node = node;

    this.chargeTracker = new ChargeTracker( node.chargedParticles );

    // we will need this extension
    gl.getExtension( 'OES_texture_float' );

    // the framebuffer we'll be drawing into (with either of the two textures)
    this.framebuffer = gl.createFramebuffer();

    // the two textures we'll be switching between
    this.currentTexture = gl.createTexture();
    this.previousTexture = gl.createTexture();
    this.sizeTexture( this.currentTexture );
    this.sizeTexture( this.previousTexture );

    // shader meant to clear a texture (renders solid black everywhere)
    this.clearShaderProgram = new ShaderProgram( gl, [
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
    this.computeShaderProgram = new ShaderProgram( gl, [
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
      `  if ( uType == ${TYPE_ADD} || uType == ${TYPE_MOVE} ) {`,
      '    change += uCharge * kConstant / length( modelPosition - uNewPosition );',
      '  }',
      // if applicable, remove the particle's contribution in the old position
      `  if ( uType == ${TYPE_REMOVE} || uType == ${TYPE_MOVE} ) {`,
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
    this.displayShaderProgram = new ShaderProgram( gl, [
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
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
      -1, -1,
      -1, +1,
      +1, -1,
      +1, +1
    ] ), gl.STATIC_DRAW );
  }

  /**
   * Resizes a texture to be able to cover the canvas area, and sets drawable properties for the size
   * @private
   *
   * @param {WebGLTexture} texture
   */
  sizeTexture( texture ) {
    const gl = this.gl;
    const width = gl.canvas.width;
    const height = gl.canvas.height;
    const powerOf2Width = Utils.toPowerOf2( width );
    const powerOf2Height = Utils.toPowerOf2( height );
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.textureWidth = powerOf2Width;
    this.textureHeight = powerOf2Height;

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, powerOf2Width, powerOf2Height, 0, gl.RGB, gl.FLOAT, null );
    gl.bindTexture( gl.TEXTURE_2D, null );
  }

  /**
   * @public
   *
   * @param {Matrix3} modelViewMatrix
   * @param {Matrix3} projectionMatrix
   * @returns {number} - WebGLNode.PAINTED_NOTHING or WebGLNode.PAINTED_SOMETHING.
   */
  paint( modelViewMatrix, projectionMatrix ) {
    const gl = this.gl;
    const clearShaderProgram = this.clearShaderProgram;
    const computeShaderProgram = this.computeShaderProgram;
    const displayShaderProgram = this.displayShaderProgram;

    // If we're not visible, clear everything and exit. Our layerSplit above guarantees this won't clear other
    // node's renderings.
    if ( !this.node.isVisibleProperty.get() ) {
      return WebGLNode.PAINTED_NOTHING;
    }

    // If our dimensions changed, resize our textures and reinitialize all of our potentials.
    if ( this.canvasWidth !== gl.canvas.width || this.canvasHeight !== gl.canvas.height ) {
      this.sizeTexture( this.currentTexture );
      this.sizeTexture( this.previousTexture );
      this.chargeTracker.rebuild();

      // clears the buffer to be used
      clearShaderProgram.use();
      gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.previousTexture, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      gl.bindFramebuffer( gl.FRAMEBUFFER, null );
      clearShaderProgram.unuse();
    }

    /*---------------------------------------------------------------------------*
     * Compute steps
     *----------------------------------------------------------------------------*/

    computeShaderProgram.use();

    gl.uniform2f( computeShaderProgram.uniformLocations.uCanvasSize, this.canvasWidth, this.canvasHeight );
    gl.uniform2f( computeShaderProgram.uniformLocations.uTextureSize, this.textureWidth, this.textureHeight );

    const matrixInverse = scratchInverseMatrix;
    const projectionMatrixInverse = scratchProjectionMatrix.set( projectionMatrix ).invert();
    matrixInverse.set( this.node.modelViewTransform.getInverse() ).multiplyMatrix( modelViewMatrix.inverted().multiplyMatrix( projectionMatrixInverse ) );
    gl.uniformMatrix3fv( computeShaderProgram.uniformLocations.uMatrixInverse, false, matrixInverse.copyToArray( scratchFloatArray ) );

    // do a draw call for each particle change
    for ( let i = 0; i < this.chargeTracker.queue.length; i++ ) {
      const item = this.chargeTracker.queue[ i ];

      // make future rendering output into currentTexture
      gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.currentTexture, 0 );

      // use our vertex buffer to say where to render (two triangles covering the screen)
      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.vertexAttribPointer( computeShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

      // make previous data from the other texture available to the shader
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, this.previousTexture );
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
      const type = item.oldPosition ? ( item.newPosition ? TYPE_MOVE : TYPE_REMOVE ) : TYPE_ADD;
      gl.uniform1i( computeShaderProgram.uniformLocations.uType, type );
      // console.log( type );

      // actually draw it
      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
      // make future rendering output go into our visual display
      gl.bindFramebuffer( gl.FRAMEBUFFER, null );

      // swap buffers (since currentTexture now has the most up-to-date info, we'll want to use it for reading)
      const tmp = this.currentTexture;
      this.currentTexture = this.previousTexture;
      this.previousTexture = tmp;
    }

    computeShaderProgram.unuse();

    /*---------------------------------------------------------------------------*
     * Display step
     *----------------------------------------------------------------------------*/

    displayShaderProgram.use();

    // tell the shader our colors / scale
    const zeroColor = ChargesAndFieldsColors.electricPotentialGridZeroProperty.get();
    const positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get();
    const negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get();
    gl.uniform3f( displayShaderProgram.uniformLocations.uZeroColor, zeroColor.red / 255, zeroColor.green / 255, zeroColor.blue / 255 );
    gl.uniform3f( displayShaderProgram.uniformLocations.uPositiveColor, positiveColor.red / 255, positiveColor.green / 255, positiveColor.blue / 255 );
    gl.uniform3f( displayShaderProgram.uniformLocations.uNegativeColor, negativeColor.red / 255, negativeColor.green / 255, negativeColor.blue / 255 );
    gl.uniform2f( displayShaderProgram.uniformLocations.uScale, this.canvasWidth / this.textureWidth, this.canvasHeight / this.textureHeight );

    // data to draw 2 triangles that cover the screen
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.vertexAttribPointer( displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

    // read from the most up-to-date texture (our potential data)
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.previousTexture );
    gl.uniform1i( displayShaderProgram.uniformLocations.uTexture, 0 );

    // actually draw it
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    // release the texture
    gl.bindTexture( gl.TEXTURE_2D, null );

    displayShaderProgram.unuse();

    this.chargeTracker.clear();

    return WebGLNode.PAINTED_SOMETHING;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    const gl = this.gl;

    // clears all of our resources
    this.computeShaderProgram.dispose();
    this.displayShaderProgram.dispose();
    this.clearShaderProgram.dispose();
    gl.deleteTexture( this.currentTexture );
    gl.deleteTexture( this.previousTexture );
    gl.deleteBuffer( this.vertexBuffer );
    gl.deleteFramebuffer( this.framebuffer );

    this.computeShaderProgram = null;
    this.displayShaderProgram = null;
    this.clearShaderProgram = null;

    this.chargeTracker.dispose();
  }
}

export default ElectricPotentialWebGLNode;
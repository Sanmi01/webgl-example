import React, { useEffect, useRef } from 'react';
import { mat4 } from 'gl-matrix';

function initGL(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL is not supported in your browser.');
    return null;
  }
  return gl;
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function App() {
  const canvasRef = useRef(null);
  const rotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = initGL(canvas);

    if (!gl) {
      return;
    }

    // Define vertex and fragment shaders.
    const vsSource = `
      attribute vec4 aVertexPosition;
      uniform mat4 uModelViewMatrix;
      void main(void) {
        gl_Position = uModelViewMatrix * aVertexPosition;
      }
    `;

    const fsSource = `
      void main(void) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
      }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    // Set up vertex data
    const vertices = new Float32Array([
      -0.5, -0.5,
       0.5, -0.5,
       0.0,  0.5,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // Set up rotation matrix
    const modelViewMatrix = new Float32Array(16);
    const angle = 0.02; // Rotation angle increment

    // Animation function
    function animate() {
        rotation.current += angle;

      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update the modelViewMatrix with rotation
      mat4.identity(modelViewMatrix);
      mat4.rotate(modelViewMatrix, modelViewMatrix, rotation.current, [0, 0, 1]);

      gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);

      // Draw the triangle
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return <canvas ref={canvasRef} width={400} height={400} />;
}

export default App;

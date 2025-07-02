/ =======================
// Cubo WebGL Interactivo
// =======================
function initWebGLCube() {
  const canvas = document.getElementById('webgl-cube');
  if (!canvas || !canvas.getContext) return;
  let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    // Mostramos mensaje si no hay WebGL
    const ctx2d = canvas.getContext('2d');
    if (ctx2d) {
      ctx2d.font = "16px Arial";
      ctx2d.fillStyle = "red";
      ctx2d.fillText("WebGL no soportado", 10, 50);
    }
    console.error("WebGL no soportado");
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  // Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  // Compilar shaders
  function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) return;

  // Crear programa y enlazar
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Unable to initialize the shader program:", gl.getProgramInfoLog(shaderProgram));
    return;
  }

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Coordenadas del cubo
  const positions = [
    // Front face
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    // Back face
    -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
    // Top face
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    // Bottom face
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
    // Right face
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    // Left face
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
  ];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Colores del cubo
  const faceColors = [
    [0.93, 0.51, 0.33, 1.0], // Accent (front)
    [0.31, 0.35, 0.51, 1.0], // Azul oscuro (back)
    [0.75, 0.75, 0.75, 1.0], // Gris claro (top)
    [0.31, 0.36, 0.46, 1.0], // Gris azulado (bottom)
    [1.0, 1.0, 1.0, 1.0], // Blanco (right)
    [0.19, 0.19, 0.26, 1.0], // Azul más oscuro (left)
  ];
  let colors = [];
  for (let j = 0; j < 6; ++j) {
    colors = colors.concat(faceColors[j], faceColors[j], faceColors[j], faceColors[j]);
  }
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Índices
  const indices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9,10, 8,10,11, // top
    12,13,14,12,14,15, // bottom
    16,17,18,16,18,19, // right
    20,21,22,20,22,23, // left
  ];
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Variables para interacción
  let cubeRotation = 0;
  let lastX = null, dragging = false;

  // Dibuja la escena
  function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Proyección
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1, zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // ModelView
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);

    // Posiciones
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Colores
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    // Índices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }

  // Interacción con mouse para girar el cubo
  canvas.addEventListener('mousedown', e => { lastX = e.offsetX; dragging = true; });
  canvas.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseout', () => { dragging = false; });
  canvas.addEventListener('mousemove', e => {
    if (dragging) {
      const dx = e.offsetX - lastX;
      cubeRotation += dx * 0.01;
      lastX = e.offsetX;
    }
  });

  // Animación
  function render() {
    drawScene();
    requestAnimationFrame(render);
  }
  render();
}

// ===============
// Matriz mínima
// ===============
const mat4 = {
  create: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  perspective: function(out, fovy, aspect, near, far) {
    let f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = (2 * far * near) * nf; out[15] = 0;
    return out;
  },
  translate: function(out, a, v) {
    let x = v[0], y = v[1], z = v[2],
      a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
    return out;
  },
  rotate: function(out, a, rad, axis) {
    let x = axis[0], y = axis[1], z = axis[2];
    let len = Math.hypot(x, y, z);
    if (len < 0.000001) return null;
    len = 1 / len; x *= len; y *= len; z *= len;
    let s = Math.sin(rad), c = Math.cos(rad), t = 1 - c;
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    let b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s,
      b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s,
      b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
    return out;
  }
};

window.addEventListener('DOMContentLoaded', initWebGLCube);

// ===========================
// Clasificador de Sentimiento
// ===========================
const positiveWords = ['good', 'great', 'awesome', 'happy', 'love', 'excellent', 'fantastic', 'cool', 'wonderful'];
const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'worst', 'angry', 'boring', 'poor'];

function classifySentiment(text) {
  if (!text) return 'Por favor escribe una frase.';
  let score = 0;
  const t = text.toLowerCase();
  positiveWords.forEach(w => { if (t.includes(w)) score++; });
  negativeWords.forEach(w => { if (t.includes(w)) score--; });
  if (score > 0) return '¡Sentimiento positivo! 😃';
  if (score < 0) return 'Sentimiento negativo. 😞';
  return 'No se detecta sentimiento claro.';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const result = document.getElementById('ai-result');
  if (form && input && result) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value;
      result.style.display = 'block';
      result.textContent = classifySentiment(text);
    });
  }
});

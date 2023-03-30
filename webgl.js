import * as glm from "gl-matrix"

/** @type {WebGLRenderingContext} */
let gl

/** @type {WebGLProgram} */
let shaderProgram

let axisAngle = 0
let cubeAngle = 0
let podiumAngle = 0
let model

const testShader =`
attribute vec3 vertPos;

uniform vec3 uColor;
uniform mat4 mat;
uniform mat4 proj;
uniform mat4 view;

varying vec3 color;

void main() {
  gl_Position = proj * view * mat * vec4(vertPos, 1.0);
  color = uColor;
}`

const testfragShader = `
#ifdef GL_ES 
precision highp float;
#endif

varying vec3 color;

void main() { 
  gl_FragColor = vec4(color, 1.0);
}`

main()

function main() {
  gl = document.getElementById("test").getContext("webgl2")

  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    )
    return
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  
  initShaderProgram(testShader, testfragShader)
  
  initBuffers()
  initProjMatrix()
  initViewMatrix()

  window.addEventListener("keydown", e => {
    switch(e.key) {
      case "q": {
        axisAngle -= 0.05
        break
      }
      case "e": {
        axisAngle += 0.05
        break
      }
      case "a": {
        cubeAngle -= 0.05
        break
      }
      case "d": {
        cubeAngle += 0.05
        break
      }
      case "z": {
        podiumAngle -= 0.05
        break
      }
      case "c": {
        podiumAngle += 0.05
        break
      }
    }
  })

  requestAnimationFrame(render)
}

function initModelMatrix(xOffset, podCenter) { // 4
  // y axis
  glm.mat4.translate(model,model,[-xOffset,0,0])
  glm.mat4.rotate(model,model,axisAngle,[0,1,0])
  glm.mat4.translate(model,model,[xOffset,0,0])

  // podium rotation
  glm.mat4.translate(model,model,[podCenter - xOffset,0,0])
  glm.mat4.rotate(model,model,podiumAngle,[0,1,0])
  glm.mat4.translate(model,model,[xOffset - podCenter,0,0])
  
  // cube rotation
  glm.mat4.rotate(model,model,cubeAngle,[0,1,0])
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"mat"),false,model)
}

function render(){
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)

  // Bronze
  model = glm.mat4.create()
  glm.mat4.translate(model,model,[6,0,0])
  initModelMatrix(6,4)

  gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.69,0.55,0.34])
  gl.drawArrays(gl.TRIANGLES, 0, 36)

  // Silver
  model = glm.mat4.create()
  glm.mat4.translate(model,model,[2,0,0])
  initModelMatrix(2,4)

  gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.75,0.75,0.75])
  gl.drawArrays(gl.TRIANGLES, 0, 36)

  // Gold bottom
  model = glm.mat4.create()
  glm.mat4.translate(model,model,[4,0,0])
  initModelMatrix(4,4)

  gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.83,0.686,0.216])
  gl.drawArrays(gl.TRIANGLES, 0, 36)

  // Gold top
  model = glm.mat4.create()
  glm.mat4.translate(model,model,[4,0,0])
  glm.mat4.translate(model,model,[0,2,0])
  initModelMatrix(4,4)

  gl.uniform3fv(gl.getUniformLocation(shaderProgram,"uColor"),[0.83,0.686,0.216])
  gl.drawArrays(gl.TRIANGLES, 0, 36)

  requestAnimationFrame(render)
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program
  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(
      shaderProgram)}`)
    return null
  }

  gl.useProgram(shaderProgram)
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(type, source) {
  const shader = gl.createShader(type)

  // Send the source to the shader object
  gl.shaderSource(shader, source)

  // Compile the shader program
  gl.compileShader(shader)

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function initBuffers() {
  const posBuffer  = gl.createBuffer()
  // const indexBuffer = gl.createBuffer()
  let vertices = [
    -1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    -1, -1, 1,
    1, -1, 1,
    1, 1, 1, // front side
    1, 1, 1,
    1, 1, -1,
    1, -1, 1,
    1, -1, -1,
    1, -1, 1,
    1, 1, -1, // right side
    1, 1, -1,
    -1, 1, -1,
    1, -1, -1,
    -1, -1, -1,
    1, -1, -1,
    -1, 1, -1, // back
    -1, 1, -1,
    -1, 1, 1,
    -1, -1, -1,
    -1, -1, 1,
    -1, -1, -1,
    -1, 1, 1,  // left
    -1, 1, 1,
    1, 1, 1,
    -1, 1, -1,
    1, 1, -1,
    -1, 1, -1,
    1, 1, 1, // top
    1, -1, 1,
    -1, -1, 1,
    1, -1, -1,
    -1, -1, -1,
    1, -1, -1,
    -1, -1, 1, // bottom
  ]

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  const vertPos = gl.getAttribLocation(shaderProgram,"vertPos")
  gl.enableVertexAttribArray(vertPos)
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
  gl.vertexAttribPointer(vertPos, 3, gl.FLOAT, false, 0, 0)
}

function initProjMatrix() {
  const proj = glm.mat4.create();
  glm.mat4.perspective(proj,  Math.PI / 4, 
    gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"proj"),false,proj)
}

function initViewMatrix() {
  const view = glm.mat4.create()
  glm.mat4.lookAt(view, [0,0,20], [0,0,0], [0, 1, 0])
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram,"view"),false,view)
}
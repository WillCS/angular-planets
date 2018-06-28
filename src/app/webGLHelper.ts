declare var require:any;
const vertexShaderSource = require('raw-loader!glslify-loader!./glsl/vertex.glsl');

function setupCanvas(canvas: HTMLCanvasElement): WebGLRenderingContext {
    let gl: WebGLRenderingContext = canvas.getContext("webgl");

    if(gl) {
        return gl;
    } else {
        throw new Error("WebGL is not supported in this browser.");
    }
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    let shader: WebGLShader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader failed to compile.");
    }
}

function createShaderProgram(gl: WebGLRenderingContext, vertex: WebGLShader, 
        fragment: WebGLShader): WebGLProgram {
    let program: WebGLProgram = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    } else {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Program failed to link.");
    }
}

export function setupWebGL(gl: WebGLRenderingContext): void {
    console.log(vertexShaderSource);
}
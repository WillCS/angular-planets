declare var require: any;
const vertexShaderSource = require('raw-loader!glslify-loader!../glsl/vertex.glsl');
const fragmentShaderSource = require('raw-loader!glslify-loader!../glsl/fragment.glsl');


const skyboxVertSource = require('raw-loader!glslify-loader!../glsl/skyboxVert.glsl');
const skyboxFragSource = require('raw-loader!glslify-loader!../glsl/skyboxFrag.glsl');

export let WebGLHelper = {
    setupCanvas(canvas: HTMLCanvasElement): WebGLRenderingContext {
        let gl: WebGLRenderingContext = canvas.getContext('webgl');

        if(gl) {
            return gl;
        } else {
            throw new Error('WebGL is not supported in this browser.');
        }
    },

    compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
        let shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            throw new Error('Shader failed to compile.');
        }
    },

    createShaderProgram(gl: WebGLRenderingContext, vertex: WebGLShader, 
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
            throw new Error('Program failed to link.');
        }
    },

    buildShaderProgram(gl: WebGLRenderingContext): WebGLProgram {
        let vertexShader: WebGLShader;
        let fragmentShader: WebGLShader;
        try {
            vertexShader = 
                    this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            fragmentShader = 
                    this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        } catch(error) {
            console.log('Shaders failed to compile.');
        }

        let program: WebGLProgram;

        if(vertexShader && fragmentShader) {
            try {
                program = this.createShaderProgram(gl, vertexShader, fragmentShader);
            } catch(error) {
                console.log('Shaders compiled but failed to link.');
            }
        }

        return program;
    },
    
    buildSkyboxShader(gl: WebGLRenderingContext): WebGLProgram {
        let vertexShader: WebGLShader;
        let fragmentShader: WebGLShader;
        try {
            vertexShader = 
                    this.compileShader(gl, gl.VERTEX_SHADER, skyboxVertSource);
            fragmentShader = 
                    this.compileShader(gl, gl.FRAGMENT_SHADER, skyboxFragSource);
        } catch(error) {
            console.log('Shaders failed to compile.');
        }

        let program: WebGLProgram;

        if(vertexShader && fragmentShader) {
            try {
                program = this.createShaderProgram(gl, vertexShader, fragmentShader);
            } catch(error) {
                console.log('Shaders compiled but failed to link.');
            }
        }

        return program;
    },

    resizeCanvasToWindowSize(canvas: HTMLCanvasElement): void {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
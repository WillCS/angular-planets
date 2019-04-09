declare var require: any;
const shaderSource = {
    skybox: {
        vertex:   require('raw-loader!../glsl/skyboxVert.glsl'),
        fragment: require('raw-loader!../glsl/skyboxFrag.glsl')
    },
    light: {
        vertex:   require('raw-loader!../glsl/globalLightVert.glsl'),
        fragment: require('raw-loader!../glsl/globalLightFrag.glsl')
    },
    default: {
        vertex:   require('raw-loader!../glsl/vertex.glsl'),
        fragment: require('raw-loader!../glsl/fragment.glsl')
    },
    ray_marcher: {
        vertex:   require('raw-loader!../glsl/rayVertex.glsl'),
        fragment: require('raw-loader!../glsl/rayFragment.glsl')
    }
};

export let WebGLHelper = {
    SKYBOX_SHADER:  'skybox',
    LIGHT_SHADER:   'light',
    DEFAULT_SHADER: 'default',
    SPHERE_TRACER: 'ray_marcher',

    setupCanvas(canvas: HTMLCanvasElement): WebGLRenderingContext {
        const gl: WebGLRenderingContext = canvas.getContext('webgl');

        if(gl) {
            return gl;
        } else {
            throw new Error('WebGL is not supported in this browser.');
        }
    },

    compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
        const shader: WebGLShader = gl.createShader(type);
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
        const program: WebGLProgram = gl.createProgram();
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

    buildShaderProgram(gl: WebGLRenderingContext, shader: string): WebGLProgram {
        let vertexShader: WebGLShader;
        let fragmentShader: WebGLShader;
        try {
            vertexShader =
                    this.compileShader(gl, gl.VERTEX_SHADER, shaderSource[shader].vertex);
            fragmentShader =
                    this.compileShader(gl, gl.FRAGMENT_SHADER, shaderSource[shader].fragment);
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
        const pixelRatio: number = window.devicePixelRatio;

        canvas.width = Math.floor(window.innerWidth * pixelRatio);
        canvas.height = Math.floor(window.innerHeight * pixelRatio);
    }
};

import { Shader } from "./shader";
import { Camera3D } from "../camera";

export class Skybox {
    private static vertices: Float32Array = new Float32Array([
        -1,  1, -1,
        -1, -1, -1,
         1, -1, -1,
         1, -1, -1,
         1,  1, -1,
        -1,  1, -1,
    
        -1, -1,  1,
        -1, -1, -1,
        -1,  1, -1,
        -1,  1, -1,
        -1,  1,  1,
        -1, -1,  1,
    
         1, -1, -1,
         1, -1,  1,
         1,  1,  1,
         1,  1,  1,
         1,  1, -1,
         1, -1, -1,
    
        -1, -1,  1,
        -1,  1,  1,
         1,  1,  1,
         1,  1,  1,
         1, -1,  1,
        -1, -1,  1,
    
        -1,  1, -1,
         1,  1, -1,
         1,  1,  1,
         1,  1,  1,
        -1,  1,  1,
        -1,  1, -1,
    
        -1, -1, -1,
        -1, -1,  1,
         1, -1, -1,
         1, -1, -1,
        -1, -1,  1,
         1, -1,  1
    ]);

    private buffer: WebGLBuffer;
    private texture: WebGLTexture;
    constructor(private gl: WebGLRenderingContext) {
        this.texture =  this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);

        for(let i = 0; i < 6; i++) {
            this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.gl.RGBA, 1, 1, 0, 
                this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

            let image = new Image();
            image.src = `/assets/textures/skybox/${i + 1}.png`;
            image.addEventListener('load', () => {
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
                this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            });
        }

        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE); 

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, Skybox.vertices, gl.STATIC_DRAW);
    }

    public draw(shader: Shader, camera: Camera3D): void {
        shader.useShader();

        let viewLocation: WebGLUniformLocation = shader.getUniformLocation("view");
        this.gl.uniformMatrix4fv(viewLocation, false, camera.getLookMatrix().forGL());
        let projectionLocation: WebGLUniformLocation = shader.getUniformLocation("projection");
        this.gl.uniformMatrix4fv(projectionLocation, false, camera.getProjectionMatrix().forGL());

        let vertexLocation: number = shader.getAttributeLocation("a_pos");
        this.gl.enableVertexAttribArray(vertexLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        let vertexSize: number = 3;
        let vertexType: number = this.gl.FLOAT;
        let vertexNormalize: boolean = false;
        let vertexStride: number = 0;
        let vertexOffset: number = 0;
        this.gl.vertexAttribPointer(vertexLocation, 
                vertexSize, vertexType, vertexNormalize, vertexStride, vertexOffset);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.uniform1i(shader.getUniformLocation("skybox"), 0);

        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.depthMask(false);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
        this.gl.depthMask(true);
        this.gl.enable(this.gl.DEPTH_TEST);
    }
}
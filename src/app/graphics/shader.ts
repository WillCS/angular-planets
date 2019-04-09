import { WebGLHelper } from './webGLHelper';
import { LightSource } from './lightSource';
import { Colour3, Colour4 } from './colour';
import { Vec3, Vec4 } from '../math/vector';
import { Camera3D } from '../camera';
import { Mat4 } from '../math/matrix';
import { Body, Planet, Star } from '../objects/body';
import { Orbiter } from '../objects/orbiter';
import { Ring } from '../objects/ring';

export class Shader {
    protected camera: Camera3D;
    protected model: Mat4;

    /** gl.getAttribLocation and gl.getUniformLocation should be considered slow and used sparsely,
     *  so we cache uniforms and attributes as we access them so we don't have to call these
     *  methods repeatedly. */
    private cachedUniforms: Map<string, WebGLUniformLocation> = new Map<string, WebGLUniformLocation>();
    private cachedAttributes: Map<string, number> = new Map<string, number>();
    private enabledAttributes: Map<string, boolean> = new Map<string, boolean>();

    constructor(protected gl: WebGLRenderingContext, protected shader: WebGLProgram) {

    }

    public get requiresNormals(): boolean {
        return false;
    }

    public get requiresColours(): boolean {
        return true;
    }

    public setCamera(camera: Camera3D): void {
        this.camera = camera;
    }

    public setModel(matrix: Mat4): void {
        this.model = matrix;
        this.setMat4('model', matrix);
    }

    public useShader(): void {
        this.gl.useProgram(this.shader);
    }

    public setUniforms(): void {
        this.setMat4('view', this.camera.getLookMatrix());
        this.setMat4('projection', this.camera.getProjectionMatrix());
    }

    public clear(): void {

    }

    public getAttributeLocation(attribute: string): number {
        if(this.cachedAttributes.has(attribute)) {
            return this.cachedAttributes.get(attribute);
        } else {
            const location: number = this.gl.getAttribLocation(this.shader, attribute);
            this.cachedAttributes.set(attribute, location);
            return location;
        }
    }

    public getUniformLocation(uniform: string): WebGLUniformLocation {
        if(this.cachedUniforms.has(uniform)) {
            return this.cachedUniforms.get(uniform);
        } else {
            const location: WebGLUniformLocation = this.gl.getUniformLocation(this.shader, uniform);
            this.cachedUniforms.set(uniform, location);
            return location;
        }
    }

    public setFloat(uniform: string, float: number): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform1f(location, float);
    }

    public setInt(uniform: string, int: number): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform1i(location, int);
    }

    public setFloat3(uniform: string, float: Vec3 | Colour3): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform3fv(location, float.toArray());
    }

    public setInt3(uniform: string, int: Vec3): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform3iv(location, int.toArray());
    }

    public setFloat4(uniform: string, float: Vec4 | Colour4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform4fv(location, float.toArray());
    }

    public setMat4(uniform: string, mat: Mat4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniformMatrix4fv(location, false, mat.forGL());
    }

    public setInt4(uniform: string, int: Vec4): void {
        const location: WebGLUniformLocation = this.getUniformLocation(uniform);
        this.gl.uniform4iv(location, int.toArray());
    }

    public isAttributeEnabled(attribute: string): boolean {
        return this.enabledAttributes.has(attribute) && this.enabledAttributes.get(attribute);
    }

    public setAttributeArray(attribute: string, buffer: WebGLBuffer, size: number, type: number,
            normalize: boolean = false, stride: number = 0, offset: number = 0): void {
        const location: number = this.getAttributeLocation(attribute);
        this.gl.enableVertexAttribArray(location);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(location, size, type, normalize, stride, offset);
        this.enabledAttributes.set(attribute, true);
    }

    public disableAttributeArray(attribute: string): void {
        if(this.isAttributeEnabled(attribute)) {
            const location: number = this.getAttributeLocation(attribute);
            this.gl.disableVertexAttribArray(location);
            this.enabledAttributes.set(attribute, false);
        }
    }

    public setIndexArray(buffer: WebGLBuffer): void {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}

export class SkyboxShader extends Shader {
    constructor(gl: WebGLRenderingContext) {
        super(gl, WebGLHelper.buildShaderProgram(gl, WebGLHelper.SKYBOX_SHADER));
    }
}

export class LightShader extends Shader {
    private ambient: Colour3;
    private lights: LightSource[] = [];

    constructor(gl: WebGLRenderingContext) {
        super(gl, WebGLHelper.buildShaderProgram(gl, WebGLHelper.LIGHT_SHADER));
    }

    public get requiresNormals(): boolean {
        return true;
    }

    public setUniforms(): void {
        super.setUniforms();
        this.setFloat3('globalAmbient', this.ambient);

        this.setFloat3('cameraPos', this.camera.location);

        for(let i = 0; i < this.lights.length; i++) {
            this.setFloat3(`lights[${i}].specularColour`, this.lights[i].lightSpecularColour);
            this.setFloat3(`lights[${i}].diffuseColour`, this.lights[i].lightDiffuseColour);
            this.setFloat3(`lights[${i}].position`, this.lights[i].lightPosition);
            this.setFloat(`lights[${i}].attenuation`, this.lights[i].lightAttenuation);
        }
    }

    public clear(): void {
        this.lights = [];
    }

    public addLight(light: LightSource): void {
        this.lights.push(light);
    }

    public setAmbient(ambient: Colour3): void {
        this.ambient = ambient;
    }
}

export class SphereTracer extends Shader {
    private ambient: Colour3;
    private planets: number = 0;
    private stars: number = 0;
    private rings: number = 0;

    constructor(gl: WebGLRenderingContext, private rootBody: Body) {
        super(gl, WebGLHelper.buildShaderProgram(gl, WebGLHelper.SPHERE_TRACER));
    }

    public get requiresNormals(): boolean {
        return false;
    }

    public setUniforms(): void {
        const operateOnChildren = (body: Body): void => {
            if(body instanceof Planet) {
                this.setFloat4(`planets[${this.planets}].position`, (body as Planet).position.toVec4(1));
                this.setFloat(`planets[${this.planets}].radius`, (body as Planet).radius);
                this.setFloat4(`planets[${this.planets}].colour`, Vec4.fromArray((body as Planet).colour.toArray()));
                this.planets++;
            } else if(body instanceof Ring) {
                this.setFloat4(`rings[${this.rings}].position`, (body as Ring).position.toVec4(1));
                this.setFloat3(`rings[${this.rings}].normal`, (body as Ring).normal);
                this.setFloat(`rings[${this.rings}].radius`, (body as Ring).innerRadius);
                this.setFloat(`rings[${this.rings}].width`, (body as Ring).outerRadius - (body as Ring).innerRadius);
                this.setFloat4(`rings[${this.rings}].colour`, Vec4.fromArray((body as Ring).innerColour.toArray()));
                this.rings++;
            } else if(body instanceof Star) {
                this.setFloat4(`planets[${this.planets}].position`, (body as Star).position.toVec4(1));
                this.setFloat(`planets[${this.planets}].radius`, (body as Star).radius);
                this.setFloat4(`planets[${this.planets}].colour`, Vec4.fromArray((body as Star).colour.toArray()));
                this.stars++;
            }

            body.getOrbiters().forEach(child => {
                    operateOnChildren(child as Body);
            });
        };
    }
}

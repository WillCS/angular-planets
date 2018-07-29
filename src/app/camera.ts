import { Mat4 } from './math/matrix';
import { Vec3 } from './math/vector';
import { Body } from './objects/body';
import { MathHelper } from './math/mathHelper';
import { Drawable } from './graphics/drawable';
import { Mesh, MeshBuilder } from './graphics/mesh';
import { Colour3 } from './graphics/colour';
import { Renderer } from './graphics/renderer';
import { Ray } from './physics/rayTracer';

export abstract class Camera3D implements Drawable {
    public abstract get location(): Vec3;
    public abstract getLookMatrix(): Mat4;
    public abstract getProjectionMatrix(): Mat4
    public abstract getUpVector(): Vec3;
    public abstract getLookVector(): Vec3;
    public abstract ray(x: number, y: number): Ray;

    public abstract update(): void;

    protected abstract updateProjectionMatrix(): void;

    private mesh: Mesh;
    private arrows: Mesh[] = [];

    protected projectionMatrix: Mat4;
    protected aspectRatio: number;

    constructor(protected width: number, protected height: number, 
            protected nearPlaneDist: number, protected farPlaneDist: number) {

    }

    public set viewportWidth(width: number) {
        this.width = width;
        this.aspectRatio = this.width / this.height;
        this.updateProjectionMatrix();
    }

    public set viewportHeight(height: number) {
        this.height = height;
        this.aspectRatio = this.width / this.height;
        this.updateProjectionMatrix();
    }

    public set nearPlaneDistance(nearDist: number) {
        this.nearPlaneDist = nearDist;
        this.updateProjectionMatrix();
    }

    public set farPlaneDistance(farDist: number) {
        this.farPlaneDist = farDist;
        this.updateProjectionMatrix();
    }

    public draw(renderer: Renderer): void {
        renderer.pushMatrix();

        renderer.modelMatrix = renderer.modelMatrix.translate(this.location.x, this.location.y, this.location.z);
        renderer.modelMatrix = renderer.modelMatrix.scale(10, 10, 10);
        renderer.drawImaginary();
        renderer.draw(this.mesh);

        let up: Vec3 = this.getUpVector().multiply(2);
        renderer.pushMatrix();
        renderer.modelMatrix = renderer.modelMatrix.scale(up.x, up.y, up.z);
        renderer.draw(this.arrows[0]);
        renderer.popMatrix();
        
        let forward: Vec3 = this.getLookVector().negate().multiply(2);
        renderer.pushMatrix();
        renderer.modelMatrix = renderer.modelMatrix.scale(forward.x, forward.y, forward.z);
        renderer.draw(this.arrows[1]);
        renderer.popMatrix();
        
        let right: Vec3 = up.cross(forward).normalize().multiply(2);
        renderer.pushMatrix();
        renderer.modelMatrix = renderer.modelMatrix.scale(right.x, right.y, right.z)
        renderer.draw(this.arrows[2]);
        renderer.popMatrix();

        renderer.popMatrix();
    }

    public initDrawing(gl: WebGLRenderingContext): void {
        this.mesh = MeshBuilder.buildIcosphere(gl, 0, Colour3.eightBit(100, 100, 100));
        this.arrows.push(
            MeshBuilder.buildLines(gl, [new Vec3(0, 0, 0), new Vec3(1, 1, 1)], Colour3.eightBit(0, 255, 0)),
            MeshBuilder.buildLines(gl, [new Vec3(0 ,0 ,0), new Vec3(1, 1, 1)], Colour3.eightBit(0, 0, 255)),
            MeshBuilder.buildLines(gl, [new Vec3(0 ,0 ,0), new Vec3(1, 1, 1)], Colour3.eightBit(255, 0, 0)),
        );
    }
}

export class OrbitalCamera extends Camera3D {
    private focus: Body;
    private focusPos: Vec3;
    private moveSpeed: number = 1;
    private moveAcceleration: number = 1;
    private moveInertia: number = 0;
    private posChanging: boolean = false;

    private distance: number = 1;
    private targetDistance: number;
    private dDistance: number = 1
    private distanceAcceleration: number = 1;
    private distanceInertia: number = 0;
    private distanceChanging: boolean = false;

    public minDistance: number = 0;
    public maxDistance: number = 1;

    private inclination: number = Math.PI / 3;
    private targetInclination: number;
    private dInclination: number = 1;
    private inclinationAcceleration: number = 1;
    private inclinationInertia: number = 0;
    private inclinationChanging: boolean = false;

    private minInclination: number = 0
    private maxInclination: number = Math.PI;

    private azimuth: number = 0;
    private targetAzimuth: number;
    private dAzimuth: number = 1;
    private azimuthAcceleration: number = 1;
    private azimuthInertia: number = 0;
    private azimuthChanging: boolean = false;

    private roll: number = Math.PI / 2;
    private targetRoll: number;
    private dRoll: number = 1;
    private rollAcceleration: number = 1;
    private rollInertia: number = 0;
    private rollChanging: boolean = false;

    constructor(width: number, height: number, nearPlaneDist: number, farPlaneDist: number,
            protected fov: number) {
        super(width, height, nearPlaneDist, farPlaneDist);
        this.aspectRatio = this.width / this.height;
        this.updateProjectionMatrix();
        this.focusPos = Vec3.zero();
    }

    public set FOV(fov: number) {
        this.fov = fov;
        this.updateProjectionMatrix();
    }

    public get focusPosition(): Vec3 {
        if(this.focus) {
            return this.posChanging ? this.focusPos : this.focus.position;
        } else {
            return this.focusPos;
        }
    }

    public get location(): Vec3 {
        let x: number = Math.cos(this.azimuth) * Math.sin(this.inclination);
        let z: number = Math.sin(this.azimuth) * Math.sin(this.inclination);
        let y: number = Math.cos(this.inclination);
        return this.focusPosition.add(new Vec3(x, y, z).multiply(this.distance));
    }

    public update(): void {
        this.azimuth += Math.PI / 300;
        this.updatePosition();
        this.updateDistance();
        this.updateRoll();
        this.updateInclination();
        this.updateAzimuth();
    }

    public ray(x: number, y: number): Ray {
        return undefined;
    } 

    protected updateProjectionMatrix(): void {
        this.projectionMatrix = Mat4.perspectiveProjection(this.fov, this.aspectRatio, this.nearPlaneDist, this.farPlaneDist);
    }

    private updatePosition(): void {
        let epsilon: number = 0.1;
        if(this.posChanging) {
            this.moveInertia += this.moveAcceleration;
            if(this.moveInertia >= this.moveSpeed) {
                this.moveInertia = this.moveSpeed;
            }

            this.focusPos = this.focusPos.add(Vec3.one().multiply(this.moveInertia));
            
            if(this.focusPos.subtract(this.focus.position).length <= epsilon) {
                this.moveInertia = 0;
                this.focusPos = this.focus.position;
                this.posChanging = false;
            }
        }
    }
    
    private updateDistance(): void {
        let epsilon = 0.1;
        if(this.distanceChanging) {
            this.distanceInertia += this.distanceAcceleration;
            if(this.distanceInertia >= this.dDistance) {
                this.distanceInertia = this.dDistance;
            }

            let dir = Math.sign(this.targetDistance - this.distance);

            this.distance += dir * this.distanceInertia;

            if(Math.abs(this.distance - this.targetDistance) <= epsilon) {
                this.distanceInertia = 0;
                this.distance = this.targetDistance;
                this.distanceChanging = false;
            }
        }
    }
        
    private updateInclination(): void {
        let epsilon = 0.1;
        if(this.inclinationChanging) {
            this.inclinationInertia += this.inclinationAcceleration;
            if(this.inclinationInertia >= this.dInclination) {
                this.inclinationInertia = this.dInclination;
            }

            let dir = Math.sign(this.targetInclination - this.inclination);

            this.inclination += dir * this.inclinationInertia;

            if(Math.abs(this.inclination - this.targetInclination) <= epsilon) {
                this.inclinationInertia = 0;
                this.inclination = this.targetInclination;
                this.inclinationChanging = false;
            }
        }
    }
        
    private updateAzimuth(): void {
        let epsilon = 0.1;
        if(this.azimuthChanging) {
            this.azimuthInertia += this.azimuthAcceleration;
            if(this.azimuthInertia >= this.dAzimuth) {
                this.azimuthInertia = this.dAzimuth;
            }
            
            let dir = Math.sign(Math.atan2(
                    Math.sin(this.targetAzimuth - this.azimuth),
                    Math.cos(this.targetAzimuth - this.azimuth)));

            this.azimuth += dir * this.azimuthInertia;

            if(Math.abs(this.azimuth - this.targetAzimuth) <= epsilon) {
                this.azimuthInertia = 0;
                this.azimuth = this.targetAzimuth;
                this.azimuthChanging = false;
            }
        }
    }
        
    private updateRoll(): void {
        let epsilon = 0.1;
        if(this.rollChanging) {
            this.rollInertia += this.rollAcceleration;
            if(this.rollInertia >= this.dRoll) {
                this.rollInertia = this.dRoll;
            }
            
            let dir = Math.sign(this.targetRoll - this.roll);

            this.roll += dir * this.rollInertia;

            if(Math.abs(this.roll - this.targetRoll) <= epsilon) {
                this.rollInertia = 0;
                this.roll = this.targetRoll;
                this.rollChanging = false;
            }
        }
    }

    public getLookMatrix(): Mat4 {
        let matrix: Mat4 = Mat4.identity();
        matrix = matrix.rotateZ(Math.PI / 2 - this.roll);
        matrix = matrix.rotateX(Math.PI / 2 - this.inclination);
        matrix = matrix.rotateY(this.azimuth - Math.PI / 2);
        matrix = matrix.translate(-this.location.x, -this.location.y, -this.location.z);

        return matrix;
    }

    public getProjectionMatrix(): Mat4 {
        return this.projectionMatrix;
    }
    
    /** If the camera were a physical object in the world, this returns the vector pointing
     *  directly out of the top of it. We do some fun linear algebra to get this. 
     *  UpVector = Cross product of the NormalVector at the location of the camera on the 
     *             sphere around the focus and a vector representing a location on the sphere
     *             with azimuth 90 degrees greater than the camera's and an inclination equal
     *             to that of the camera's roll.
     *  Thanks to Tina for helping me figure this out! <3
     */
    public getUpVector(): Vec3 {
        let sphereNormal: Vec3 = this.getLookVector().negate();
        let localAzimuth: number = this.azimuth - (Math.PI / 2);
        let bisectNormal: Vec3 = new Vec3(
                Math.cos(localAzimuth) * Math.sin(this.roll),
                Math.cos(this.roll),
                Math.sin(localAzimuth) * Math.sin(this.roll));
        return sphereNormal.cross(bisectNormal).normalize();
    }

    public getLookVector(): Vec3 {
        return this.focusPosition.subtract(this.location).normalize();
    }
    
    public lookAt(focus: Body, smoothly: boolean = true): void {
        this.focus = focus;
        if(smoothly) {
            this.posChanging = true;
        } else {
            this.focusPos = this.focus.position;
        }
    }

    public getFocus(): Body {
        return this.focus;
    }

    public incrementRoll(angle: number, smoothly: boolean = true): void {
        this.setRoll(this.targetRoll + angle, smoothly);
    }

    public setRoll(angle: number, smoothly: boolean = true): void {
        this.targetRoll = angle;
        if(smoothly) {
            this.rollChanging = true;
        } else {
            this.roll = angle;
        }
    }

    public incrementDistance(distance: number, smoothly: boolean = true): void {
        this.setDistance(this.targetDistance + distance, smoothly);
    }

    public setDistance(distance: number, smoothly: boolean = true): void {
        let clampedDistance = MathHelper.clamp(distance, this.minDistance, this.maxDistance);
        this.targetDistance = clampedDistance;
        if(smoothly) {
            this.distanceChanging = true;
        } else {
            this.distance = clampedDistance;
        }
    }

    public incrementInclination(inclination: number, smoothly: boolean = true): void {
        this.setInclination(this.targetInclination + inclination, smoothly);
    }

    public setInclination(inclination: number, smoothly: boolean = true): void {
        let clampedInclination = MathHelper.clamp(inclination, 
                this.minInclination, this.maxInclination);
        this.targetInclination = clampedInclination;
        if(smoothly) {
            this.inclinationChanging = true;
        } else {
            this.inclination = clampedInclination;
        }
    }

    public incrementAzimuth(azimuth: number, smoothly: boolean = true): void {
        this.setAzimuth(this.targetAzimuth + azimuth, smoothly);
    }

    public setAzimuth(azimuth: number, smoothly: boolean = true): void {
        let normalisedAzimuth = azimuth % (Math.PI * 2);
        this.targetAzimuth = normalisedAzimuth;
        if(smoothly) {
            this.azimuthChanging = true;
        } else {
            this.azimuth = normalisedAzimuth;
        }
    }
}
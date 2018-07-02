import { Mat4 } from './math/mat4';
import { Vec3 } from './math/vec3';
import { Vec4 } from './math/vec4';
import { Body } from './objects/body';
import { MathHelper } from './math/mathHelper';

export module Camera {
    export abstract class Camera3D {
        public abstract get location(): Vec3;
        public abstract getLookMatrix(): Mat4;
        public abstract getUpVector(): Vec3;

        public abstract update(): void;
    }
    
    export class OrbitalCamera extends Camera3D {
        private focus: Body;
        private focusPos: Vec3;
        private moveSpeed: number = 1;
        private moveAcceleration: number = 1;
        private moveInertia: number;
        private posChanging: boolean = false;

        private distance: number;
        private targetDistance: number;
        private dDistance: number = 1
        private distanceAcceleration: number = 1;
        private distanceInertia: number;
        private distanceChanging: boolean = false;

        public minDistance: number = 0;
        public maxDistance: number;

        private inclination: number;
        private targetInclination: number;
        private dInclination: number = 1;
        private inclinationAcceleration: number = 1;
        private inclinationInertia: number;
        private inclinationChanging: boolean = false;

        private minInclination: number = 0;
        private maxInclination: number = Math.PI;

        private azimuth: number;
        private targetAzimuth: number;
        private dAzimuth: number = 1;
        private azimuthAcceleration: number = 1;
        private azimuthInertia: number;
        private azimuthChanging: boolean = false;

        private roll: number;
        private targetRoll: number;
        private dRoll: number = 1;
        private rollAcceleration: number = 1;
        private rollInertia: number;
        private rollChanging: boolean = false;

        public get focusPosition(): Vec3 {
            if(this.focus) {
                return this.posChanging ? this.focusPos : this.focus.position;
            } else {
                return this.focusPos;
            }
        }

        public get location(): Vec3 {
            let x: number = Math.sin(this.azimuth) * Math.cos(this.inclination);
            let y: number = Math.sin(this.azimuth) * Math.sin(this.azimuth);
            let z: number = Math.cos(this.azimuth);
            return this.focusPosition.add(new Vec3(x, y, z).multiply(this.distance));
        }

        public update(): void {
            this.updatePosition();
            this.updateDistance();
            this.updateRoll();
            this.updateInclination();
            this.updateAzimuth();
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
                    this.roll = this.targetRoll;
                    this.rollChanging = false;
                }
            }
        }

        public getLookMatrix(): Mat4 {
            let z: Vec3 = this.location.subtract(this.focusPosition).normalize();
            let y: Vec3 = this.getUpVector();
            let x: Vec3 = y.cross(z).normalize();
            y = z.cross(x).normalize();

            return Mat4.fromRowVectors(x.toVec4(), y.toVec4(), z.toVec4(), new Vec4(0, 0, 0, 1));
        }
        
        public getUpVector(): Vec3 {
            let sphereNormal: Vec3 = this.location.subtract(this.focusPosition);
            let localAzimuth: number = this.azimuth + (Math.PI / 2);
            let bisectNormal: Vec3 = new Vec3(Math.sin(localAzimuth), 0, Math.cos(localAzimuth));
            return sphereNormal.cross(bisectNormal).normalize();
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
}
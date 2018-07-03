import { Component, OnInit, ElementRef } from '@angular/core';

import { WebGLHelper } from './graphics/webGLHelper';
import { Mat4 } from './math/mat4';
import { Drawable } from './graphics/drawable';
import { Ring, Orbit } from './objects/orbiter';
import { Vec3 } from './math/vec3';
import { Body, Star } from './objects/body';
import { Camera3D, OrbitalCamera } from './camera';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  sliderMinValue: number = 0;
  sliderMaxValue: number = 100;
  sliderValue: number = 50;

  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: OrbitalCamera;

  constructor(private elementRef: ElementRef) {
    
  }

  private shaderProgram: WebGLProgram;
  private object: Body;

  ngOnInit(): void {
    // Initialise our drawing environment
    this.canvas = this.elementRef.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.canvas.width = 1000;
    this.canvas.height = 1000;
    this.gl = WebGLHelper.setupCanvas(this.canvas);

    let body = new Star(Vec3.zero(), 0, Math.PI / 30, 50, new Vec3(255, 255, 0));
    body.addOrbiter(new Ring(65, 95, Math.PI / 300, new Vec3(0, 0, 0), 0, Math.PI * 1.75));
    body.addOrbiter(new Orbit(new Star(Vec3.zero(), 0, 0, 10, new Vec3(0, 0, 255)), 120, Math.PI / 2500, new Vec3(0, 0, Math.PI / 3)));

    this.object = body;
    this.object.initDrawing(this.gl);

    this.camera = new OrbitalCamera();
    this.camera.lookAt(body, false);
    this.camera.setDistance(60, false);

    this.shaderProgram = WebGLHelper.buildShaderProgram(this.gl);

    // Get ready to draw
    this.lastTime = performance.now();
    window.requestAnimationFrame((t: number) => this.doLoop(t));
  }

  private tps: number = 30;
  private dt: number = 1 / this.tps;
  private accumulator: number = 0;
  private lastTime: number;

  private doLoop(frameTime: number): void {
    let elapsedTime = frameTime - this.lastTime;
    if(elapsedTime >= this.dt) {
      this.accumulator += elapsedTime;
    }

    this.lastTime = frameTime;

    if(this.accumulator >= 5 * this.dt) {
      this.accumulator = 5 * this.dt;
    }

    while(this.accumulator >= this.dt) {
      this.accumulator -= this.dt;
      this.object.update();
    }

    this.camera.update();
    this.draw();
    window.requestAnimationFrame((t: number) => this.doLoop(t));
  }

  private draw(): void {
    //WebGLHelper.resizeCanvasToElementSize(this.canvas);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.gl.useProgram(this.shaderProgram);
    
    let aspect: number = this.canvas.clientWidth / this.canvas.clientHeight;
    let matrix: Mat4 = Mat4.perspectiveProjection(Math.PI / 2, aspect, 1, 400);
    //let matrix: Mat4 = Mat4.orthographicProjection(this.canvas.width, this.canvas.height, 1, 400);
    matrix = matrix.translate(0, -10, -200);
    matrix = matrix.rotateX((this.sliderValue / 100) * Math.PI * 2);
    //matrix = matrix.translate(-50, 0, -15);

    //matrix.multiply(this.camera.getLookMatrix());
    
    this.object.draw(this.gl, this.shaderProgram, matrix);
  }
}

import { Component, OnInit, ElementRef } from '@angular/core';

import { WebGLHelper } from './graphics/webGLHelper';
import { Mat4 } from './math/mat4';
import { Ring, Orbit } from './objects/orbiter';
import { Vec3 } from './math/vector';
import { Body, Star } from './objects/body';
import { OrbitalCamera } from './camera';
import { Axes } from './objects/axes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  sliderMinValue: number = 0;
  sliderMaxValue: number = 100;
  azimuthValue: number = 25;
  inclinationValue: number = 25;
  rollValue: number = 0;
  distanceMinValue: number = 30;
  distanceMaxValue: number = 600;
  distanceValue: number = 200;

  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: OrbitalCamera;
  private axes: Axes;

  constructor(private elementRef: ElementRef) {
    
  }

  private shaderProgram: WebGLProgram;
  private object: Body;
  private moon: Body;

  ngOnInit(): void {
    // Initialise our drawing environment
    this.canvas = this.elementRef.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.canvas.width = 1000;
    this.canvas.height = 1000;
    this.gl = WebGLHelper.setupCanvas(this.canvas);

    let body = new Star(Vec3.zero(), 0, Math.PI / 30, 50, new Vec3(255, 255, 0));
    body.addOrbiter(new Ring(65, 95, 0, new Vec3(0, 0, 0), 
        new Vec3(150, 50, 50), new Vec3(150, 80, 80)));
    this.moon = new Star(Vec3.zero(), 0, 0, 10, new Vec3(0, 0, 255));
    body.addOrbiter(new Orbit(this.moon, body, 120, Math.PI / 2500, new Vec3(0, 0, Math.PI / 3)));

    this.object = body;
    this.object.initDrawing(this.gl);

    this.camera = new OrbitalCamera();
    this.camera.initDrawing(this.gl);
    this.camera.minDistance = 30;
    this.camera.maxDistance = 500;
    this.camera.lookAt(this.moon, false);
    this.camera.setDistance(200, false);

    this.axes = new Axes(0);
    this.axes.initDrawing(this.gl);

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
    this.camera.setInclination(this.inclinationValue * Math.PI / 100, false);
    this.camera.setAzimuth(this.azimuthValue * 2 * Math.PI / 100, false);
    this.camera.setRoll(Math.PI / 2 + this.rollValue * 2 * Math.PI / 100, false);
    this.camera.setDistance(this.distanceValue, false);
    this.draw();
    window.requestAnimationFrame((t: number) => this.doLoop(t));
  }

  private draw(): void {
    //WebGLHelper.resizeCanvasToElementSize(this.canvas);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.gl.useProgram(this.shaderProgram);
    
    let aspect: number = this.canvas.clientWidth / this.canvas.clientHeight;
    let matrix: Mat4 = Mat4.perspectiveProjection(Math.PI / 2, aspect, 1, 1000);
    //let matrix: Mat4 = Mat4.orthographicProjection(this.canvas.width, this.canvas.height, 1, 400);
    //matrix = matrix.translate(0, -10, -200);
    //matrix = matrix.rotateX((this.azimuthValue / 100) * Math.PI * 2);
    //matrix = matrix.rotateY(-Math.PI / 4);
    //matrix = matrix.translate(-50, 0, -15);

    matrix = matrix.multiply(this.camera.getLookMatrix());
    
    this.camera.draw(this.gl, this.shaderProgram, matrix);
    this.axes.draw(this.gl, this.shaderProgram, matrix);
    this.object.draw(this.gl, this.shaderProgram, matrix);
  }
}

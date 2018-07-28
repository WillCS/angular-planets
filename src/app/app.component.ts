import { Component, OnInit, ElementRef } from '@angular/core';

import { WebGLHelper } from './graphics/webGLHelper';
import { Mat4 } from './math/matrix';
import { Vec3 } from './math/vector';
import { Body, Star, Planet } from './objects/body';
import { OrbitalCamera } from './camera';
import { Axes } from './objects/axes';
import { PlanetService } from './planet.service';
import { Shader, SkyboxShader, LightShader } from './graphics/shader';
import { Skybox } from './graphics/skybox';
import { Colour3 } from './graphics/colour';
import { Ring } from './objects/ring';
import { Orbit } from './objects/orbit';
import { Renderer } from './graphics/renderer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  sliderMinValue: number = 0;
  sliderMaxValue: number = 100;
  azimuthValue: number = 25;
  inclinationValue: number = 40;
  rollValue: number = 0;
  distanceMinValue: number = 50;
  distanceMaxValue: number = 8000;
  distanceValue: number = 1800;

  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: OrbitalCamera;
  private axes: Axes;

  constructor(private elementRef: ElementRef, private planetService: PlanetService) {
    
  }
  private renderer: Renderer;

  private skybox: Skybox;
  private skyboxShader: Shader;
  
  private object: Body;
  private rings: number[] = [
    175, 195, 42, 40, 31, 42, 40, 31,
    195, 230, 107, 102, 80, 155, 145, 102,
    230, 235, 109, 104, 81, 109, 104, 81,
    235, 240, 179, 171, 130, 193, 182, 127,
    242, 290, 171, 161, 104, 132, 125, 88,
    290, 310, 132, 125, 88, 156, 148, 103,
    320, 345, 172, 164, 108, 180, 176, 126,
    350, 360, 154, 146, 104, 189, 180, 138,
    370, 371, 186, 180, 118, 186, 180, 118
  ];

  ngOnInit(): void {
    // Initialise our drawing environment
    this.canvas = this.elementRef.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.canvas.height = 1000;
    this.gl = WebGLHelper.setupCanvas(this.canvas);

    let sun: Star = Star.withLocation(Vec3.zero(), 0, Math.PI / 3000, 500, Colour3.normal(1, 1, 1), Vec3.zero());
    let saturnOrbit: Orbit = Orbit.circular(5000, 0, 0, 0, (epoch: number) => epoch);
    let saturn: Planet = new Planet(new Vec3(0, 0, 0), 0, Math.PI / 30, 150, Colour3.eightBit(255, 216, 167), saturnOrbit, sun);

    for(let i = 1; i < 9; i++) {
      saturn.addOrbiter(new Ring(this.rings[i * 8], this.rings[i * 8 + 1], new Vec3(0, 0, Math.PI / 18), 0, 
          Colour3.eightBit(this.rings[i * 8 + 2], this.rings[i * 8 + 3], this.rings[i * 8 + 4]), 
          Colour3.eightBit(this.rings[i * 8 + 5], this.rings[i * 8 + 6], this.rings[i * 8 + 7])));
    }

    this.planetService.addBody(sun);

    this.object = sun;
    this.object.initDrawing(this.gl);

    let aspect: number = this.canvas.clientWidth / this.canvas.clientHeight;
    let projection: Mat4 = Mat4.perspectiveProjection(Math.PI / 3, aspect, 1, 50000)

    this.camera = new OrbitalCamera(projection);
    this.camera.minDistance = 50;
    this.camera.maxDistance = 8000;
    this.camera.lookAt(saturn, false);
    this.camera.setDistance(200, false);

    this.axes = new Axes(0);
    this.axes.initDrawing(this.gl);

    //this.shader = new Shader(this.gl, WebGLHelper.buildShaderProgram(this.gl, WebGLHelper.DEFAULT_SHADER));
    let primaryShader: LightShader = new LightShader(this.gl);
    primaryShader.setAmbient(Colour3.eightBit(0, 0, 0));
    primaryShader.addLight(sun);
    primaryShader.setCamera(this.camera);

    let defaultShader: WebGLProgram = WebGLHelper.buildShaderProgram(this.gl, WebGLHelper.DEFAULT_SHADER);

    let secondaryShader: Shader = new Shader(this.gl, defaultShader);
    secondaryShader.setCamera(this.camera);

    this.renderer = new Renderer(this.gl, primaryShader, secondaryShader);

    this.skyboxShader = new SkyboxShader(this.gl);
    this.skyboxShader.setCamera(this.camera);
    this.skybox = new Skybox(this.gl);

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
    WebGLHelper.resizeCanvasToWindowSize(this.canvas);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.skybox.draw(this.skyboxShader);
    
    this.renderer.beginDrawing();

    this.renderer.pushMatrix();
    this.object.draw(this.renderer);
    this.renderer.popMatrix();
  }
}

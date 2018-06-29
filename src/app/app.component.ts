import { Component, OnInit, ElementRef } from '@angular/core';

import { WebGLHelper } from './webGLHelper';
import { Mat4 } from './math/mat4';
import { ICOSPHERE } from './icosphere';

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

  constructor(private elementRef: ElementRef) {
  }

  private positionBuffer: WebGLBuffer;
  private positionLocation: number;
  private colourBuffer: WebGLBuffer;
  private colourLocation: number;
  private matrixLocation: WebGLUniformLocation;
  private shaderProgram: WebGLProgram;

  ngOnInit(): void {
    // Initialise our drawing environment
    this.canvas = this.elementRef.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.canvas.width = 1000;
    this.canvas.height = 1000;
    this.gl = WebGLHelper.setupCanvas(this.canvas);

    this.shaderProgram = WebGLHelper.buildShaderProgram(this.gl);

    this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
    this.colourLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_colour');

    this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.setGeometry(this.gl);

    this.colourBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
    this.setColors(this.gl);

    // Get ready to draw
    this.lastTime = performance.now();
    window.requestAnimationFrame((t: number) => this.doLoop(t));
  }

  private tps: number = 30;
  private dt: number = 1 / this.tps;
  private accumulator: number;
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
      // update
    }

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

    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    let pSize: number = 3;
    let pType: number = this.gl.FLOAT;
    let pNormalize: boolean = false;
    let pStride: number = 0;
    let pOffset: number = 0;
    this.gl.vertexAttribPointer(this.positionLocation, pSize, pType, pNormalize, pStride, pOffset);

    this.gl.enableVertexAttribArray(this.colourLocation);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);

    let cSize: number = 3;
    let cType: number = this.gl.UNSIGNED_BYTE;
    let cNormalize: boolean = true;
    let cStride: number = 0;
    let cOffset: number = 0;
    this.gl.vertexAttribPointer(this.colourLocation, cSize, cType, cNormalize, cStride, cOffset);

    let aspect: number = this.canvas.clientWidth / this.canvas.clientHeight;
    let matrix: Mat4 = Mat4.perspectiveProjection(Math.PI / 2, aspect, 1, 400);
    //let matrix: Mat4 = Mat4.orthographicProjection(this.canvas.width, this.canvas.height, 1, 400);
    matrix = matrix.translate(0, 50, -200);
    matrix = matrix.scale(20, 20, 20);
    matrix = matrix.rotateX((this.sliderValue / 100) * Math.PI * 2);
    matrix = matrix.rotateX((21 / 100) * 2 * Math.PI);
    //matrix = matrix.translate(-50, 0, -15);

    this.gl.uniformMatrix4fv(this.matrixLocation, false, matrix.forGL());

    let primitiveType: number = this.gl.TRIANGLES;
    let offset: number = 0;
    let count: number = 20 * 3;
    this.gl.drawArrays(primitiveType, offset, count);
  }

  private setGeometry(gl: WebGLRenderingContext): void {
    gl.bufferData(
        gl.ARRAY_BUFFER, new Float32Array(ICOSPHERE),
        gl.STATIC_DRAW);
  }
  
  // Fill the buffer with colors for the 'F'.
  private setColors(gl): void {
    let colours: number[] = [];
    for(let i = 0; i < 180; i++) {
      colours.push(Math.floor(Math.random() * 255));
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colours), gl.STATIC_DRAW);
    return;
  }
}

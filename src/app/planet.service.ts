import { Injectable } from '@angular/core';
import { Body } from './objects/body';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {
  private bodies: Body[] = [];

  public getBodies(): Body[] {
    return this.bodies;
  }

  public addBody(body: Body): void {
    this.bodies.push(body);
  }

  public removeBody(body: Body): void {
    if(this.bodies.includes(body)) {
      let index: number = this.bodies.indexOf(body);
      this.bodies.splice(index, 1);
    }
  }
}

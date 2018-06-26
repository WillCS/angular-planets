import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit {
  @Input()
  minValue: number;

  @Input()
  maxValue: number;

  private sliderValue: number;

  private mouseX: number;
  private mouseDownX: number;

  @Input()
  set value(num: number) {
    this.sliderValue = num;
    this.valueChange.emit(this.sliderValue);
  }

  get value() {
    return this.sliderValue;
  }

  @Output()
  valueChange: EventEmitter<number> = new EventEmitter<number>();

  constructor() {

  }

  ngOnInit(): void {

  }

  mouseMoved($event: MouseEvent) {
    //this.mouseX = $event.offsetX;
    this.value = $event.offsetX;
  }

  /*mouseDown($event: MouseEvent) {
    this.mouseDownX = $event.offsetX;
  }*/
}

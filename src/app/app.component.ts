import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sliderMinValue: number = 0;
  sliderMaxValue: number = 100;
  sliderValue: number = 10;
}

import { Component, OnInit } from '@angular/core';
import { PlanetService } from '../planet.service';
import { Body } from '../objects/body';

@Component({
  selector: 'app-tree-viewer',
  templateUrl: './tree-viewer.component.html',
  styleUrls: ['./tree-viewer.component.css']
})
export class TreeViewerComponent implements OnInit {
  public bodies: Body[];

  constructor(private planetService: PlanetService) { }

  ngOnInit() {
    this.bodies = this.planetService.getBodies();
  }

}

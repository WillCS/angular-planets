import { Component, OnInit, Input } from '@angular/core';
import { Listable } from '../listable';
import { Body } from '../objects/body';

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.css']
})
export class TreeNodeComponent implements OnInit {
  public object: Listable;
  private _collapsed: boolean = true;

  @Input()
  set value(value: Listable) {
    this.object = value;
  }

  get collapsed(): boolean {
    return this.hasSubNodes && this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
  }

  get hasSubNodes(): boolean {
    return this.getSubNodes().length != 0;
  }

  constructor() { }

  ngOnInit() {
    
  }

  getSubNodes(): Listable[] {
    if(this.object instanceof Body) {
      return (this.object as Body).getOrbiters();
    }
    return [];
  }
}

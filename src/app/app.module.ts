import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RenderTargetComponent } from './render-target/render-target.component';
import { TreeViewerComponent } from './tree-viewer/tree-viewer.component';
import { TreeNodeComponent } from './tree-node/tree-node.component';

@NgModule({
  declarations: [
    AppComponent,
    RenderTargetComponent,
    TreeViewerComponent,
    TreeNodeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

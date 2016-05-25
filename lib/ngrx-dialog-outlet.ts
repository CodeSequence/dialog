import {
    ViewContainerRef,
    Component,
    Attribute
} from '@angular/core';
import { OutletRegistry } from './outlet-registry';

@Component({
  selector: 'ngrx-dialog-outlet',
  template: ``
})
export class NGRXDialogOutlet {
  constructor(
    @Attribute('name') private _name: string,
    private _registry: OutletRegistry,
    private _container: ViewContainerRef
  ) { }

  ngOnInit() {
    this._registry.register(this._name, this._container);
  }
}
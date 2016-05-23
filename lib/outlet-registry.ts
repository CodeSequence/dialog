import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable()
export class OutletRegistry {
  private registry: any = {};
  
  register(name: string, component: ViewContainerRef) {
      this.registry[name] = component;
  }
  
  getOutlet(name: string) {
      return this.registry[name];
  }
}
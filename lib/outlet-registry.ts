import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable()
export class OutletRegistry {
  private registry: Map<string, ViewContainerRef> = new Map<string, ViewContainerRef>();

  register(name: string, component: ViewContainerRef) {
      this.registry.set(name, component);
  }

  unregister(name: string) {
      this.registry.delete(name);
  }

  getOutlet(name: string): ViewContainerRef {
      return this.registry.get(name);
  }
}
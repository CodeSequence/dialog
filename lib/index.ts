import { Observable, Observer, Subscriber } from 'rxjs';
import {
        ComponentResolver,
        Injectable,
        EventEmitter,
        Provider,
        ReflectiveInjector
} from '@angular/core';
import { OutletRegistry } from './outlet-registry';

// The Dialog service is very simple. It can open a component
// that implements the Closeable interface inside the named outlet
@Injectable()
export class DialogService {
    constructor(
        private _compiler: ComponentResolver,
        private _registry: OutletRegistry
    ) {}

    open<T>(cmp: CloseableType<T>, outlet: string, options?: OpenOptions): Observable<T> {
        options = options || {};
        const outletViewContainer = this._registry.getOutlet(outlet);
        const injector = ReflectiveInjector.resolveAndCreate(options.providers || [], options.injector || outletViewContainer.injector);

        return Observable.of(cmp)
          .mergeMap(cmp => this._compiler.resolveComponent(cmp))
          .map(cmp => outletViewContainer.createComponent(cmp, null, injector))
          .switchMap(ref => {
            const cleanup = () => {
              this._registry.unregister(outlet);
              ref.destroy();
            };
            const { close, dismiss } = ref.instance;
            const close$ = close.take(1);
            const dismiss$ = !!dismiss
              ? dismiss.mergeMap(val => Observable.throw(val))
              : Observable.empty();

              return new Observable<T>((subscriber: Subscriber<T>) => {
                const subscription = Observable.merge(close$, dismiss$)
                  .finally(cleanup)
                  .subscribe(subscriber);

                  return () => {
                    subscription.unsubscribe();
                    cleanup();
                  };
              });
          });
    }
}

// By default, a component that wants to be opened must
// implement the Closeable<T> interface, where T is the type
// of the value it will resolve from the user
export interface Closeable<T> {
  close: Observable<T> | EventEmitter<T>;
}

// Opened components can also dismiss themselves. The consumer
// will see this as an error in the observable stream
export interface Dismissable {
  dismiss: Observable<any> | EventEmitter<any>;
}

// Internal type to declare a class that implements Closeable<T>
export interface CloseableType<T> {
  new (...args: any[]): Closeable<T>;
}

// Additional options that can be passed to the open method
export interface OpenOptions {
  // Observer for the opening of the modal
  open?: Observer<boolean>;

  // Observer for the closing of the modal. Emits on close or dismiss.
  close?: Observer<boolean>;

  // Array of providers to be used to create the component
  providers?: any[];

  // Injector to be used to create the component
  injector?: any;
}

// All options normalized into an open instruction
export interface OpenInstruction<T> {
  component: CloseableType<T>;
  outlet: string;
  open: Observer<boolean>;
  close: Observer<boolean>;
  providers: any[];
}

export const DIALOG_PROVIDERS = [
  new Provider(DialogService, { useClass: DialogService })
];
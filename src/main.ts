import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { expenseReducer } from './app/components/store/expense.reducer';
import { categoryReducer } from './app/components/store/category.reducer';
import { provideStore } from '@ngrx/store';
import { CategoryEffects } from './app/components/store/category.effects';
import { provideEffects } from '@ngrx/effects';
import { TimeagoModule } from 'ngx-timeago';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideStore({ expenses: expenseReducer, categories: categoryReducer }), 
    provideEffects([CategoryEffects]),
    importProvidersFrom(TimeagoModule.forRoot()) // Use TimeagoModule.forRoot() here
  ],
});

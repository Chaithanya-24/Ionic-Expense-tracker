import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { expenseReducer } from './app/components/store/expense.reducer';
import { categoryReducer } from './app/components/store/category.reducer';
import { provideStore } from '@ngrx/store';
import { CategoryEffects } from './app/components/store/category.effects';
import { provideEffects } from '@ngrx/effects';
import { TimeagoModule } from 'ngx-timeago';
import { importProvidersFrom } from '@angular/core';
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideStore({ expenses: expenseReducer, categories: categoryReducer }),
    provideRouter(routes), 
    provideEffects([CategoryEffects]),
    importProvidersFrom(TimeagoModule.forRoot()) // Use TimeagoModule.forRoot() here
  ],
});

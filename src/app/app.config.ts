import { ApplicationConfig, LOCALE_ID } from '@angular/core'; //Define localizacion
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import localeEs from '@angular/common/locales/es-AR';  // Localización de Argentina
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {  SpinnerInterceptor } from './interceptors/spinner.interceptor';
import { registerLocaleData } from '@angular/common';

// Registrar la localización de Argentina (o la que necesites)
registerLocaleData(localeEs, 'es-ES');

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([SpinnerInterceptor])
    ),
    provideAnimations(),
    provideAnimationsAsync(),
    provideToastr({timeOut: 1500, preventDuplicates: false}),
    {provide: LOCALE_ID, useValue: "es-ES"},
  ]
};

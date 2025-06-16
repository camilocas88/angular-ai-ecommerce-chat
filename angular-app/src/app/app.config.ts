import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
    RouteReuseStrategy,
    provideRouter,
    withViewTransitions,
} from '@angular/router';
import { provideFetchApi } from '@ngx-templates/shared/fetch';
import { provideWindow } from '@ngx-templates/shared/services';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_ROUTES } from './app.routes';
import { CartService } from './data-access/cart.service';
import { CategoriesService } from './data-access/categories.service';
import { ProductsService } from './data-access/products.service';
import { CachedRouteReuseStrategy } from './shared/cached-route-reuse-strategy.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES, withViewTransitions()),
    provideAnimations(),
    provideFetchApi(),
    provideWindow(),
    CategoriesService,
    ProductsService,
    CartService,
    {
      provide: RouteReuseStrategy,
      useClass: CachedRouteReuseStrategy,
    },
    provideHttpClient(withFetch())
  ],
};

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Common } from './common';
import { Environment } from './env-types';

export const environment: Environment = {
  ...Common,
  apiUrl: 'http://localhost:4200/api',
  imageCdnUrl: '',
};

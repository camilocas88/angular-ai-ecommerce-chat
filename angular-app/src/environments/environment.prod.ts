import { Common } from './common';
import { Environment } from './env-types';

export const environment: Environment = {
  ...Common,
  apiUrl: '/api',
  imageCdnUrl: '',
};

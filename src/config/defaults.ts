import type { ShipcheckConfig } from '../types/index.js';

export const defaultConfig: ShipcheckConfig = {
  agent: 'auto',
  rules: {},
  include: [],
  exclude: [],
};

import pkg from '../package.json';
import { North } from '@zblock/north';

export const config = {
  sentry: {
    dsn: "https://6e894eb3d9e84139b61d8489e303f835@www.tipsyblock.com/2",
    tracesSampleRate: 1.0,
    release: `${pkg.name}@${pkg.version}`
  },
  ga: {
    code: 'test',
    debug: false,
  }
};

const north = new North(config);
export default north;
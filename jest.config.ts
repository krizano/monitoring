import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: [
    '**/?(*.)+(spec|test).ts',
  ],
  // collectCoverage: true,
};

export default config;

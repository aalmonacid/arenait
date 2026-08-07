import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

export const config = defineConfig({
  name: 'default',
  title: 'ArenaIT',

  projectId: 'xbayv7k2',
  dataset: 'production',
  basePath: '/admin',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
});

export default config;

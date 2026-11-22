import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes, SINGLETON_TYPES } from './schemas';
import { structure } from './schemas/structure';

export const config = defineConfig({
  name: 'default',
  title: 'Arena IT',

  projectId: 'xbayv7k2',
  dataset: 'production',
  basePath: '/admin',

  plugins: [structureTool({ structure })],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Los documentos únicos no se crean desde el menú «+ Crear»: ya existen
    // (o se abren desde la lista de la izquierda).
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((option) => !SINGLETON_TYPES.includes(option.templateId))
        : prev,
    // Y no se pueden duplicar, despublicar ni borrar.
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.includes(schemaType)
        ? prev.filter(({ action }) => action && !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev,
  },
});

export default config;

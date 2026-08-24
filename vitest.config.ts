import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    // No hay lógica pura que testear unitariamente hoy (el TcoCalculator, el
    // único caso, se eliminó — ver AGENTS.md/CONTEXT.md). Sin esto, `vitest run`
    // sale con código 1 al no encontrar archivos, lo cual es un estado
    // esperado, no un fallo real.
    passWithNoTests: true,
  },
});

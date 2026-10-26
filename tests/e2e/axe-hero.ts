import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function analizarAxe(page: Page) {
  const resultado = await new AxeBuilder({ page }).analyze();
  const violaciones = await Promise.all(
    resultado.violations.map(async (violacion) => {
      if (violacion.id !== 'color-contrast') return violacion;
      // Las ventanas son arte decorativo (WCAG 1.4.3): solo se filtra su contraste.
      const nodos = await Promise.all(
        violacion.nodes.map(async (nodo) => {
          const esArte = await page.evaluate((selector) => {
            const elemento = document.querySelector(String(selector));
            return (
              elemento?.closest('[data-hero-arte]') !== null &&
              elemento !== null
            );
          }, nodo.target[0]);
          return esArte ? null : nodo;
        }),
      );
      const restantes = nodos.filter((nodo) => nodo !== null);
      return restantes.length ? { ...violacion, nodes: restantes } : null;
    }),
  );
  return {
    ...resultado,
    violations: violaciones.filter((violacion) => violacion !== null),
  };
}

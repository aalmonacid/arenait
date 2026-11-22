import type { SiteSettings } from '../../types/sanity';

/**
 * Respaldo de los ajustes del sitio (documento `siteSettings` en Sanity).
 * Texto acordado con el cliente (SiteBenchmark, 22/11/2026).
 */
export const fallbackSiteSettings: SiteSettings = {
  siteName: 'Arena IT',
  tagline: 'Arena IT · Tecnología para la operación diaria.',
  defaultDescription:
    'Desde 2013, software a la medida, procesos en Bizagi e inteligencia artificial para organizaciones públicas y privadas en Colombia.',
  whatsappNumber: '573002156898',
  whatsappMessage: 'Hola, quiero saber más sobre los servicios de Arena IT.',
  managerName: 'Andrés Arenas',
  managerRole: 'Gerente',
  sectors: [
    {
      key: 'seguros',
      label: 'Seguros',
      description:
        'implementación y soporte de procesos en Bizagi, desarrollo a la medida y arquitectura de portales web.',
    },
    {
      key: 'financiero',
      label: 'Financiero',
      description: 'desempeño, migración a la nube y carga de datos en Bizagi.',
    },
    {
      key: 'publico',
      label: 'Público',
      gridLabel: 'Sector público',
      description: 'implementación de procesos y soporte en Bizagi.',
    },
    {
      key: 'farmaceutico',
      label: 'Farmacéutico',
      description: 'migración de datos a SQL Server y reportes.',
    },
    {
      key: 'agropecuario',
      label: 'Agropecuario',
      description: 'sistema en la nube y aplicación móvil para la gestión de fincas ganaderas.',
    },
  ],
};

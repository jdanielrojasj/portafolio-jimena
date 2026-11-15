import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  // Dirección pública del panel: https://portafolio-jimena.sanity.studio
  studioHost: 'portafolio-jimena',
  deployment: {
    appId: 'bquaqu7ytdox6bo6mrpuzb4v',
  },
})

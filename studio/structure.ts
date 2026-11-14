import type {StructureResolver} from 'sanity/structure'

/** Id fijo de la ficha única "Ajustes de la web". */
export const SETTINGS_ID = 'siteSettings'

/** Tipos que no se pueden crear ni borrar desde el panel: solo existe una ficha. */
export const SINGLETON_TYPES = new Set(['siteSettings'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('videoPiece').title('Vídeos'),
      S.documentTypeListItem('actingWork').title('Trabajos como actriz'),
      S.documentTypeListItem('service').title('Servicios'),
      S.documentTypeListItem('brand').title('Marcas'),
      S.documentTypeListItem('videoCategory').title('Tipos de vídeo'),
      S.divider(),
      S.listItem()
        .title('Ajustes de la web')
        .id(SETTINGS_ID)
        .child(S.document().schemaType('siteSettings').documentId(SETTINGS_ID)),
    ])

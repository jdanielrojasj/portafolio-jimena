import type {StructureResolver} from 'sanity/structure'

/** Id fijo de la ficha única "Ajustes de la web". */
export const SETTINGS_ID = 'siteSettings'

/** Tipos que no se pueden crear ni borrar desde el panel: solo existe una ficha. */
export const SINGLETON_TYPES = new Set(['siteSettings'])

/** Acciones que la ficha única no ofrece: dejarla sin publicar vaciaría la web. */
const BLOCKED_SINGLETON_ACTIONS = new Set(['unpublish', 'duplicate', 'delete'])

export function singletonActions<T extends {action?: string}>(actions: T[], schemaType: string): T[] {
  return SINGLETON_TYPES.has(schemaType)
    ? actions.filter(({action}) => !BLOCKED_SINGLETON_ACTIONS.has(action ?? ''))
    : actions
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('videoPiece').title('Vídeos'),
      S.documentTypeListItem('testimonial').title('Opiniones'),
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

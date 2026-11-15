# Portafolio de Jimena Melendez

Web de portafolio bilingüe (español / inglés) para Jimena Melendez, actriz y creadora de contenido UGC.

- `web/` — la web pública (Astro, estática).
- `studio/` — el panel de contenidos (Sanity Studio).
- `scripts/` — utilidades; `comprimir-video.ps1` prepara vídeos para la web.
- `docs/` — diseño, plan de construcción y [guía de uso del panel](docs/guia-jimena.md).

El material original (vídeos y fotos) vive en `material/`, que está fuera del repositorio.

## Cómo funciona

1. Jimena edita el contenido en el panel y pulsa "Publicar".
2. Sanity avisa a Cloudflare Pages, que vuelve a construir la web.
3. Al construirse, la web lee todo el contenido de Sanity una sola vez y genera páginas estáticas.

Quien visita la web no consulta Sanity salvo para descargar fotos y vídeos, así que el consumo del plan gratuito es mínimo. Si la lectura de contenido falla al construir, la construcción se detiene y sigue publicada la versión anterior.

## Trabajar en local

Requiere Node 22 o superior.

```
npm install
```

**Web con contenido de prueba** (no necesita cuenta de Sanity):

```
cd web
$env:USE_FIXTURES = '1'; npm run dev
```

**Web con contenido real:** copia `web/.env.example` como `web/.env`, pon el `SANITY_PROJECT_ID` y ejecuta `npm run dev`.

**Panel:** copia `studio/.env.example` como `studio/.env`, pon el `SANITY_STUDIO_PROJECT_ID` y ejecuta `npm run dev` dentro de `studio/`.

**Pruebas:**

```
npm test -w studio      # esquemas del panel
npm run check -w web    # pruebas unitarias y de navegador
```

## Puesta en marcha (una sola vez)

Estos pasos crean cuentas o publican, así que los hace Daniel.

1. **Proyecto de Sanity.** En `studio/`: `npx sanity login` y después `npx sanity projects create` (o créalo en sanity.io/manage). Plan gratuito, dataset `production` público. Copia el identificador del proyecto a `studio/.env` y a `web/.env`.
2. **Probar el panel en local.** `npm run dev` en `studio/`, crear un vídeo de prueba y comprobar que se guarda.
3. **Color de acento.** Jimena elige el color; se cambia `--accent` (y `--accent-on-dark`) en `web/src/styles/tokens.css`. Debe tener un contraste mínimo de 4,5:1 sobre el fondo crema.
4. **Repositorio en GitHub.** Antes de subir, comprobar que no hay material ni claves:
   ```
   git ls-files | Select-String -Pattern 'material/|\.env$|\.superpowers'
   ```
   No debe devolver nada. Después: `gh repo create portafolio-jimena --public --source . --push`.
5. **Cloudflare Pages.** Crear un proyecto conectado al repositorio:
   - Directorio raíz: `web`
   - Comando de construcción: `npm run build`
   - Directorio de salida: `dist`
   - Variables de entorno: `SANITY_PROJECT_ID`, `SANITY_DATASET=production`, `SITE_URL` (la dirección pública, por ejemplo `https://jimenamelendez.pages.dev`) y `NODE_VERSION=22`.
6. **Publicar el panel.** En `studio/`: `npx sanity deploy`.
7. **Publicación automática.** En Cloudflare Pages, crear un *deploy hook*. En sanity.io/manage → API → Webhooks, crear un webhook que llame a esa dirección con POST al crear, actualizar o borrar documentos del dataset `production`. La dirección del hook es secreta: no va al repositorio.
8. **Invitar a Jimena** al proyecto de Sanity como administradora.
9. **Comprobar el recorrido completo.** Publicar un vídeo de prueba desde el panel y ver que aparece en la web en menos de tres minutos; borrarlo y ver que desaparece.

## Comprobaciones previas

**Términos de Sanity y uso comercial (revisado el 2026-11-15).** Los términos publicados en
`https://www.sanity.io/legal/tos` (fechados el 12 de agosto de 2026) no mencionan el plan gratuito ni
prohíben el uso comercial. La concesión de uso es "para fines internos de negocio" del titular y las
restricciones se refieren a revender el servicio o crear productos que compitan con Sanity. La página de
precios describe el plan gratuito como pensado para particulares y proyectos pequeños. No se ha encontrado
ninguna cláusula que impida usarlo para este portafolio.

**Límites del plan gratuito de Sanity (sanity.io/pricing, 2026-11-15).** 100 GB de archivos, 100 GB de
tráfico al mes, 10.000 documentos, 20 usuarios, dataset público. Sin cobros por exceso. Cada vídeo debe
pesar menos de 100 MB.

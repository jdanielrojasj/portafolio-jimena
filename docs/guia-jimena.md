# Guía del panel — cómo mantener tu portafolio

Esta guía es para ti, Jimena. Todo lo que se ve en tu web lo cambias desde un panel, sin tocar código.

> Las capturas de pantalla se añadirán cuando el panel esté en línea.

## Lo básico

- **El panel** es una página aparte de tu web. Daniel te dará la dirección. Entras con tu cuenta de Google.
- **Nada se publica hasta que pulsas "Publicar".** Mientras tanto es un borrador que solo ves tú.
- **Después de publicar, la web tarda uno o dos minutos en actualizarse.** Es normal.
- **Cada texto tiene dos casillas: Español e Inglés.** El español es obligatorio. Si dejas el inglés vacío, la versión en inglés mostrará el texto en español.

## El menú del panel

| Apartado | Para qué sirve |
|---|---|
| Vídeos | Tus vídeos para marcas y los personales |
| Trabajos como actriz | Obras de teatro, cortometrajes, talleres |
| Servicios | La lista de lo que ofreces |
| Marcas | Las marcas con las que has trabajado |
| Tipos de vídeo | Las etiquetas de los filtros: Review, Unboxing, Personal… Con el campo **Orden** decides en qué orden salen |
| Ajustes de la web | Portada, texto "Sobre mí", contacto y secciones opcionales |

## Antes de subir un vídeo: comprímelo

Los vídeos del móvil pesan demasiado para la web. El panel no acepta archivos de más de 100 MB, y uno ligero carga mucho más rápido para quien te visita.

1. Guarda el vídeo original en la carpeta `material` del ordenador (en `marcas`, `teatro` o `personales`).
2. Abre la carpeta del proyecto, haz clic derecho en un hueco vacío y elige **Abrir en Terminal**.
3. Escribe esto, cambiando el nombre por el de tu vídeo, y pulsa Enter:

   ```
   scripts\comprimir-video.cmd material\marcas\nombre-del-video.mp4
   ```

   Para comprimir de golpe todos los vídeos de una carpeta:

   ```
   scripts\comprimir-video.cmd material\marcas
   ```

4. El vídeo comprimido aparece en `material\web`. **Ese es el que subes al panel.** El original no se toca.

Si aparece un aviso en rojo diciendo que supera 100 MB, el vídeo es demasiado largo: recórtalo y repite.

La primera vez puede pedirte instalar **ffmpeg**, el programa que comprime. Copia la orden que te muestra, pulsa Enter, cierra la terminal y vuelve a abrirla.

## Añadir un vídeo

1. En el panel, entra en **Vídeos** y pulsa el botón de crear (el lápiz o el **+**).
2. Rellena:
   - **Título**: corto, en español y en inglés.
   - **Tipo de vídeo**: elige uno de la lista. Si no existe, puedes crearlo ahí mismo.
   - **Marca**: opcional. Déjalo vacío si es un vídeo personal.
   - **Archivo de vídeo**: arrastra el vídeo comprimido de `material\web`.
   - **Imagen de portada**: opcional. Es lo que se ve antes de darle a reproducir. Si no pones ninguna, se usa el primer instante del vídeo.
   - **Destacado**: actívalo para que salga de los primeros.
3. Pulsa **Publicar**.

## Añadir un trabajo como actriz

1. Entra en **Trabajos como actriz** y crea uno nuevo.
2. Rellena el título, el tipo (teatro, cortometraje, taller u otro), el personaje y el año.
3. Opcional: compañía o dirección, una descripción breve, fotos y un vídeo comprimido.
4. Pulsa **Publicar**.

Los trabajos se ordenan solos, del más reciente al más antiguo.

## Cambiar la portada

Entra en **Ajustes de la web**, pestaña **Portada**.

- **Fotos de portada**: hasta dos fotos verticales. Quedan a los lados del vídeo, así que conviene que sean de la misma sesión.
- **Vídeo de portada**: un montaje corto, de unos 10 segundos, que se repite sin sonido. Debe pesar poco (menos de 8 MB). Para prepararlo, añade `-Portada` al comprimir; le quita el sonido y lo deja más ligero:

  ```
  scripts\comprimir-video.cmd material\montaje.mp4 -Portada
  ```
- **Foto para compartir**: opcional, una foto horizontal. Es la que se ve al mandar el enlace por WhatsApp o publicarlo en redes.
- **Línea de presentación**: la frase bajo tu nombre.
- **Palabras de la franja**: las palabras que corren en la banda oscura.

Pulsa **Publicar** al terminar.

## Cambiar textos, contacto e idiomas

Todo está en **Ajustes de la web**:

- Pestaña **Sobre mí**: tu texto de presentación, tu foto y los idiomas que hablas.
- Pestaña **Contacto**: tu correo, tu Instagram y tu TikTok. Las direcciones de Instagram y TikTok deben empezar por `https://`.

## Encender la franja de marcas

Está apagada a propósito hasta que tengas varias marcas.

1. Añade las marcas en el apartado **Marcas** (nombre y, si lo tienes, logo).
2. En **Ajustes de la web**, pestaña **Secciones opcionales**, activa **Mostrar franja de marcas**.
3. Pulsa **Publicar**.

En esa misma pestaña está la **ficha de casting** (altura, pelo y ojos), también apagada por defecto.

## Si un cambio no aparece en la web

1. **Espera dos minutos** y recarga la página.
2. **Comprueba que pulsaste "Publicar".** Si el botón sigue activo, el cambio es todavía un borrador.
3. **Recarga sin caché**: en el ordenador, Ctrl + F5.
4. Si un vídeo no se sube, casi siempre es porque pesa más de 100 MB: comprímelo.
5. Si nada de esto funciona, avisa a Daniel.

## Cosas que no puedes romper

- Borrar un vídeo o un trabajo solo lo quita de la web; el original sigue en tu carpeta `material`.
- La ficha **Ajustes de la web** no se puede borrar.
- Si dejas un apartado vacío (por ejemplo, sin servicios), esa sección simplemente no aparece en la web.

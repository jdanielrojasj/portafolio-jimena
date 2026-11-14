const img = `{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`

/** Una sola consulta trae todo el contenido de la web. Su forma es `RawSite`. */
export const SITE_QUERY = `{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    tagline,
    marqueeWords,
    "heroPhotos": heroPhotos[]${img},
    "heroVideoUrl": heroVideo.asset->url,
    aboutText,
    "aboutPhoto": aboutPhoto${img},
    languages,
    email,
    instagramUrl,
    tiktokUrl,
    showBrands,
    showCasting,
    casting
  },
  "categories": *[_type == "videoCategory"] | order(title.es asc){
    "slug": slug.current,
    title
  },
  "videos": *[_type == "videoPiece"] | order(_createdAt desc){
    _id,
    title,
    "category": category->slug.current,
    "brand": brand->name,
    "videoUrl": video.asset->url,
    "poster": poster${img},
    description,
    featured,
    order
  },
  "actingWorks": *[_type == "actingWork"] | order(_createdAt desc){
    _id,
    title,
    kind,
    role,
    year,
    company,
    description,
    "photos": photos[]${img},
    "videoUrl": video.asset->url
  },
  "brands": *[_type == "brand"] | order(name asc){
    name,
    "logoUrl": logo.asset->url
  },
  "services": *[_type == "service"] | order(_createdAt asc){
    name,
    description,
    order
  }
}`

<#
.SYNOPSIS
  Comprime vídeos para subirlos al panel del portafolio.

.DESCRIPTION
  Convierte cada vídeo a MP4 (H.264 + AAC) con un tamaño máximo de
  1080 x 1920 en vertical (o 1920 x 1080 en horizontal), listo para la web.
  Nunca modifica ni sobrescribe el original: el resultado se guarda en otra carpeta.

.EXAMPLE
  .\scripts\comprimir-video.ps1 -Entrada material\marcas\vichy-review.mov

.EXAMPLE
  .\scripts\comprimir-video.ps1 -Entrada material\marcas

.EXAMPLE
  .\scripts\comprimir-video.ps1 -Entrada material\montaje.mov -Portada
  Versión ligera para el vídeo de portada: sin sonido y de menos de 8 MB.
#>
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Entrada,

  [Parameter(Position = 1)]
  [string]$Salida,

  # Vídeo de portada: se repite sin sonido, así que va sin audio y más comprimido.
  [switch]$Portada
)

$ErrorActionPreference = 'Stop'
$LimiteMB = if ($Portada) { 8 } else { 100 }
$Calidad = if ($Portada) { 28 } else { 23 }
$Audio = if ($Portada) { @('-an') } else { @('-c:a', 'aac', '-b:a', '128k') }
$Sufijo = if ($Portada) { '-portada' } else { '' }
$Extensiones = @('.mp4', '.mov', '.m4v', '.avi', '.mkv', '.webm')

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Host 'Falta el programa ffmpeg, que es el que comprime los vídeos.' -ForegroundColor Red
  Write-Host 'Instálalo una sola vez con esta orden y vuelve a abrir la terminal:'
  Write-Host '  winget install Gyan.FFmpeg' -ForegroundColor Cyan
  exit 1
}

if (-not (Test-Path -LiteralPath $Entrada)) {
  Write-Host "No existe: $Entrada" -ForegroundColor Red
  exit 1
}

if (-not $Salida) {
  $Salida = Join-Path (Split-Path -Parent $PSScriptRoot) 'material\web'
}
New-Item -ItemType Directory -Force -Path $Salida | Out-Null
$Salida = (Resolve-Path -LiteralPath $Salida).Path

$item = Get-Item -LiteralPath $Entrada
if ($item.PSIsContainer) {
  $videos = @(Get-ChildItem -LiteralPath $item.FullName -File | Where-Object { $Extensiones -contains $_.Extension.ToLower() })
} else {
  $videos = @($item)
}

if ($videos.Count -eq 0) {
  Write-Host "No hay vídeos en: $Entrada" -ForegroundColor Yellow
  exit 0
}

# El lado largo se limita a 1920 px y el corto a 1080 px, sin deformar ni agrandar.
function Get-Filtro([int]$Largo, [int]$Corto) {
  "scale='if(gt(iw,ih),min($Largo,iw),min($Corto,iw))':-2"
}
$filtro = Get-Filtro 1920 1080
$demasiadoGrandes = 0
$fallidos = 0

# Ejecuta ffmpeg hacia el archivo provisional. Si falla, no deja nada a medias.
function Invoke-Ffmpeg([string]$Provisional, [string[]]$Argumentos) {
  # -n: ffmpeg nunca sobrescribe un archivo existente. -stats muestra el progreso.
  & ffmpeg -hide_banner -loglevel error -stats -n @Argumentos $Provisional
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $Provisional)) {
    if (Test-Path -LiteralPath $Provisional) {
      Remove-Item -LiteralPath $Provisional -Force
    }
    return $false
  }
  return $true
}

# Datos del vídeo original: duración y si ya está listo para la web tal cual
# (H.264 de 8 bits, sonido AAC o sin sonido, sin pasar de 1920 x 1080).
function Get-InfoVideo([string]$Ruta) {
  $json = & ffprobe -v error -show_entries 'format=duration:stream=codec_type,codec_name,pix_fmt,width,height' -of json $Ruta | Out-String | ConvertFrom-Json
  $imagen = @($json.streams | Where-Object { $_.codec_type -eq 'video' })[0]
  $sonidos = @($json.streams | Where-Object { $_.codec_type -eq 'audio' })
  $apto = $false
  if ($imagen) {
    $largo = [math]::Max([int]$imagen.width, [int]$imagen.height)
    $corto = [math]::Min([int]$imagen.width, [int]$imagen.height)
    $apto = $imagen.codec_name -eq 'h264' -and $imagen.pix_fmt -eq 'yuv420p' -and
      $largo -le 1920 -and $corto -le 1080 -and
      ($sonidos.Count -eq 0 -or $sonidos[0].codec_name -eq 'aac')
  }
  [pscustomobject]@{
    Duracion = [double]$json.format.duration
    Apto     = $apto
  }
}

foreach ($video in $videos) {
  $destino = Join-Path $Salida ($video.BaseName + $Sufijo + '.mp4')

  if ($destino -eq $video.FullName) {
    Write-Host "Omitido (la carpeta de salida es la del original): $($video.Name)" -ForegroundColor Yellow
    continue
  }
  if (Test-Path -LiteralPath $destino) {
    Write-Host "Omitido (ya existe): $destino" -ForegroundColor Yellow
    continue
  }

  # Se comprime a un archivo provisional y solo se renombra al terminar: si el
  # equipo se apaga o se cierra la ventana a medias, no queda un vídeo roto con
  # el nombre definitivo (que la siguiente vez se daría por hecho y se omitiría).
  $provisional = Join-Path $Salida ($video.BaseName + $Sufijo + '.parcial.mp4')
  if (Test-Path -LiteralPath $provisional) {
    Remove-Item -LiteralPath $provisional -Force
  }

  $info = Get-InfoVideo $video.FullName

  Write-Host "Comprimiendo $($video.Name)..."
  $ok = Invoke-Ffmpeg $provisional (@('-i', $video.FullName,
    '-vf', $filtro, '-c:v', 'libx264', '-preset', 'slow', '-crf', $Calidad, '-pix_fmt', 'yuv420p') + $Audio + @('-movflags', '+faststart'))
  if (-not $ok) {
    Write-Host "  No se pudo comprimir $($video.Name)." -ForegroundColor Red
    $fallidos++
    continue
  }

  # Un vídeo que ya venía comprimido para la web puede crecer al recomprimirlo.
  # En ese caso se copia el original sin tocar la imagen ni el sonido.
  if (-not $Portada -and $info.Apto -and (Get-Item -LiteralPath $provisional).Length -ge $video.Length) {
    Remove-Item -LiteralPath $provisional -Force
    Write-Host '  Ya estaba comprimido: se copia tal cual, sin perder calidad.'
    $ok = Invoke-Ffmpeg $provisional @('-i', $video.FullName,
      '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart')
    if (-not $ok) {
      Write-Host "  No se pudo copiar $($video.Name)." -ForegroundColor Red
      $fallidos++
      continue
    }
  }

  # Un vídeo largo puede pasar del límite con la calidad normal. Se repite con
  # la calidad justa para que quepa (con un 10 % de margen) y, si esa calidad es
  # baja para 1080p, a 720p, que con pocos datos se ve más nítido.
  if (-not $Portada -and (Get-Item -LiteralPath $provisional).Length -ge $LimiteMB * 1MB -and $info.Duracion -gt 0) {
    $kbps = [math]::Floor($LimiteMB * 1MB * 8 * 0.9 / $info.Duracion / 1000 * 0.98) - 128
    if ($kbps -lt 400) {
      Remove-Item -LiteralPath $provisional -Force
      Write-Host "  Es demasiado largo para caber en $LimiteMB MB con una calidad aceptable. Recórtalo y repite." -ForegroundColor Red
      $demasiadoGrandes++
      continue
    }
    $filtroLargo = if ($kbps -lt 2500) { Get-Filtro 1280 720 } else { $filtro }
    $resolucion = if ($kbps -lt 2500) { '720p' } else { '1080p' }
    Remove-Item -LiteralPath $provisional -Force
    Write-Host "  Pasaba de $LimiteMB MB: se repite en $resolucion con la calidad justa para que quepa..."
    $ok = Invoke-Ffmpeg $provisional (@('-i', $video.FullName,
      '-vf', $filtroLargo, '-c:v', 'libx264', '-preset', 'slow',
      '-b:v', "${kbps}k", '-maxrate', "$([math]::Floor($kbps * 1.5))k", '-bufsize', "$($kbps * 2)k",
      '-pix_fmt', 'yuv420p') + $Audio + @('-movflags', '+faststart'))
    if (-not $ok) {
      Write-Host "  No se pudo comprimir $($video.Name)." -ForegroundColor Red
      $fallidos++
      continue
    }
  }

  Move-Item -LiteralPath $provisional -Destination $destino

  $mb = [math]::Round((Get-Item -LiteralPath $destino).Length / 1MB, 1)
  if ($mb -ge $LimiteMB) {
    if ($Portada) {
      Write-Host "  $mb MB: para la portada debe pesar menos de $LimiteMB MB. Recórtalo a unos 10 segundos y repite." -ForegroundColor Red
    } else {
      Write-Host "  $mb MB: supera el límite de $LimiteMB MB y el panel no lo aceptará. Recorta el vídeo y repite." -ForegroundColor Red
    }
    $demasiadoGrandes++
  } else {
    Write-Host "  Listo: $destino ($mb MB)" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host "Los vídeos comprimidos están en: $Salida"
if ($demasiadoGrandes -gt 0 -or $fallidos -gt 0) { exit 1 }

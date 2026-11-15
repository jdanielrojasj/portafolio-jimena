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
#>
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Entrada,

  [Parameter(Position = 1)]
  [string]$Salida
)

$ErrorActionPreference = 'Stop'
$LimiteMB = 100
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
$filtro = "scale='if(gt(iw,ih),min(1920,iw),min(1080,iw))':-2"
$demasiadoGrandes = 0
$fallidos = 0

foreach ($video in $videos) {
  $destino = Join-Path $Salida ($video.BaseName + '.mp4')

  if ($destino -eq $video.FullName) {
    Write-Host "Omitido (la carpeta de salida es la del original): $($video.Name)" -ForegroundColor Yellow
    continue
  }
  if (Test-Path -LiteralPath $destino) {
    Write-Host "Omitido (ya existe): $destino" -ForegroundColor Yellow
    continue
  }

  Write-Host "Comprimiendo $($video.Name)..."
  # -n: ffmpeg nunca sobrescribe un archivo existente.
  & ffmpeg -hide_banner -loglevel error -n -i $video.FullName `
    -vf $filtro -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p `
    -c:a aac -b:a 128k -movflags +faststart $destino

  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $destino)) {
    Write-Host "  No se pudo comprimir $($video.Name)." -ForegroundColor Red
    $fallidos++
    continue
  }

  $mb = [math]::Round((Get-Item -LiteralPath $destino).Length / 1MB, 1)
  if ($mb -ge $LimiteMB) {
    Write-Host "  $mb MB: supera el límite de $LimiteMB MB y el panel no lo aceptará. Recorta el vídeo y repite." -ForegroundColor Red
    $demasiadoGrandes++
  } else {
    Write-Host "  Listo: $destino ($mb MB)" -ForegroundColor Green
  }
}

Write-Host ''
Write-Host "Los vídeos comprimidos están en: $Salida"
if ($demasiadoGrandes -gt 0 -or $fallidos -gt 0) { exit 1 }

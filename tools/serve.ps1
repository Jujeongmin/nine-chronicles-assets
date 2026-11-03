# Local web server for the library, so the pages work after downloading.
# Browsers block fetch() and WebGL textures on file://, so the pages need http://.
# Started by "열기-윈도우.bat". Uses only built-in Windows PowerShell (no install).
# Keep this file ASCII: Windows PowerShell 5.1 reads BOM-less files as ANSI.

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) '..'))
$rootPrefix = $root.TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
  '.atlas'= 'text/plain; charset=utf-8'
  '.webp' = 'image/webp'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.svg'  = 'image/svg+xml'
}

$listener = $null
foreach ($p in 8765..8785) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://localhost:$p/")
  try { $l.Start(); $listener = $l; $port = $p; break } catch { $l.Close() }
}
if (-not $listener) {
  Write-Host 'Could not open a local port (8765-8785 are all in use).'
  Read-Host 'Press Enter to close'
  exit 1
}

$url = "http://localhost:$port/"
Write-Host ''
Write-Host "  Effect / Character Library is running at $url"
Write-Host '  Keep this window open while you use it. Close it to stop.'
Write-Host ''
if ($env:LIBRARY_NO_BROWSER -ne '1') { Start-Process $url }

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not ($path + [IO.Path]::DirectorySeparatorChar).StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
      $res.StatusCode = 403
    } elseif ((Test-Path -LiteralPath $path -PathType Container) -and $rel -ne '' -and -not $rel.EndsWith('/')) {
      # characters -> characters/ so the page's relative paths resolve
      $res.Redirect($ctx.Request.Url.AbsolutePath + '/')
    } else {
      if (Test-Path -LiteralPath $path -PathType Container) { $path = Join-Path $path 'index.html' }
      if (Test-Path -LiteralPath $path -PathType Leaf) {
        $ext = [IO.Path]::GetExtension($path).ToLower()
        if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] } else { $res.ContentType = 'application/octet-stream' }
        $res.AddHeader('Cache-Control', 'no-cache')
        $bytes = [IO.File]::ReadAllBytes($path)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
      }
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
  } finally {
    try { $res.Close() } catch {}
  }
}

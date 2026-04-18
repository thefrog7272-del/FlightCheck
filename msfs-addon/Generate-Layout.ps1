# Generate-Layout.ps1
# Run this from the msfs-addon/flightcheck-panel directory before packing the addon.
# It scans all files and writes layout.json with correct sizes and timestamps.

$root = Join-Path $PSScriptRoot "flightcheck-panel"
$outputFile = Join-Path $root "layout.json"

$entries = @()

Get-ChildItem -Path $root -Recurse -File |
  Where-Object { $_.Name -ne "layout.json" } |
  ForEach-Object {
    $relativePath = $_.FullName.Substring($root.Length + 1).Replace("\", "/")
    $entries += [PSCustomObject]@{
      path = $relativePath
      size = $_.Length
      date = [long]($_.LastWriteTimeUtc - [datetime]"1970-01-01T00:00:00Z").TotalSeconds * 10000000 + 116444736000000000
    }
  }

$json = [PSCustomObject]@{ content = $entries } | ConvertTo-Json -Depth 4
Set-Content -Path $outputFile -Value $json -Encoding UTF8

Write-Host "layout.json written with $($entries.Count) entries."

param([Parameter(Mandatory = $true)][string]$ZipPath)

$ErrorActionPreference = 'Stop'
$target = Join-Path $PSScriptRoot '..\videos'
New-Item -ItemType Directory -Force -Path $target | Out-Null
Expand-Archive -LiteralPath $ZipPath -DestinationPath $target -Force
$count = (Get-ChildItem -LiteralPath $target -Filter 'page_*.mp4').Count
if ($count -ne 602) { throw "Expected 602 videos, found $count." }
Write-Host "Prepared $count videos in $target"

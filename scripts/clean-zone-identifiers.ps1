# Script para limpiar archivos Zone.Identifier
# Ejecutar desde PowerShell como administrador

param(
    [string]$Path = ".",
    [switch]$Recursive = $true
)

Write-Host "Limpiando archivos Zone.Identifier en: $Path" -ForegroundColor Green

if ($Recursive) {
    $files = Get-ChildItem -Path $Path -Filter "*:Zone.Identifier" -Recurse -Force
} else {
    $files = Get-ChildItem -Path $Path -Filter "*:Zone.Identifier" -Force
}

$count = $files.Count
Write-Host "Encontrados $count archivos Zone.Identifier" -ForegroundColor Yellow

foreach ($file in $files) {
    try {
        Remove-Item $file.FullName -Force
        Write-Host "Eliminado: $($file.FullName)" -ForegroundColor Gray
    } catch {
        Write-Host "Error eliminando: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Limpieza completada. $count archivos eliminados." -ForegroundColor Green

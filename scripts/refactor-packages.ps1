# PowerShell script to refactor package declarations
# From: com.example.uavdockingmanagementsystem
# To: com.uav.dockingmanagement

$oldPackage = "com.example.uavdockingmanagementsystem"
$newPackage = "com.uav.dockingmanagement"

# Get all Java files in the new package structure
$javaFiles = Get-ChildItem -Path "src\main\java\com\uav\dockingmanagement" -Recurse -Filter "*.java"
$testFiles = Get-ChildItem -Path "src\test\java\com\uav\dockingmanagement" -Recurse -Filter "*.java"

$allFiles = $javaFiles + $testFiles

Write-Host "Found $($allFiles.Count) Java files to refactor"

foreach ($file in $allFiles) {
    Write-Host "Processing: $($file.FullName)"
    
    # Read file content
    $content = Get-Content $file.FullName -Raw
    
    # Replace package declaration
    $content = $content -replace "package $oldPackage", "package $newPackage"
    
    # Replace import statements
    $content = $content -replace "import $oldPackage", "import $newPackage"
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Package refactoring completed!"

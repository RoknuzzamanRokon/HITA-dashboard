# PowerShell Script to Check Free Trial Data
# Run: .\scripts\check-data.ps1

Write-Host "`n📊 Free Trial Requests Data Check" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Gray

$dataFile = "data\trial-requests.json"

if (-not (Test-Path $dataFile)) {
    Write-Host "`n❌ No data file found!" -ForegroundColor Red
    Write-Host "📁 Expected location: $dataFile" -ForegroundColor Yellow
    Write-Host "💡 Submit a trial request first at: http://localhost:3001/free-trial`n" -ForegroundColor Green
    exit
}

try {
    $data = Get-Content $dataFile -Raw | ConvertFrom-Json
    
    if ($data.Count -eq 0) {
        Write-Host "`n📭 No trial requests yet" -ForegroundColor Yellow
        Write-Host "💡 Submit a trial request at: http://localhost:3001/free-trial`n" -ForegroundColor Green
        exit
    }

    Write-Host "`n✅ Total Requests: $($data.Count)" -ForegroundColor Green
    
    # Statistics
    $pending = ($data | Where-Object { $_.status -eq "pending" }).Count
    $approved = ($data | Where-Object { $_.status -eq "approved" }).Count
    $rejected = ($data | Where-Object { $_.status -eq "rejected" }).Count
    
    Write-Host "`n📈 Statistics:" -ForegroundColor Cyan
    Write-Host "   Pending:  $pending" -ForegroundColor Yellow
    Write-Host "   Approved: $approved" -ForegroundColor Green
    Write-Host "   Rejected: $rejected" -ForegroundColor Red
    
    Write-Host "`n" + ("=" * 80) -ForegroundColor Gray
    
    # Display each request
    $index = 1
    foreach ($request in $data) {
        Write-Host "`nRequest #$index" -ForegroundColor Cyan
        Write-Host "   ID:            $($request.id)" -ForegroundColor White
        Write-Host "   Username:      $($request.username)" -ForegroundColor White
        Write-Host "   Business:      $($request.business_name)" -ForegroundColor White
        Write-Host "   Email:         $($request.email)" -ForegroundColor White
        Write-Host "   Phone:         $($request.phone_number)" -ForegroundColor White
        
        if ($request.message) {
            Write-Host "   Message:       $($request.message)" -ForegroundColor White
        } else {
            Write-Host "   Message:       (no message)" -ForegroundColor Gray
        }
        
        $statusColor = switch ($request.status) {
            "pending" { "Yellow" }
            "approved" { "Green" }
            "rejected" { "Red" }
            default { "White" }
        }
        Write-Host "   Status:        $($request.status)" -ForegroundColor $statusColor
        
        $date = [DateTime]::Parse($request.request_date)
        Write-Host "   Request Date:  $($date.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
        Write-Host "   IP Address:    $($request.ip_address)" -ForegroundColor Gray
        
        Write-Host "`n" + ("-" * 80) -ForegroundColor Gray
        $index++
    }
    
    Write-Host "`n💾 Data file location: $(Resolve-Path $dataFile)" -ForegroundColor Cyan
    Write-Host "📊 View in admin dashboard: http://localhost:3001/dashboard/admin/free-trials" -ForegroundColor Green
    Write-Host "🌐 Submit new request: http://localhost:3001/free-trial`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error reading data: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 The JSON file might be corrupted. Check: $dataFile`n" -ForegroundColor Yellow
}

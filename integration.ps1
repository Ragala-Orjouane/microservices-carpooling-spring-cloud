$ErrorActionPreference = 'Stop'
Write-Output "=== Integration script start ==="

try {
    Write-Output "1) Register driver"
    $driverBody = @{nom='Driver'; email='driver@example.com'; password='pass'} | ConvertTo-Json
    $driver = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/register' -Method Post -ContentType 'application/json' -Body $driverBody
    $driver | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "2) Login driver"
    $login = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/login' -Method Post -ContentType 'application/json' -Body (@{email='driver@example.com'; password='pass'} | ConvertTo-Json)
    $token = $login.token
    Write-Output "DRIVER TOKEN: $token"

    Write-Output "3) Create trajet"
    $trajetPayload = @{depart='Point A'; arrivee='Point B'; dateHeureDepart=(Get-Date).AddDays(1).ToString('s'); placesDisponibles=3} | ConvertTo-Json
    $hdr = @{ Authorization = "Bearer $token" }
    $created = Invoke-RestMethod -Uri 'http://localhost:8080/api/trajets' -Method Post -ContentType 'application/json' -Body $trajetPayload -Headers $hdr
    Write-Output "CREATED TRAJET:"
    $created | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "4) Register passenger"
    $passBody = @{nom='Passenger'; email='pass@example.com'; password='pass'} | ConvertTo-Json
    $pass = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/register' -Method Post -ContentType 'application/json' -Body $passBody
    $pass | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "5) Login passenger"
    $login2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/users/login' -Method Post -ContentType 'application/json' -Body (@{email='pass@example.com'; password='pass'} | ConvertTo-Json)
    $t2 = $login2.token
    Write-Output "PASSENGER TOKEN: $t2"

    Write-Output "6) Create reservation (passenger)"
    $hdr2 = @{ Authorization = "Bearer $t2" }
    $resBody = @{trajetId = $created.id; placesReservees = 1} | ConvertTo-Json
    $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/reservations' -Method Post -ContentType 'application/json' -Body $resBody -Headers $hdr2
    Write-Output "CREATED RESERVATION:"
    $res | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "7) Confirm reservation (driver)"
    $hdrDriver = @{ Authorization = "Bearer $token" }
    $conf = Invoke-RestMethod -Uri ("http://localhost:8080/api/reservations/$($res.id)/confirm") -Method Put -Headers $hdrDriver
    Write-Output "CONFIRMED:"
    $conf | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "8) Fetch notifications for driver"
    $notes = Invoke-RestMethod -Uri ("http://localhost:8080/api/notifications?userId=$($created.conducteurId)") -Method Get
    Write-Output "NOTIFICATIONS:"
    $notes | ConvertTo-Json -Depth 5 | Write-Output

    Write-Output "=== Integration script finished ==="
}
catch {
    Write-Output "=== ERROR ==="
    Write-Output $_.Exception.ToString()
    if ($_.InvocationInfo) { Write-Output $_.InvocationInfo.PositionMessage }
    exit 1
}

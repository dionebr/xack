$TargetIP = "10.13.37.2"
$TargetPort = 8888

Write-Host "`n=== x ack VPN Connectivity Test ===" -ForegroundColor Cyan
Write-Host "Target: $TargetIP"
Write-Host "Port:   $TargetPort"
Write-Host "-----------------------------------"

# 1. Ping Test
Write-Host "`n[1] Testing ICMP Ping..." -NoNewline
if (Test-Connection -ComputerName $TargetIP -Count 2 -Quiet) {
    Write-Host " SUCCESS" -ForegroundColor Green
} else {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "    -> Ensure VPN WireGuard is ACTIVE." -ForegroundColor Yellow
    Write-Host "    -> Check if allowed IPs include 10.13.37.0/24." -ForegroundColor Yellow
}

# 2. TCP Port Test (Ncat equivalent)
Write-Host "`n[2] Testing TCP Connection (Port $TargetPort)..." -NoNewline
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $connect = $tcp.BeginConnect($TargetIP, $TargetPort, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(2000, $false)
    
    if ($tcp.Connected) {
        Write-Host " SUCCESS" -ForegroundColor Green
        Write-Host "    -> Connection Established! CTF Service is reachable." -ForegroundColor Cyan
        $tcp.Close()
    } else {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "    -> Host reachable but port closed OR packet dropped." -ForegroundColor Yellow
    }
} catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "    -> $_" -ForegroundColor DarkGray
}

Write-Host "`n==================================="
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

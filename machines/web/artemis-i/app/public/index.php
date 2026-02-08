<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARTEMIS I - Monitoring System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        .header h1 {
            color: #1e3c72;
            margin-bottom: 5px;
        }

        .header p {
            color: #666;
            font-size: 14px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .sensors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .sensor-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .sensor-card h3 {
            color: #1e3c72;
            margin-bottom: 10px;
        }

        .sensor-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .status-online {
            background: #4caf50;
            color: white;
        }

        .status-offline {
            background: #f44336;
            color: white;
        }

        .status-maintenance {
            background: #ff9800;
            color: white;
        }

        .reading {
            font-size: 24px;
            font-weight: bold;
            color: #2a5298;
            margin: 10px 0;
        }

        .location {
            color: #666;
            font-size: 14px;
        }

        .search-box {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .search-box input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .hint-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }

        .flag-box {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }

        .flag {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            color: #28a745;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🛰️ ARTEMIS I Monitoring System</h1>
            <p>UHC Labs - Real-time Sensor Monitoring Dashboard</p>
        </div>

        <div class="search-box">
            <form action="search.php" method="GET">
                <input type="text" name="q" placeholder="Search sensors by name or location..."
                    value="<?php echo htmlspecialchars($_GET['q'] ?? ''); ?>">
            </form>
        </div>

        <?php
        // Database connection
        $conn = new mysqli('localhost', 'artemis', 'uhc_artemis_2024', 'artemis_monitoring');

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Get sensors
        $query = "SELECT * FROM sensors ORDER BY id";
        $result = $conn->query($query);
        ?>

        <div class="sensors-grid">
            <?php while ($sensor = $result->fetch_assoc()): ?>
                <div class="sensor-card">
                    <h3>
                        <?php echo htmlspecialchars($sensor['sensor_name']); ?>
                    </h3>
                    <span class="sensor-status status-<?php echo $sensor['status']; ?>">
                        <?php echo strtoupper($sensor['status']); ?>
                    </span>
                    <div class="location">📍
                        <?php echo htmlspecialchars($sensor['location']); ?>
                    </div>
                    <div class="reading">
                        <?php echo number_format($sensor['last_reading'], 2); ?>
                    </div>
                    <div style="color: #999; font-size: 12px;">
                        Last update:
                        <?php echo date('Y-m-d H:i:s', strtotime($sensor['last_update'])); ?>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>

        <?php
        // Public flag (visible in source or API)
        $flag_query = "SELECT key_value FROM secrets WHERE access_level = 'public' LIMIT 1";
        $flag_result = $conn->query($flag_query);
        if ($flag_result && $flag_result->num_rows > 0) {
            $public_flag = $flag_result->fetch_assoc()['key_value'];
        }
        ?>

        <div class="flag-box">
            <strong>🚩 Public API Key (Flag 1/4)</strong>
            <div class="flag">
                <?php echo htmlspecialchars($public_flag ?? 'N/A'); ?>
            </div>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
                This is the public API key for read-only access. Submit this flag to earn your first points!
            </p>
        </div>

        <div class="hint-box">
            <strong>💡 Hint:</strong> The search functionality might have some interesting behaviors.
            Try exploring different search queries. Also, there might be internal services running on localhost...
        </div>

        <?php $conn->close(); ?>
    </div>
</body>

</html>
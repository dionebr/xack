<?php
session_start();

// Simple authentication check
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit();
}

$conn = new mysqli('localhost', 'artemis', 'uhc_artemis_2024', 'artemis_monitoring');
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - ARTEMIS I</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a2e;
            color: white;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }

        .header h1 {
            margin-bottom: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #e94560;
        }

        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #e94560;
            margin: 10px 0;
        }

        .flag-box {
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #4caf50;
        }

        .flag {
            font-family: 'Courier New', monospace;
            background: #0f3460;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            color: #4caf50;
            font-weight: bold;
        }

        .hint-box {
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #ff9800;
        }

        table {
            width: 100%;
            background: #16213e;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 20px;
        }

        th,
        td {
            padding: 15px;
            text-align: left;
        }

        th {
            background: #0f3460;
        }

        tr:nth-child(even) {
            background: #1a1a2e;
        }

        .logout {
            display: inline-block;
            padding: 10px 20px;
            background: #e94560;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            float: right;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔐 ARTEMIS I - Admin Panel</h1>
            <p>Internal Administration Dashboard (Port 8080)</p>
            <a href="logout.php" class="logout">Logout</a>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Sensors</h3>
                <div class="stat-value">
                    <?php
                    $result = $conn->query("SELECT COUNT(*) as count FROM sensors");
                    echo $result->fetch_assoc()['count'];
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>Active Users</h3>
                <div class="stat-value">
                    <?php
                    $result = $conn->query("SELECT COUNT(*) as count FROM users");
                    echo $result->fetch_assoc()['count'];
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>System Logs</h3>
                <div class="stat-value">
                    <?php
                    $result = $conn->query("SELECT COUNT(*) as count FROM system_logs");
                    echo $result->fetch_assoc()['count'];
                    ?>
                </div>
            </div>
        </div>

        <?php
        // Admin flag
        $admin_flag_result = $conn->query("SELECT key_value FROM secrets WHERE access_level = 'admin' LIMIT 1");
        $admin_flag = $admin_flag_result->fetch_assoc()['key_value'];
        ?>

        <div class="flag-box">
            <h3>🏆 Admin Secret (Flag 3/4)</h3>
            <div class="flag">
                <?php echo htmlspecialchars($admin_flag); ?>
            </div>
            <p style="margin-top: 10px; color: #aaa;">
                Congratulations on accessing the internal admin panel! This flag proves admin-level access.
            </p>
        </div>

        <h2 style="margin: 30px 0 15px 0;">Recent System Logs</h2>
        <table>
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Message</th>
                    <th>Source</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $logs = $conn->query("SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 10");
                while ($log = $logs->fetch_assoc()):
                    ?>
                    <tr>
                        <td>
                            <?php echo htmlspecialchars($log['log_level']); ?>
                        </td>
                        <td>
                            <?php echo htmlspecialchars($log['message']); ?>
                        </td>
                        <td>
                            <?php echo htmlspecialchars($log['source']); ?>
                        </td>
                        <td>
                            <?php echo date('Y-m-d H:i:s', strtotime($log['created_at'])); ?>
                        </td>
                    </tr>
                <?php endwhile; ?>
            </tbody>
        </table>

        <div class="hint-box" style="margin-top: 30px;">
            <h3>💡 Hint for Root Flag:</h3>
            <p>The root flag is stored in <code>/root/flags.txt</code> on the system.
                You'll need to find a way to execute commands or read files on the server.
                Look for potential command injection vulnerabilities or misconfigurations that could lead to privilege
                escalation.</p>
        </div>
    </div>
</body>

</html>
<?php $conn->close(); ?>
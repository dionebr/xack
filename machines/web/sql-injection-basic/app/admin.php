<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}

// Database connection
$db_host = getenv('DB_HOST') ?: 'db';
$db_user = getenv('DB_USER') ?: 'webapp';
$db_pass = getenv('DB_PASS') ?: 'weak_password';
$db_name = getenv('DB_NAME') ?: 'challenge_db';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Get user flag from secrets table
$flag_query = "SELECT content FROM secrets WHERE for_role = 'admin'";
$flag_result = $conn->query($flag_query);
$user_flag = $flag_result->fetch_assoc()['content'] ?? 'Flag not found';

// Root flag is in environment variable
$root_flag = getenv('FLAG_ROOT') ?: 'XACK{e99a18c428cb38d5f260853678922e03}';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
        }

        .welcome {
            color: #666;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }

        .flag-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }

        .flag-box h3 {
            color: #667eea;
            margin-bottom: 10px;
        }

        .flag {
            font-family: 'Courier New', monospace;
            background: #fff;
            padding: 15px;
            border-radius: 5px;
            color: #2ecc71;
            font-weight: bold;
            word-break: break-all;
        }

        .hint {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin-top: 20px;
        }

        .logout {
            display: inline-block;
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }

        .logout:hover {
            background: #c82333;
        }

        .config-hint {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #2196F3;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>🎯 Admin Panel</h1>
        <p class="welcome">Welcome, <strong>
                <?php echo htmlspecialchars($_SESSION['username']); ?>
            </strong>!</p>

        <div class="flag-box">
            <h3>🚩 User Flag</h3>
            <div class="flag">
                <?php echo htmlspecialchars($user_flag); ?>
            </div>
        </div>

        <div class="hint">
            <strong>💡 Hint for Root Flag:</strong> The root flag might be stored in the database configuration or
            environment variables. Try exploring the database credentials!
        </div>

        <div class="config-hint">
            <strong>🔍 Database Configuration:</strong><br>
            Host: <code><?php echo htmlspecialchars($db_host); ?></code><br>
            User: <code><?php echo htmlspecialchars($db_user); ?></code><br>
            Database: <code><?php echo htmlspecialchars($db_name); ?></code><br>
            <br>
            <em>Hmm... I wonder if there's anything interesting in the MySQL root password or environment variables?
                🤔</em>
        </div>

        <?php if ($_SESSION['role'] === 'admin'): ?>
            <div class="flag-box" style="border-left-color: #e74c3c;">
                <h3>🏆 Root Flag (Admin Only)</h3>
                <div class="flag">
                    <?php echo htmlspecialchars($root_flag); ?>
                </div>
                <p style="margin-top: 10px; color: #666; font-size: 14px;">
                    <strong>Congratulations!</strong> You've found both flags. Submit them to the platform to earn your
                    points!
                </p>
            </div>
        <?php endif; ?>

        <a href="logout.php" class="logout">Logout</a>
    </div>
</body>

</html>
<?php $conn->close(); ?>
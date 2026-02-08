<?php
// VULNERABLE SEARCH - SQL Injection
$conn = new mysqli('localhost', 'artemis', 'uhc_artemis_2024', 'artemis_monitoring');

if ($conn->connect_error) {
    die("Connection failed");
}

$search = $_GET['q'] ?? '';

// VULNERABLE: No sanitization!
$query = "SELECT * FROM sensors WHERE sensor_name LIKE '%$search%' OR location LIKE '%$search%'";
$result = $conn->query($query);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Results - ARTEMIS I</title>
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

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        h1 {
            color: #1e3c72;
            margin-bottom: 20px;
        }

        .back-link {
            display: inline-block;
            padding: 10px 20px;
            background: #2a5298;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .result {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            border-left: 4px solid #2a5298;
        }

        .hint {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #ffc107;
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
        <a href="index.php" class="back-link">← Back to Dashboard</a>

        <h1>Search Results for: "
            <?php echo htmlspecialchars($search); ?>"
        </h1>

        <?php if ($result && $result->num_rows > 0): ?>
            <?php while ($row = $result->fetch_assoc()): ?>
                <div class="result">
                    <h3>
                        <?php echo htmlspecialchars($row['sensor_name']); ?>
                    </h3>
                    <p><strong>Location:</strong>
                        <?php echo htmlspecialchars($row['location']); ?>
                    </p>
                    <p><strong>Status:</strong>
                        <?php echo htmlspecialchars($row['status']); ?>
                    </p>
                    <p><strong>Reading:</strong>
                        <?php echo htmlspecialchars($row['last_reading']); ?>
                    </p>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <p>No results found.</p>
        <?php endif; ?>

        <div class="hint">
            <strong>💡 SQL Injection Hint:</strong> This search is vulnerable to SQL injection.
            Try using UNION-based injection to extract data from other tables like <code>users</code> or
            <code>secrets</code>.
            <br><br>
            Example payload: <code>' UNION SELECT 1,2,3,4,5,6 -- </code>
            <br>
            Then enumerate columns: <code>' UNION SELECT 1,username,password,email,role,6 FROM users -- </code>
        </div>

        <!-- Debug info (remove in production) -->
        <!-- Query: <?php echo $query; ?> -->
    </div>
</body>

</html>
<?php $conn->close(); ?>
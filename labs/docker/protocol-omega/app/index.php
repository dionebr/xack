<?php
$servername = "db";
$username = "user";
$password = "password";
$dbname = "vulnerability";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$search = $_GET['id'] ?? '';
$result = null;

if ($search) {
    // VULNERABLE CODE - No parameter binding
    $sql = "SELECT username FROM users WHERE id = " . $search;
    $result = $conn->query($sql);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>User Search</title>
    <style>
        body { font-family: monospace; background: #111; color: #0f0; padding: 50px; }
        input { background: #333; border: 1px solid #0f0; color: #fff; padding: 10px; }
        button { background: #0f0; color: #000; border: none; padding: 10px 20px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>User Database Search</h1>
    <form method="GET">
        <label>User ID:</label>
        <input type="text" name="id" placeholder="1">
        <button type="submit">Search</button>
    </form>

    <?php if ($result): ?>
        <h2>Results:</h2>
        <ul>
        <?php 
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                echo "<li>User: " . $row["username"] . "</li>";
            }
        } else {
            echo "<li>No results found</li>";
        }
        ?>
        </ul>
    <?php endif; ?>
    
    <!-- Hint: The flag is in the 'users' table or maybe hidden somewhere else? -->
</body>
</html>

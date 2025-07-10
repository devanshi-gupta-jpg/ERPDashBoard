<?php
include 'connection.php';

$group = strtoupper(trim($_GET['group'] ?? ''));
// $group = $_GET['group'] ?? 'tl';  // default groups
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

$COMMANDS = ['SWC', 'NC', 'WC', 'EC', 'SC', 'CC', 'IAF'];

// 🛠 Use UPPER(LTRIM(RTRIM(...))) in both group_name and command
$sql = "
    SELECT 
        UPPER(LTRIM(RTRIM(command))) AS command,
        COUNT(*) AS count
    FROM tb_main
    WHERE 
        UPPER(LTRIM(RTRIM(group_name))) = ?
        AND p_id IS NOT NULL
        AND command IS NOT NULL
        AND LTRIM(RTRIM(command)) <> ''
    GROUP BY UPPER(LTRIM(RTRIM(command)))
";

$stmt = sqlsrv_query($conn, $sql, [$group]);

if ($stmt === false) {
    echo json_encode(['error' => sqlsrv_errors()]);
    exit;
}

$raw = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $raw[] = $row;
}

// ✅ Match with upper-case only
$data = array_map(function ($cmd) use ($raw) {
    $match = array_filter($raw, function ($r) use ($cmd) {
        return strtoupper(trim($r['command'])) === $cmd;
    });
    return [
        'command' => $cmd,
        'count' => $match ? array_values($match)[0]['count'] : 0
    ];
}, $COMMANDS);

header('Content-Type: application/json');
echo json_encode($data);
?>

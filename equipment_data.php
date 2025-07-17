<?php
include 'connection.php';

$group = trim($_GET['group'] ?? '');
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

$group = strtoupper($group);  // Convert group to uppercase in PHP

function getCount($conn, $group, $minMonths, $maxMonths = null) {
    $query = "
        SELECT COUNT(*) AS total
        FROM tb_main
        WHERE UPPER(status) = 'UNDER REPAIR'
          AND UPPER([group_name]) = ?
          AND job_date IS NOT NULL
          AND DATEDIFF(MONTH, job_date, GETDATE()) >= ?
    ";
    
    $params = [$group, $minMonths];

    if (!is_null($maxMonths)) {
        $query .= " AND DATEDIFF(MONTH, job_date, GETDATE()) < ?";
        $params[] = $maxMonths;
    }

    $stmt = sqlsrv_query($conn, $query, $params);
    if (!$stmt) return 0;
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    return $row['total'] ?? 0;
}

$response = [
    'counts' => [
        getCount($conn, $group, 0, 3),     // Under 3 months
        getCount($conn, $group, 3, 6),     // 3 to 6 months
        getCount($conn, $group, 6, 12),    // 6 to 12 months
        getCount($conn, $group, 12, null)  // Over 1 year
    ]
];

echo json_encode($response);
?>

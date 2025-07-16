<?php
header('Content-Type: application/json');
include 'connection.php';

$group = $_GET['group'] ?? '';
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

// Debugging: Show Received Parameters
echo json_encode([
    'debug' => 'Received Parameters',
    'group' => $group,
    'year' => $year
]);

$query = "
SELECT COUNT(*) as count
FROM (
    SELECT TRY_CAST(job_date AS DATE) AS job_dt
    FROM tb_main
    WHERE ISDATE(job_date) = 1
      AND UPPER(LTRIM(RTRIM(status))) = 'UNDER REPAIR'
      AND UPPER(LTRIM(RTRIM(group_name))) = UPPER(?)
) AS valid_dates
WHERE DATEDIFF(DAY, job_dt, GETDATE()) > 90
  AND DATEDIFF(DAY, job_dt, GETDATE()) <= 180
  AND YEAR(job_dt) = ?
";

$params = [$group, $year];

$stmt = sqlsrv_query($conn, $query, $params);

if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
}

if ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    echo json_encode(['count' => $row['count']]);
} else {
    echo json_encode(['count' => 0]);
}
?>

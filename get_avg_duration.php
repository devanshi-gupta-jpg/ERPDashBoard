<?php
header('Content-Type: application/json');
include 'connection.php'; // ✅ your DB connection

$group = $_GET['group'] ?? '';

$sql = "
    SELECT 
        job_no,
        CASE 
            WHEN wcn_date IS NOT NULL THEN 'Completed'
            WHEN wcn_date IS NULL AND job_date IS NOT NULL THEN 'Under Repair'
            ELSE 'Unknown'
        END AS status,
        DATEDIFF(DAY, job_date, ISNULL(wcn_date, GETDATE())) AS duration
    FROM tb_main
    WHERE job_no IS NOT NULL 
      AND job_date IS NOT NULL
      AND group_name = ?
";

$stmt = sqlsrv_query($conn, $sql, [$group]);

if (!$stmt) {
    echo json_encode(['error' => sqlsrv_errors()]);
    exit;
}

$result = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $result[] = [
        'job_no' => $row['job_no'],
        'status' => $row['status'],
        'duration' => (int) $row['duration']
    ];
}

echo json_encode($result);
?>

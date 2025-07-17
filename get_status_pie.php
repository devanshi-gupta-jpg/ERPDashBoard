

<?php
include 'connection.php';

$group = strtoupper(trim($_GET['group'] ?? ''));
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}


$statuses = [
    'UNDER REPAIR',
    'UNDER VIR',
    'UNDER WCN PROCESS',
    'AWAITING COLLECTION',
    'IN WKSP'
];


$sql = "
    SELECT s.status, COUNT(t.status) AS count
    FROM (
        SELECT 'UNDER REPAIR' AS status
        UNION ALL SELECT 'UNDER VIR'
        UNION ALL SELECT 'UNDER WCN PROCESS'
        UNION ALL SELECT 'AWAITING COLLECTION'
        UNION ALL SELECT 'IN WKSP'
    ) s
    LEFT JOIN tb_main t 
        ON UPPER(LTRIM(RTRIM(t.status))) = s.status 
        AND UPPER(LTRIM(RTRIM(t.group_name))) = ?
    GROUP BY s.status
";
$sql_total = "SELECT COUNT(job_no) AS total FROM tb_main WHERE job_no IS NOT NULL";

$stmt = sqlsrv_query($conn, $sql, [$group]);

if ($stmt === false) {
    echo json_encode(['error' => sqlsrv_errors()]);
    exit;
}

$data = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $data[] = [
        'status' => $row['status'],
        'count' => (int) $row['count']
    ];
}

header('Content-Type: application/json');
echo json_encode($data);
?> 

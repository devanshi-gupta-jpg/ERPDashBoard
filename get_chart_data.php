<?php
include 'connection.php';

$group = $_GET['group'] ?? '';
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

$sql = "
    SELECT formatted_date, SUM(input_count) AS input, SUM(output_count) AS output
    FROM (
        SELECT 
            CONVERT(varchar, job_date, 23) AS formatted_date,
            COUNT(DISTINCT p_id) AS input_count,
            0 AS output_count
        FROM tb_main
        WHERE 
            group_name = ? AND job_date IS NOT NULL
        GROUP BY CONVERT(varchar, job_date, 23)

        UNION ALL

        SELECT 
            CONVERT(varchar, wcn_date, 23) AS formatted_date,
            0 AS input_count,
            COUNT(DISTINCT p_id) AS output_count
        FROM tb_main
        WHERE 
            group_name = ? AND wcn_date IS NOT NULL
        GROUP BY CONVERT(varchar, wcn_date, 23)
    ) combined
    GROUP BY formatted_date
    ORDER BY formatted_date ASC
";

$stmt = sqlsrv_query($conn, $sql, [$group, $group]);

if (!$stmt) {
    echo json_encode(['error' => sqlsrv_errors()]);
    exit;
}

$data = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $data[] = [
        'date' => $row['formatted_date'],
        'input' => (int) $row['input'],
        'output' => (int) $row['output']
    ];
}

header('Content-Type: application/json');
echo json_encode($data);

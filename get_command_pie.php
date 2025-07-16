<?php
include 'connection.php';

$COMMANDS = ['SWC', 'NC', 'WC', 'EC', 'SC', 'CC', 'IAF'];

// Function to fetch count by command for a given status
function getDataByStatus($conn, $status, $commands) {
    $sql = "
        SELECT 
            UPPER(LTRIM(RTRIM(command))) AS command,
            COUNT(*) AS count
        FROM tb_main
        WHERE 
            UPPER(LTRIM(RTRIM(status))) = UPPER(?)
            AND p_id IS NOT NULL
            AND command IS NOT NULL
            AND LTRIM(RTRIM(command)) <> ''
        GROUP BY UPPER(LTRIM(RTRIM(command)))
    ";

    $stmt = sqlsrv_query($conn, $sql, [$status]);
    if ($stmt === false) return [];

    $raw = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $raw[] = $row;
    }

    return array_map(function ($cmd) use ($raw) {
        $match = array_filter($raw, function ($r) use ($cmd) {
            return strtoupper(trim($r['command'])) === $cmd;
        });
        return [
            'command' => $cmd,
            'count' => $match ? array_values($match)[0]['count'] : 0
        ];
    }, $commands);
}

$data = [
    'under_repair' => getDataByStatus($conn, 'UNDER REPAIR', $COMMANDS),
    'awaiting_collection' => getDataByStatus($conn, 'AWAITING COLLECTION', $COMMANDS)
];

header('Content-Type: application/json');
echo json_encode($data);
?>

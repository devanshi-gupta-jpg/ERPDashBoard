<?php
header('Content-Type: application/json');
include 'connection.php';

$group = $_GET['group'] ?? '';
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

function parseDate($dateString)
{
    $formats = ['d-M-Y', 'd-M-y', 'd-F-Y', 'd-F-y', 'd-m-Y', 'd/m/Y'];
    $dateString = trim($dateString);
    foreach ($formats as $format) {
        $parsed = DateTime::createFromFormat($format, $dateString);
        if ($parsed) return $parsed;
    }
    return false;
}

$query = "SELECT job_date FROM tb_main WHERE UPPER(LTRIM(RTRIM(group_name))) = UPPER(?) AND UPPER(LTRIM(RTRIM(status))) = 'UNDER REPAIR'";
$stmt = sqlsrv_query($conn, $query, [$group]);

if (!$stmt) {
    echo json_encode(['error' => 'SQL Error', 'details' => sqlsrv_errors()]);
    exit;
}

$count = 0;
$debug = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    if (!empty($row['job_date'])) {
        $jobDate = parseDate($row['job_date']);
        if ($jobDate) {
            $now = new DateTime();
            $diffMonths = $now->diff($jobDate)->m + ($now->diff($jobDate)->y * 12);

            if ($now > $jobDate) {  // Only if current date > job_date
                if ($diffMonths > 3 && $diffMonths <= 6) {
                    $count++;
                }
            }

            $debug[] = [
                'original' => $row['job_date'],
                'parsed' => $jobDate->format('Y-m-d'),
                'diff_months' => $diffMonths,
                'counted' => ($now > $jobDate && $diffMonths > 3 && $diffMonths <= 6) ? 'YES' : 'NO'
            ];
        } else {
            $debug[] = ['type' => 'parse-fail', 'original' => $row['job_date']];
        }
    }
}

echo json_encode(['count' => $count, 'debug' => $debug]);
?>

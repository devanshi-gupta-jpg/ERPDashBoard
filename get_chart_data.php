<?php
header('Content-Type: application/json');
include 'connection.php';

$group = $_GET['group'] ?? '';
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

$year = $_GET['year'] ?? date('Y');  // ✅ Year Filter Added
$today = new DateTime();

$monthRanges = [
    ['label' => '26 Mar - 25 Apr', 'start' => "$year-03-26", 'end' => "$year-04-25"],
    ['label' => '26 Apr - 25 May', 'start' => "$year-04-26", 'end' => "$year-05-25"],
    ['label' => '26 May - 25 Jun', 'start' => "$year-05-26", 'end' => "$year-06-25"],
    ['label' => '26 Jun - 25 Jul', 'start' => "$year-06-26", 'end' => "$year-07-25"],
    ['label' => '26 Jul - 25 Aug', 'start' => "$year-07-26", 'end' => "$year-08-25"],
    ['label' => '26 Aug - 25 Sep', 'start' => "$year-08-26", 'end' => "$year-09-25"],
    ['label' => '26 Sep - 25 Oct', 'start' => "$year-09-26", 'end' => "$year-10-25"],
    ['label' => '26 Oct - 25 Nov', 'start' => "$year-10-26", 'end' => "$year-11-25"],
    ['label' => '26 Nov - 25 Dec', 'start' => "$year-11-26", 'end' => "$year-12-25"],
    ['label' => '26 Dec - 25 Jan', 'start' => "$year-12-26", 'end' => ($year + 1) . "-01-25"],
    ['label' => '26 Jan - 25 Feb', 'start' => ($year + 1) . "-01-26", 'end' => ($year + 1) . "-02-25"],
    ['label' => '26 Feb - 25 Mar', 'start' => ($year + 1) . "-02-26", 'end' => ($year + 1) . "-03-25"]
];

function parseDate($dateString)
{
    if (empty($dateString)) return false;

    $formats = ['j-M-Y', 'j-M-y', 'j-F-Y', 'j-F-y', 'd-M-Y', 'd-m-Y', 'j/m/Y'];
    $dateString = trim($dateString);
    foreach ($formats as $format) {
        $parsed = DateTime::createFromFormat($format, $dateString);
        if ($parsed !== false) return $parsed;
    }
    return false;
}

$finalData = [];

$query = "SELECT p_id, job_date, wcn_date FROM tb_main WHERE UPPER(LTRIM(RTRIM(group_name))) = UPPER(?)";
$stmt = sqlsrv_query($conn, $query, [$group]);

if (!$stmt) {
    echo json_encode(['error' => 'SQL Error', 'details' => sqlsrv_errors()]);
    exit;
}

$allData = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $allData[] = $row;
}

foreach ($monthRanges as $range) {
    $inputCount = 0;
    $outputCount = 0;

    $startDate = new DateTime($range['start']);
    $endDate = new DateTime($range['end']);

    if ($startDate > $today) {
        $finalData[] = ['label' => $range['label'], 'input' => 0, 'output' => 0];
        continue;
    }

    foreach ($allData as $record) {
        if (!empty($record['job_date'])) {
            $jobDate = parseDate($record['job_date']);
            if ($jobDate && $jobDate >= $startDate && $jobDate <= $endDate) {
                $inputCount++;
            }
        }

        if (!empty($record['wcn_date'])) {
            $wcnDate = parseDate($record['wcn_date']);
            if ($wcnDate && $wcnDate >= $startDate && $wcnDate <= $endDate) {
                $outputCount++;
            }
        }
    }

    $finalData[] = ['label' => $range['label'], 'input' => $inputCount, 'output' => $outputCount];
}

echo json_encode(['data' => $finalData]);
?>

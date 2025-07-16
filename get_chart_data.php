<?php
header('Content-Type: application/json');
include 'connection.php';

$group = $_GET['group'] ?? '';
if (!$group) {
    echo json_encode(['error' => 'Group is required']);
    exit;
}

$currentYear = date('Y');
$today = new DateTime();

$monthRanges = [
    ['label' => '26 Mar - 25 Apr', 'start' => "$currentYear-03-26", 'end' => "$currentYear-04-25"],
    ['label' => '26 Apr - 25 May', 'start' => "$currentYear-04-26", 'end' => "$currentYear-05-25"],
    ['label' => '26 May - 25 Jun', 'start' => "$currentYear-05-26", 'end' => "$currentYear-06-25"],
    ['label' => '26 Jun - 25 Jul', 'start' => "$currentYear-06-26", 'end' => "$currentYear-07-25"],
    ['label' => '26 Jul - 25 Aug', 'start' => "$currentYear-07-26", 'end' => "$currentYear-08-25"],
    ['label' => '26 Aug - 25 Sep', 'start' => "$currentYear-08-26", 'end' => "$currentYear-09-25"],
    ['label' => '26 Sep - 25 Oct', 'start' => "$currentYear-09-26", 'end' => "$currentYear-10-25"],
    ['label' => '26 Oct - 25 Nov', 'start' => "$currentYear-10-26", 'end' => "$currentYear-11-25"],
    ['label' => '26 Nov - 25 Dec', 'start' => "$currentYear-11-26", 'end' => "$currentYear-12-25"],
    ['label' => '26 Dec - 25 Jan', 'start' => "$currentYear-12-26", 'end' => ($currentYear + 1) . "-01-25"],
    ['label' => '26 Jan - 25 Feb', 'start' => ($currentYear + 1) . "-01-26", 'end' => ($currentYear + 1) . "-02-25"],
    ['label' => '26 Feb - 25 Mar', 'start' => ($currentYear + 1) . "-02-26", 'end' => ($currentYear + 1) . "-03-25"]
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

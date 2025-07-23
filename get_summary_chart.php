<?php
include 'connection.php';

$group = $_GET['group'] ?? 'TL';
$year = $_GET['year'] ?? date('Y');
$group = strtoupper($group);

$startOfYear = "$year-01-01";
$endOfYear = "$year-12-31";

// Date Parsing Function — Will convert database date string into Y-m-d format
function parseDateToSQL($dateString)
{
    if (empty($dateString)) return null;
    $formats = ['j-M-Y', 'd-M-Y', 'd-m-Y', 'j/m/Y', 'd/m/Y', 'Y-m-d'];
    foreach ($formats as $format) {
        $dt = DateTime::createFromFormat($format, trim($dateString));
        if ($dt !== false) return $dt->format('Y-m-d');
    }
    return null;
}

// Function for Financial Month Range (26th to 25th)
function getFinancialMonthRange($currentDate)
{
    $month = date('n', strtotime($currentDate));
    $year = date('Y', strtotime($currentDate));

    $ranges = [
        4 => ['03-26', '04-25'],
        5 => ['04-26', '05-25'],
        6 => ['05-26', '06-25'],
        7 => ['06-26', '07-25'],
        8 => ['07-26', '08-25'],
        9 => ['08-26', '09-25'],
        10 => ['09-26', '10-25'],
        11 => ['10-26', '11-25'],
        12 => ['11-26', '12-25'],
        1 => ['12-26', '01-25'],
        2 => ['01-26', '02-25'],
        3 => ['02-26', '03-25'],
    ];

    $range = $ranges[$month];

    if (in_array($month, [1, 2, 3])) {
        $startYear = $year - 1;
        $endYear = $year;
    } else {
        $startYear = $year;
        $endYear = $year;
    }

    $startDate = date('Y-m-d', strtotime("{$startYear}-{$range[0]}"));
    $endDate = date('Y-m-d', strtotime("{$endYear}-{$range[1]}"));

    return [$startDate, $endDate];
}

list($startDate, $endDate) = getFinancialMonthRange(date('Y-m-d'));

// Fetch all data first and filter in PHP (because of date format issues)
$query = "SELECT job_no, wcn_no, job_date, wcn_date FROM tb_main WHERE group_name = ?";
$stmt = sqlsrv_query($conn, $query, [$group]);
if ($stmt === false) die(print_r(sqlsrv_errors(), true));

$totalInputs = 0;
$totalOutputs = 0;
$currentMonthInputs = 0;
$currentMonthOutputs = 0;

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $jobDate = parseDateToSQL($row['job_date'] ?? '');
    $wcnDate = parseDateToSQL($row['wcn_date'] ?? '');

    // Total Inputs
    if (!empty($row['job_no']) && $jobDate && $jobDate >= $startOfYear && $jobDate <= $endOfYear) {
        $totalInputs++;
    }

    // Total Outputs
    if (!empty($row['wcn_no']) && $wcnDate && $wcnDate >= $startOfYear && $wcnDate <= $endOfYear) {
        $totalOutputs++;
    }

    // Current Month Inputs
    if (!empty($row['job_no']) && $jobDate && $jobDate >= $startDate && $jobDate <= $endDate) {
        $currentMonthInputs++;
    }

    // Current Month Outputs
    if (!empty($row['wcn_no']) && $wcnDate && $wcnDate >= $startDate && $wcnDate <= $endDate) {
        $currentMonthOutputs++;
    }
}

echo json_encode([
    'totalInputs' => $totalInputs,
    'totalOutputs' => $totalOutputs,
    'currentMonthInputs' => $currentMonthInputs,
    'currentMonthOutputs' => $currentMonthOutputs,
]);
?>

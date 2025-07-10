<?php
include 'connection.php';

$query = "SELECT TOP 1 * FROM tb_main";
$stmt = sqlsrv_query($conn, $query);

if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
}

$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

echo "<pre>";
print_r(array_keys($row));
echo "</pre>";
?>

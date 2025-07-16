<?php

$serverName = "HP";
$database = "voucher";
$uid = "sa";
$pass = "12345678";

$connection = [
    "Database" => $database,
    "uid" => $uid,
    "PWD" => $pass
];

$conn = sqlsrv_connect($serverName,$connection);
if(!$conn)
die(print_r(sqlsrv_errors(), true));
// else 
// echo 'connection established';

?>
<?php 

include 'config.php';

$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

/* Os SETSs abaixo resolvem problemas de acentuação */

$mysqli->query("SET NAMES 'utf8mb4'");
$mysqli->query('SET character_set_connection=utf8mb4');
$mysqli->query('SET character_set_client=utf8mb4');
$mysqli->query('SET character_set_results=utf8mb4');

if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}

?>
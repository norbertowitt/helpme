<?php

session_start();

date_default_timezone_set('America/Sao_Paulo');
$_SESSION['hoje'] = date('d/m/Y');
 
if(!isset($_SESSION['usuario'])){
	$response = array('codigo' => 1, 'mensagem' => 'Não logado.');
	echo json_encode($response);
	exit();
} else {
	$response = array('codigo' => 0, 'mensagem' => 'Usuário logado.', 'usuario' => $_SESSION['usuario'], 'hoje' => $_SESSION['hoje']);
	echo json_encode($response);
	exit();
}

?>
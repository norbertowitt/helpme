<?php

session_start();
 
if(!isset($_SESSION['usuario'])){
	$response = array('codigo' => 1, 'mensagem' => 'Não logado.');
	echo json_encode($response);
	exit;
} else {

	require_once '../bd/conecta.php';

	$sql_permissao_bo = "select acessa_bo from perfil where id = " . $_SESSION['perfil'];

	if (!$resultado_permissao_bo = $mysqli->query($sql_permissao_bo)) {
		$permite_bo = "N";
	} else {
		$array_permissao = $resultado_permissao_bo->fetch_all();
		$permite_bo = $array_permissao[0][0];
	}

	if ($permite_bo == "S") {
		$response = array('codigo' => 0, 'mensagem' => 'Usuário logado.', 'usuario' => $_SESSION['usuario']);
		echo json_encode($response);
		exit;
	} else {
		$response = array('codigo' => 2, 'mensagem' => 'Usuário logado mas sem permissão.', 'usuario' => $_SESSION['usuario']);
		echo json_encode($response);
		exit;
	}


}

?>
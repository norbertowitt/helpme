<?php 

session_start();

$requestPayload = file_get_contents("php://input");

$dto = json_decode($requestPayload);
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';

        $sql = "insert into base_conhecimento (id_pagina, id_usuario_criacao, data_reserva, reservado) values (" . $dto->pagina . "," . $_SESSION['id_usuario'] . ", now(), 'S')";

        if (!$mysqli->query($sql)) {
            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
        } else {
            $sql_id_conhecimento = "select id from base_conhecimento where reservado = 'S' and id_usuario_criacao = " . $_SESSION['id_usuario'] . " order by id desc limit 1";
            $resultado = $mysqli->query($sql_id_conhecimento);
            $array_resultado = $resultado->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Conhecimento reservado com sucesso.', 'id' => $array_resultado[0][0]);
            echo json_encode($response);
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }
}

?>
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

        $sql_produto = "select ifnull(id_produto,11) id_produto from pagina where id = " . $dto->id_anterior;
        $resultado = $mysqli->query($sql_produto);
        $array_produto = $resultado->fetch_all();

        $sql = "insert into pagina (nome_pagina, id_anterior, id_usuario_criacao, data_criacao, id_produto) 
                values ('" . $dto->nome . "', " . $dto->id_anterior . ", " . $_SESSION['id_usuario'] . ", now(), " . $array_produto[0][0] . ")";

        if (!$mysqli->query($sql)) {
            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
            exit;
        } else {
            $response = array('codigo' => 0, 'mensagem' => 'Página inserida com sucesso.');
            echo json_encode($response);
            exit;
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }
}

?>
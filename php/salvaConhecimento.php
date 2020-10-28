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

        $sql = "update base_conhecimento
                       set nome_base_conhecimento = '" . $dto->titulo . "',
                       html = '" . $dto->html . "',
                       reservado = 'N',
                       id_usuario_alteracao = '" . $_SESSION['id_usuario'] . "',
                       data_criacao = now(),
                       data_alteracao = now()
                       where id = " . $dto->id;

        if (!$mysqli->query($sql)) {
            $mysqli->error;
            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
        } else {
            $response = array('codigo' => 0, 'mensagem' => 'Conhecimento salvo com sucesso!');
            echo json_encode($response);
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }
}

?>
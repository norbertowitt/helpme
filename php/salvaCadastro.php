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

        $sql = "insert into pre_cadastro (alias, nome, equipe, data_hora)
                values ('".$dto->usuario."', '".$dto->nome."', '".$dto->equipe."', now())";

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
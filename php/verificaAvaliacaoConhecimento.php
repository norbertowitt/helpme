<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else if (!isset($_GET['conhecimento'])) {

    $response = array('codigo' => 2, 'mensagem' => 'Erro na URL.');
    echo json_encode($response);
    exit;

} else {
    
    try {
        
        require_once '../bd/conecta.php';
        
        $sql_avaliacao = "select polegar from avaliacao_base_conhecimento where id_base_conhecimento = " . $_GET['conhecimento'] . " and id_usuario_criacao = " . $_SESSION['id_usuario'];

        if (!$resultado =  $mysqli->query($sql_avaliacao)) {
            $response = array('codigo' => 1, 'mensagem_erro'=> $mysqli->error, 'mensagem' => 'Não foi possível ler a avaliação no BD.');
            echo json_encode($response);
        } else {

            if ($resultado->num_rows == 0) {
                $response = array('codigo' => 2, 'mensagem' => 'Não há avaliação para este conhecimento e usuário.');
                echo json_encode($response);
            } else if ($resultado->num_rows == 1) {
                $array_conhecimento = $resultado->fetch_all();
                $response = array('codigo' => 0, 'avaliacao' => $array_conhecimento[0][0]);
                echo json_encode($response);
            } else if ($resultado > 1) {
                $response = array('codigo' => 3, 'mensagem' => 'Há mais de uma avaliação do mesmo usuário para o mesmo conhecimento. Informe a equipe do HelpMe!');
                echo json_encode($response);
            }
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }

}

?>
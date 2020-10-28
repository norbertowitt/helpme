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

        $sql = "select id, polegar from avaliacao_base_conhecimento 
                where id_base_conhecimento = " . $dto->conhecimento . " and id_usuario_criacao = " . $_SESSION['id_usuario'] . " and polegar = '" . $dto->avaliacao . "'";

        if (!$resultado = $mysqli->query($sql)) {

            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);

        } elseif ($resultado->num_rows == 0) {
            
            $sql_inserir = "insert into avaliacao_base_conhecimento (id_base_conhecimento, id_usuario_criacao, polegar, data_avaliacao)
                            values (" . $dto->conhecimento . ", " . $_SESSION['id_usuario'] . ", '" . $dto->avaliacao . "', now())";

            if (!$mysqli->query($sql_inserir)) {

                $response = array('codigo' => 1, 'mensagem_erro'=> $mysqli->error, 'mensagem' => 'Não foi possível inserir a avaliação no BD.');
                echo json_encode($response);

            } else {

                if ($dto->avaliacao == 'C') {
                    $sql_deletar = "delete from avaliacao_base_conhecimento where id_base_conhecimento = " . $dto->conhecimento . " and id_usuario_criacao = " . $_SESSION['id_usuario'] . " and polegar = 'B'";
                    $mysqli->query($sql_deletar);
                    $response = array('codigo' => 0, 'avaliacao' => $dto->avaliacao, 'mensagem' => 'Avaliação inserida com sucesso e a anterior foi deletada.', 'operacao' => 'I');
                    echo json_encode($response);
                } elseif ($dto->avaliacao == 'B') {
                    $sql_deletar = "delete from avaliacao_base_conhecimento where id_base_conhecimento = " . $dto->conhecimento . " and id_usuario_criacao = " . $_SESSION['id_usuario'] . " and polegar = 'C'";
                    $mysqli->query($sql_deletar);
                    $response = array('codigo' => 0, 'avaliacao' => $dto->avaliacao, 'mensagem' => 'Avaliação inserida com sucesso e a anterior foi deletada.', 'operacao' => 'I');
                    echo json_encode($response);
                }

            }

        } elseif ($resultado->num_rows == 1) {

            $array_resultado = $resultado->fetch_all();
            $sql_deletar = "delete from avaliacao_base_conhecimento where id = " . $array_resultado[0][0] . " and id_usuario_criacao = " . $_SESSION['id_usuario'];

            if (!$mysqli->query($sql_deletar)) {
                $response = array('codigo' => 1, 'mensagem_erro'=> $mysqli->error, 'mensagem' => 'Não foi possível deletar a avaliação no BD.');
                echo json_encode($response);
            } else {
                $response = array('codigo' => 0, 'avaliacao' => $array_resultado[0][1], 'mensagem' => 'Avaliação já existia e foi deletada com sucesso!', 'operacao' => 'D');
                echo json_encode($response);
            }

        } elseif ($resultado->num_rows > 1) {

            $response = array('codigo' => 1, 'mensagem' => 'Exsite mais de uma avaliação para o mesmo usuário no mesmo conhecimento, informe a equipe do HelpMe.');
            echo json_encode($response);

        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }
}

?>
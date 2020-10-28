<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';
        
        $sql_tp = "select situacao, texto from texto_padrao";
        
        if (!$res_tp = $mysqli->query($sql_tp)) {

            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
            exit;

        } else {

            $array_tp = $res_tp->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Textos-padrão carregados com sucesso.', 'tp' => $array_tp, 'nome_usuario' => $_SESSION['nome_completo']);
            echo json_encode($response);
            exit;
            
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 2, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }

}

?>
<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';
        
        $sql_card = "select titulo_card, conteudo_card from cards_home where id =" . $_GET['card'];
        
        if (!$res_card = $mysqli->query($sql_card)) {

            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
            exit;

        } else {

            $array_card = $res_card->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Card carregado com sucesso.', 'titulo' => $array_card[0][0], 'texto' => $array_card[0][1]);
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
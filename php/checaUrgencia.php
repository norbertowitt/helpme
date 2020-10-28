<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';
        
        $sql_urgencia = "select titulo, 
                            texto,
                            case
                                when id_equipe = 0 then 'Todos'
                                else (select nome_equipe from equipe where id = " .  $_GET['equipe'] . ")
                            end equipe,
                            date_format(data_cadastro, '%d/%m/%y - %H:%i') data_cadastro,
                            date_format(data_fim, '%d/%m/%y - %H:%i') data_fim
                    from urgencia where (id_equipe = 0 or id_equipe = " .  $_GET['equipe'] . ") 
                    and data_fim >= now();";
        
        if (!$res_urgencia = $mysqli->query($sql_urgencia)) {

            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
            exit;

        } else {

            $array_urgencia = $res_urgencia->fetch_all();

            if (empty($array_urgencia)) {
                $response = array('codigo' => 3, 'mensagem' => 'Nenhuma urgência encontrada.');
                echo json_encode($response);
                exit;
            } else {
                $response = array('codigo' => 0, 'mensagem' => 'Urgência encontrada.', 'dados' => $array_urgencia);
                echo json_encode($response);
                exit;
            }
            
        }
    
    } catch(Exception $e){
    
        $response = array('codigo' => 2, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }

}

?>
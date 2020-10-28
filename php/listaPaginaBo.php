<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else if (!isset($_GET['pagina'])) {

    $response = array('codigo' => 2, 'mensagem' => 'Erro na URL.');
    echo json_encode($response);
    exit;

} else {
    
    try {
        
        require_once '../bd/conecta.php';

        $sql_pagina = "select p2.id,
                        p2.nome_pagina,
                        concat(u.nome,' ', u.sobrenome) criado_por,
                        date_format(p2.data_criacao, '%d/%m/%Y - %H:%i:%s') criado_em,
                        date_format(p2.data_alteracao, '%d/%m/%Y - %H:%i:%s') alterado_em
                
                        from pagina p
                        left join pagina p2
                        on p.id = p2.id_anterior
                        left join usuario u
                        on p2.id_usuario_criacao = u.id
                        
                        where p.id = " . $_GET['pagina'] . "
                        
                        order by p2.id";

        $sql_mapa = "call cria_mapa(" . $_GET['pagina'] . ")";

        $res_pagina = $mysqli->query($sql_pagina);
        $res_mapa = $mysqli->query($sql_mapa);
        
        if ($res_pagina->num_rows >= 1) {

            $array_pagina = $res_pagina->fetch_all();
            $array_mapa = $res_mapa->fetch_all();
            $response = array('codigo' => 0, 'dados' => $array_pagina, 'mapa' => $array_mapa);
            echo json_encode($response);

        } else if ($res_pagina->num_rows == 0) {

            $response = array('codigo' => 1, 'mensagem' => 'Sem páginas');
            echo json_encode($response);
            exit;

        } else {

            $response = array('codigo' => 3, 'mensagem' => 'Erro inesperado. Foi mal pessoal :(');
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
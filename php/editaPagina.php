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

        $sql_pagina = "select p.id, 
                        nome_pagina, 
                        concat(nome, ' ', sobrenome) nome_usuario_criacao, 
                        date_format(data_criacao, '%d/%m/%Y - %H:%i:%s') data_criacao,
                        date_format(data_alteracao, '%d/%m/%Y - %H:%i:%s') data_alteracao,  
                        html, 
                        css, 
                        javascript,
                        prod.nome_produto
                        
                        from pagina p
                        inner join usuario u
                        on p.id_usuario_criacao = u.id
                        left join produto prod
                        on p.id_produto = prod.id
                        where p.id = " . $_GET['pagina'];

        $sql_mapa = "call cria_mapa(" . $_GET['pagina'] . ")";

        $res_pagina = $mysqli->query($sql_pagina);
        $res_mapa = $mysqli->query($sql_mapa);
        
        if ($res_pagina->num_rows == 1) {
            $array_pagina = $res_pagina->fetch_all();
            $array_mapa = $res_mapa->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Página carregada com sucesso.', 'id_pagina' => $array_pagina[0][0], 'nome_pagina' => $array_pagina[0][1], 'nome_usuario_criacao' => $array_pagina[0][2], 'data_criacao' => $array_pagina[0][3], 'data_alteracao' => $array_pagina[0][4], 'html' => $array_pagina[0][5], 'css' => $array_pagina[0][6], 'js' => $array_pagina[0][7], 'mapa' => $array_mapa, 'produto' => $array_pagina[0][8]);
            echo json_encode($response);

        } else if ($res_pagina->num_rows == 0) {

            $response = array('codigo' => 1, 'mensagem' => 'Página não encontrada.');
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
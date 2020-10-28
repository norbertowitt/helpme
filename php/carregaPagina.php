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
        
        $sql_pagina = "select id, nome_pagina, html, css, javascript, permite_base_conhecimento from pagina where id = " . $_GET['pagina'];

        $sql_mapa = "call cria_mapa(" . $_GET['pagina'] . ")";

        $res_pagina = $mysqli->query($sql_pagina);
        $res_mapa = $mysqli->query($sql_mapa);
        
        if ($res_pagina->num_rows == 1) {

            $array_pagina = $res_pagina->fetch_all();
            $array_mapa = $res_mapa->fetch_all();
            $response = array('codigo' => 0, 'id' => $array_pagina[0][0], 'nome' => $array_pagina[0][1], 'html' => $array_pagina[0][2], 'css' => $array_pagina[0][3], 'js' => $array_pagina[0][4], 'usuario' => $_SESSION['usuario'], 'id_usuario' => $_SESSION['id_usuario'], 'mapa' => $array_mapa, 'permite_base_conhecimento' => $array_pagina[0][5]);
            echo json_encode($response);

        } else if ($res_pagina->num_rows == 0) {

            $response = array('codigo' => 1, 'mensagem' => 'Página não encontrada na base de dados.<br><br>Informe o erro à equipe do HelpMe.');
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
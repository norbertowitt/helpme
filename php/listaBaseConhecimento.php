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

        $sql_pagina = "select bc.id,
                        bc.nome_base_conhecimento,
                        concat(u.nome, ' ', u.sobrenome),
                        date_format(bc.data_criacao, '%d/%m/%Y - %H:%i:%s') criado_em,
                        date_format(bc.data_alteracao, '%d/%m/%Y - %H:%i:%s') alterado_em,
                        (select count(*) from avaliacao_base_conhecimento where bc.id = id_base_conhecimento and polegar = 'C') C,
                        (select count(*) from avaliacao_base_conhecimento where bc.id = id_base_conhecimento and polegar = 'B') B
                        
                        from base_conhecimento bc
                        inner join pagina p
                        on bc.id_pagina = p.id
                        left join usuario u
                        on bc.id_usuario_criacao = u.id
                        
                        where p.id = " . $_GET['pagina'] . "
                        and reservado = 'N'";

        $res_pagina = $mysqli->query($sql_pagina);
        
        if ($res_pagina->num_rows >= 1) {

            $array_pagina = $res_pagina->fetch_all();
            $response = array('codigo' => 0, 'dados' => $array_pagina);
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
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
        
        $sql_conhecimento = "select bc.id,
                                bc.nome_base_conhecimento,
                                concat(u.nome, ' ', u.sobrenome) nome_usuario,
                                pr.nome_produto,
                                p.nome_pagina,
                                date_format(bc.data_criacao, '%d/%m/%Y - %H:%i:%s') criado_em,
                                bc.html

                                from base_conhecimento bc
                                inner join pagina p
                                on bc.id_pagina = p.id
                                inner join usuario u
                                on bc.id_usuario_criacao = u.id
                                inner join produto pr
                                on p.id_produto = pr.id

                                where bc.id = " . $_GET['conhecimento'] . "
                                and reservado = 'N'";

        $res_conhecimento = $mysqli->query($sql_conhecimento);
        
        if ($res_conhecimento->num_rows == 1) {

            $array_conhecimento = $res_conhecimento->fetch_all();
            $response = array('codigo' => 0, 'id' => $array_conhecimento[0][0], 'nome_conhecimento' => $array_conhecimento[0][1], 'nome_usuario' => $array_conhecimento[0][2], 'produto' => $array_conhecimento[0][3], 'pagina' => $array_conhecimento[0][4], 'criado_em' => $array_conhecimento[0][5], 'html' => $array_conhecimento[0][6]);
            echo json_encode($response);

        } else if ($res_conhecimento->num_rows == 0) {

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
<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';
        
        $sql = "select id_pagina_equipe, nome_botao_equipe, tooltip, html_icone from equipe where ativo = 'S' order by ordem";

        $sql_permissao_bo = "select acessa_bo from perfil where id = " . $_SESSION['perfil'];

        if (!$resultado_permissao_bo = $mysqli->query($sql_permissao_bo)) {
            $permite_bo = "N";
        } else {
            $array_permissao = $resultado_permissao_bo->fetch_all();
            $permite_bo = $array_permissao[0][0];
        }

        if (!$resultado = $mysqli->query($sql)) {
            $response = array('codigo' => 2, 'mensagem' => 'Um erro ocorreu consultar os menus.', 'mensagem_erro' => $mysqli->error);
            echo json_encode($response);
            exit;
        } else {
            $array_menu = $resultado->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Menus consultados com sucesso.', 'equipe' => $array_menu, 'bo' => $permite_bo);
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
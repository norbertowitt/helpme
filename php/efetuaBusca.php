<?php 

session_start();
 
if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else if (!isset($_GET['query'])) {

    $response = array('codigo' => 2, 'mensagem' => 'Erro na URL.');
    echo json_encode($response);
    exit;

} else {
    
    try {

        $query = preg_replace('/\s+/', '%',trim($_GET['query'])); //Substitui espaços com %
        
        require_once '../bd/conecta.php';
        
        $sql_busca_pagina = "select 'Página' tipo, p.id id_pagina, pr.nome_produto, nome_pagina, substring(trim(retiraTags(p.html)),1,200) texto_pagina
                                from pagina p inner join produto pr on p.id_produto = pr.id
                                where (pr.nome_produto like '%" . $query . "%' or p.nome_pagina like '%" . $query . "%' or retiraTags(p.html) like '%" . $query . "%') and pagina_frontal <> 'S'
                                order by pr.nome_produto, p.nome_pagina";

        $sql_busca_conhecimento = "select 'Conhecimento' tipo, bc.id id_conhecimento, pr.nome_produto, bc.nome_base_conhecimento, substring(trim(retiraTags(bc.html)),1,100) texto_conhecimento
                                    from base_conhecimento bc inner join pagina p on bc.id_pagina = p.id inner join produto pr on p.id_produto = pr.id
                                    where bc.reservado = 'N' and (pr.nome_produto like '%" . $query . "%' or bc.nome_base_conhecimento like '%" . $query . "%' or retiraTags(bc.html) like '%" . $query . "%')
                                    order by pr.nome_produto, bc.nome_base_conhecimento";

        if (!$mysqli->query($sql_busca_pagina) || !$mysqli->query($sql_busca_conhecimento)) {

            $response = array('codigo' => 1, 'mensagem'=> $mysqli->error);
            echo json_encode($response);
            exit;

        } else {

            $resultado_bp = $mysqli->query($sql_busca_pagina);
            $resultado_bc = $mysqli->query($sql_busca_conhecimento);
            $array_bp = $resultado_bp->fetch_all();
            $array_bc = $resultado_bc->fetch_all();
            $response = array('codigo' => 0, 'mensagem' => 'Busca efetuada com sucesso.', 'res_pagina' => $array_bp, 'res_conhecimento' => $array_bc);
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
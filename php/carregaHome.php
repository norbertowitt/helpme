<?php 

session_start();

$data = DateTime::createFromFormat("d/m/Y", $_GET['data']);

if(!isset($_SESSION['usuario'])){

	$response = array('codigo' => 1, 'mensagem' => 'Você não está logado, não poderemos carregar esse conteúdo para você :(');
	echo json_encode($response);
    exit();
    
} else {
    
    try {
        
        require_once '../bd/conecta.php';

        $sql_mensagem_dia = "select concat(texto, ' ', emoji) mensagem_dia,
        case
            when hour(now()) between 0 and 11 then 'Bom dia!'
            when hour(now()) between 12 and 17 then 'Boa tarde!'
            when hour(now()) >= 18 then 'Boa noite!'
        end saudacao,
        concat((select dia_semana from dias_semana where id = dayofweek(now())), ', ', (select day(now())), ' de ', (select mes from meses where id = month(now())), ' de ', (select year(now())), '.') dia_extenso_hoje,
        concat((select dia_semana from dias_semana where id = dayofweek('" . $data->format('Y-m-d') . "')), ', ', (select day('" . $data->format('Y-m-d') . "')), ' de ', (select mes from meses where id = month('" . $data->format('Y-m-d') . "')), ' de ', (select year('" . $data->format('Y-m-d') . "')), '.') dia_extenso_requisitado,
        (select nome_equipe from equipe where id = " . $_GET['equipe'] . ") equipe
        
        from mensagens_semana
                            
        where id_dias_semana = dayofweek(now());";
        
        if (!$resultado_mensagem_dia = $mysqli->query($sql_mensagem_dia)) {
            $response = array('codigo' => 1, 'mensagem' => 'Um erro ocorreu ao consultar a mensagem do dia.', 'mensagem_erro' => $mysqli->error);
            echo json_encode($response);
            exit;
        } else {
            $array_mensagem_dia = $resultado_mensagem_dia->fetch_all();
        }

        $sql_pagina_home = "select date_format(dt_pagina, '%d/%m/%Y'),
                            concat((select dia_semana from dias_semana where id = dayofweek(dt_pagina)), ', ', (select day(dt_pagina)), ' de ', (select mes from meses where id = month(dt_pagina)), ' de ', (select year(dt_pagina)), '.') dia_extenso_pagina,
                            nome_equipe,
                            ch.titulo_card,
                            ch.resumo_card,
                            ch.id
                            
                            from dia_home dh
                            inner join pagina_home ph
                            on dh.id = ph.id_dia_home
                            inner join equipe e
                            on e.id = ph.id_equipe
                            inner join cards_home ch
                            on ph.id = ch.id_pagina_home
                            
                            where dh.dt_pagina = '" . $data->format('Y-m-d') . "'
                            and id_equipe = " . $_GET['equipe'] . "

                            order by ordem_card";
                            
        if (!$resultado_pagina_home = $mysqli->query($sql_pagina_home)) {
            $response = array('codigo' => 1, 'mensagem' => 'Um erro ocorreu ao consultar a página Home.', 'mensagem_erro' => $mysqli->error);
            echo json_encode($response);
            exit;
        } else {
            $array_pagina_home = $resultado_pagina_home->fetch_all();
        }

        if (empty($array_pagina_home)) {
            $dia_extenso = $array_mensagem_dia[0][3];
            $dados = '';
            $equipe = $array_mensagem_dia[0][4];
        } else {
            $dia_extenso = $array_pagina_home[0][1];
            $dados = $array_pagina_home;
            $equipe = $array_pagina_home[0][2];
        }

        $response = array('codigo' => 0, 'mensagem' => 'Dados carregados com sucesso!', 'mensagem_dia' => $array_mensagem_dia[0][0], 'dia_extenso' => $dia_extenso, 'saudacao' => $array_mensagem_dia[0][1],'dados' => $dados, 'equipe' => $equipe);
        echo json_encode($response);
        exit;

        
        /*

        $sql = "select id_pagina_equipe, nome_botao_equipe, tooltip, html_icone from equipe order by ordem";

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

        */
        
    
    } catch(Exception $e){
    
        $response = array('codigo' => 4, 'mensagem' => $e->getMessage());
        echo json_encode($response);
        exit;
    
    }

}

?>
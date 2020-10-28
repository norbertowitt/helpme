<?php

try {

    session_start();

    session_destroy();

    $response = array('codigo' => 0, 'mensagem' => 'Você foi deslogado com sucesso!');
    echo json_encode($response);

} catch (Exception $e) {

    $response = array('codigo' => 1, 'mensagem' => 'Algum erro ocorreu ao finalizar as sessões...');

}

?>
<?php

$requestPayload = file_get_contents("php://input");

$dto = json_decode($requestPayload);

try {

  $ldap_server = "10.64.0.8";
  $dominio = "@e-unicred";
  $user = $dto->usuario . $dominio;
  $ldap_porta = "389";
  $ldap_pass   = $dto->senha;
  $ldapcon = ldap_connect($ldap_server, $ldap_porta) or die ("Could not connect to LDAP server");

  if ($ldapcon) {
    
    $bind = @ldap_bind($ldapcon, $user, $ldap_pass);
    
    if ($bind) {
      
      require_once '../bd/conecta.php';

      $sql = "select id, nome, id_perfil, concat(nome,' ', sobrenome) nome_completo, id_equipe from usuario where usuario = '" . $dto->usuario . "'";

      $resultado = $mysqli->query($sql);

      if ($resultado->num_rows == 1) {

        session_start();
        $array = $resultado->fetch_all();
        $_SESSION['id_usuario'] = $array[0][0];
        $_SESSION['usuario'] = $array[0][1];
        $_SESSION['perfil'] = $array[0][2];
        $_SESSION['nome_completo'] = $array[0][3];
        $_SESSION['equipe'] = $array[0][4];
        $response = array('codigo' => 0, 'mensagem' => 'Login efetuado com sucesso! ^^', 'usuario' => $_SESSION['usuario'], 'equipe' => $_SESSION['equipe']);
        echo json_encode($response);
        exit();

      } else if ($resultado->num_rows == 0) {

        $response = array('codigo' => 1, 'mensagem' => 'Usuário não cadastrado na base do HelpMe.');
        echo json_encode($response);
        exit();

      } else if ($resultado->num_rows > 1) {

        $response = array('codigo' => 2, 'mensagem' => 'Dados duplicados, verifique o cadastro na Base de Dados!');
        echo json_encode($response);
        exit();

      } else {

        $response = array('codigo' => 3, 'mensagem' => 'Deu ruim! Um erro não mapeado ocorreu. So sorry...');
        echo json_encode($response);
        exit();

      }

    } else {
      
      $response = array('codigo' => 4, 'mensagem' => 'Usuário ou senha inválidos.');
      echo json_encode($response);
      exit();
    
    }
        
}

} catch(Exception $e){

  $response = array('codigo' => 5, 'mensagem' => $e->getMessage());
  echo json_encode($response);
  exit;

}

?>
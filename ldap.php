<?php

$ldap_server = "10.64.0.8";
$dominio = "@e-unicred"; //Dominio local ou global
$user = "norberto.neto" . $dominio;
$ldap_porta = "389";
$ldap_pass   = "zmPVSU*28";
$ldapcon = ldap_connect($ldap_server, $ldap_porta) or die("Could not connect to LDAP server");

if ($ldapcon){

// binding to ldap server
//$ldapbind = ldap_bind($ldapconn, $user, $ldap_pass);

$bind = ldap_bind($ldapcon, $user, $ldap_pass);

// verify binding
if ($bind) {
echo "LDAP bind successful…";
} else {
echo "LDAP bind failed…";
}

}

?>
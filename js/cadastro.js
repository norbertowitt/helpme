document.addEventListener("DOMContentLoaded", function(event) {
    function enviaCadastro(usuario, nome, equipe){
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "php/salvaCadastro.php");
        xhr.send(JSON.stringify({
            usuario: usuario,
            nome: nome,
            equipe: equipe
        }));
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);
                if (rdto.codigo == 0) {
                    alert("Cadastro enviado! Obrigado pela colaboração ;)")
                    document.getElementById("usuario").value = "";
                    document.getElementById("nome-sobrenome").value = "";
                    document.getElementById("equipe").value = "";
                } else {
                    alert("Algum erro ocorreu, tente novamente ;)")
                    console.log(rdto);
                }
            }
        }
    }

    document.getElementById("botao-enviar").addEventListener("click", function(){
        var usuario = document.getElementById("usuario").value;
        var nome = document.getElementById("nome-sobrenome").value;
        var equipe = document.getElementById("equipe").value;

        if (!usuario || !nome || !equipe) {
            alert("Algum campo está vazio!")
        } else {
            enviaCadastro(usuario, nome, equipe);
        }

    })

})
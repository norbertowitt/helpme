document.addEventListener("DOMContentLoaded", function() {

    // ###################### Funções ######################

    function reservaConhecimento(id_pagina, novo) {
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "php/reservaConhecimento.php");
        xhr.send(JSON.stringify({
            pagina: id_pagina
        }));
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);
                var url = window.location.href;
                url = url.split('?');
                window.location.replace(url[0] + '?pg=' + id_pagina + '&novo=false&id=' + rdto.id);
                preencheDadosConhecimento(rdto.id);
            }
        }
    }

    function preencheDadosConhecimento(id_conhecimento) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "php/preencheDadosConhecimento.php?conhecimento=" + id_conhecimento);
        xhr.send();
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);

                if (rdto.reservado == 'N') {
                    window.removeEventListener('beforeunload', bu, false);
                    window.location.href = 'ler-conhecimento.html?conhecimento=' + id_conhecimento;
                } else {
                    document.getElementById("numero").value = rdto.id;
                    document.getElementById("autor").value = rdto.nome_usuario;
                    document.getElementById("produto").value = rdto.produto;
                    document.getElementById("data-hora").value = rdto.criado_em;
                    document.getElementById("pagina").value = rdto.pagina;
                }
            }
        }
    }

    function salvaConhecimento (id_conhecimento,titulo_conhecimento,html_conhecimento) {
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "php/salvaConhecimento.php");
        xhr.send(JSON.stringify({
            id: id_conhecimento,
            titulo: titulo_conhecimento,
            html: html_conhecimento
        }));
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);
                if (rdto.codigo == 0) {
                    alert(rdto.mensagem);
                    window.removeEventListener('beforeunload', bu, false);
                    window.location.replace ('conhecimento_ler.html?conhecimento=' + id_conhecimento);

                } else {
                    alert("Ocorreu um erro ao salvar: " + rdto.mensagem);
                }

            }
        }
    }

    function carregaTinyMce() {
        tinymce.init({
            selector: '#conhecimento',
            plugins: 'powerpaste lists',
            toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect | bullist',
            language: 'pt_BR',
            menubar: false
        });
    }

    // ###################### Eventos ######################

    document.getElementById("home").addEventListener("click", function() {
        window.location.href = 'hall.html?pg=1';
    });

    document.getElementById("salvar").addEventListener("click", function() {
        if (document.getElementById("titulo").value == "") {
            alert("O título está vazio, informe um título!")
        } else {
            var r = window.confirm("Você deseja mesmo salvar o Conhecimento? \n\nNão será mais possível editá-lo!"); /* Pede confirmação de logoff */
            if (r === true) {
                var url = window.location.href;
                var res = url.split('?');
                res = res[1].split('&');
                var id_conhecimento = (res[2].split('='))[1];
                salvaConhecimento(id_conhecimento,document.getElementById("titulo").value,tinyMCE.get('conhecimento').getContent());
            }
        }

    });

    document.getElementById("cancelar").addEventListener("click", function() {
        var r = window.confirm("Você deseja mesmo cancelar a criação do conhecimento?"); /* Pede confirmação de logoff */
        if (r === true) {
            var url = window.location.href;
            var res = url.split('?');
            res = res[1].split('&');
            var pagina = (res[0].split('='))[1];
            window.removeEventListener('beforeunload', bu, false);
            window.location.replace('hall.html?pg=' + pagina);
        }
    });

    window.addEventListener("beforeunload", bu = function(e) {
        e.returnValue = '';
    });

    // ###################### Procedural ######################

    carregaTinyMce();

    try {
		var url = window.location.href;
        var res = url.split('?');
        res = res[1].split('&');
        var pagina = (res[0].split('='))[1];
        var novo = (res[1].split('='))[1];
        try {
            var id = (res[2].split('='))[1];
        } catch(e) {
            console.log("Ainda não possuímos um ID informado pelo sistema");
            console.log(e);
        }
        
        if (novo == "true") {
            reservaConhecimento(pagina, true);
        } else {
            preencheDadosConhecimento(id);
        } 

	} catch (e) {
        window.removeEventListener('beforeunload', bu, false);
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
        console.log(e);
        document.getElementById("corpo").innerHTML = '<h1>Há algum erro na URL. Por motivos de segurança do BD feche a página e clique novamente em Adicionar';
	}

});
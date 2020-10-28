document.addEventListener("DOMContentLoaded", function(event) {

	// ################################ Funções ################################

    function carregaConhecimento(id_conhecimento) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "php/carregaConhecimento.php?conhecimento=" + id_conhecimento);
        xhr.send();
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);

                var el_info = document.getElementById("info-conhecimento");
                var el_texto = document.getElementById("texto-conhecimento");

                el_info.innerHTML = '<div class="row pt-2"><div class="col-12"><h2>' + rdto.nome_conhecimento + '</h2></div></div>';
                el_info.insertAdjacentHTML('beforeend', '<div class="row"><div class="col-12">Criado por <strong>' +  rdto.nome_usuario + '</strong> em <strong>' + rdto.criado_em + '</strong></div></div>');
                el_info.insertAdjacentHTML('beforeend', '<div class="row"><div class="col-12">Serviço <strong>' + rdto.pagina + '</strong> do Produto <strong>' + rdto.produto + '</strong></div></div>');
                el_texto.innerHTML = rdto.html;

                // Ajusta tamanho do campo de leitura

                var cabecalho = document.getElementById("row-cabecalho").clientHeight;
                var divisor = document.getElementById("row-divisor").clientHeight;
                var info = document.getElementById("row-info-conhecimento").clientHeight;
                var divisor_hr = document.getElementById("divisor-hr").clientHeight;
                el_texto.style.height = (window.innerHeight - (cabecalho + divisor + info + divisor_hr)) + 'px';
                window.addEventListener("resize", function() {
                    el_texto.style.height = (window.innerHeight - (cabecalho + divisor + info + divisor_hr)) + 'px';
                });


            }
        }
    }

    function avaliar(id_conhecimento, id_avaliacao) {
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "php/avaliaConhecimento.php");
        xhr.send(JSON.stringify({
            conhecimento: id_conhecimento,
            avaliacao: id_avaliacao
        }));
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);
                console.log(rdto);

                if (rdto.avaliacao == "C" && rdto.operacao == "I") {
                    document.getElementById("pol-baixo").style.backgroundColor = "black";
                    document.getElementById("pol-cima").style.backgroundColor = "green";
                } else if (rdto.avaliacao == "C" && rdto.operacao == "D") {
                    document.getElementById("pol-cima").style.backgroundColor = "black";
                } else if (rdto.avaliacao == "B" && rdto.operacao == "I") {
                    document.getElementById("pol-cima").style.backgroundColor = "black";
                    document.getElementById("pol-baixo").style.backgroundColor = "red";
                } else if (rdto.avaliacao == "B" && rdto.operacao == "D") {
                    document.getElementById("pol-baixo").style.backgroundColor = "black";
                }

            }
        }
    }

    function verificaAvalicao(id_conhecimento) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "php/verificaAvaliacaoConhecimento.php?conhecimento=" + id_conhecimento);
        xhr.send();
        xhr.onload = function() {
            if (xhr.status != 200) {
                alert(`Error ${xhr.status}: ${xhr.statusText}`);
            } else {
                var rdto = JSON.parse(xhr.response);
                console.log(rdto);

                if (rdto.codigo == 0 && rdto.avaliacao == 'C') {
                    document.getElementById("pol-cima").style.backgroundColor = "green";
                } else if (rdto.codigo == 0 && rdto.avaliacao == 'B') {
                    document.getElementById("pol-baixo").style.backgroundColor = "red";
                }

            }
        }
    }

    // ################################ Eventos ################################

    document.getElementById("home").addEventListener("click", function() {
        window.location.href = 'hall.html?pg=1';
    });

    document.getElementById("pol-cima").addEventListener("click", function() {
        try {
            var url = window.location.href;
            var res = url.split('?');
            id_conhecimento = (res[1].split('='))[1];
            avaliar(id_conhecimento,'C');
    
        } catch (e) {
            console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
            console.log(e);
            document.getElementById("corpo").innerHTML = '<h1>Há algum erro na URL. Por motivos de segurança do BD, abra novamente seu conhecimento.';
        }
    })

    document.getElementById("pol-baixo").addEventListener("click", function() {
        try {
            var url = window.location.href;
            var res = url.split('?');
            id_conhecimento = (res[1].split('='))[1];
            avaliar(id_conhecimento,'B');
    
        } catch (e) {
            console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
            console.log(e);
            document.getElementById("corpo").innerHTML = '<h1>Há algum erro na URL. Por motivos de segurança do BD, abra novamente seu conhecimento.';
        }
    })


    // ################################ Procedural ################################

    try {
		var url = window.location.href;
        var res = url.split('?');
        id_conhecimento = (res[1].split('='))[1];
        carregaConhecimento(id_conhecimento);
        verificaAvalicao(id_conhecimento);

	} catch (e) {
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
        console.log(e);
        document.getElementById("corpo").innerHTML = '<h1>Há algum erro na URL. Por motivos de segurança do BD, abra novamente seu conhecimento.';
    }

});

document.addEventListener("DOMContentLoaded", function(event) {

	window.onpopstate = function(event) {

		carregaPaginaEdicao(event.state.pagina,true);

	};

	// ################################ Funções ################################
	
	/* Função verificaSessao adaptada à página Hall 
	Se existir sessão, coloca o nome do usuário no header 
	Se não existir sessão, direciona para login dizendo que logado=false (usado para mostrar mensagem adequada) */

	function verificaSessao() {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "php/verificaSessaoEditor.php");
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					console.log(rdto.mensagem);
					nome = document.getElementById("nome");
					nome.innerHTML = "Oi, " + rdto.usuario + '!'; /* Coloca o nome do usuário no Header */
				} else if (rdto.codigo == 2) {
					window.location.href = 'sem-permissao.html';
				} else {
					window.location.href = 'index.html?logado=false'; /* Direciona dizendo que não está logado */
				}
			}
		};
	}

	/* Carrega página recebe o parâmetro id com o id da página a ser carregada. O HTML será requisitado ao BD no arquivi carregaPagina.php.
	O parâmetro volta recebe o valor false ou true, usado para identificar se trata-se de uma volta de página no histórico ou carregamento normal.
	Se for true, nenhum novo histórico é gravado. Se for false, é dada a entrada da página atual carregada para o histórico do navegador. */

	function carregaPagina(idPagina,volta) {
		if (idPagina === undefined || idPagina == "") {
			var feed = document.getElementById("feed");
			feed.innerHTML = '<h1>Há algo de errado na URL :(</h1>';
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "../pagina/carregaPagina.php?pagina=" + idPagina, true);
			xhr.send();
			xhr.onload = function() {
				if (xhr.status != 200) { // analyze HTTP status of the response
					alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
				} else {
					var rdto = JSON.parse(xhr.response);

					if (volta == false) {
						url = window.location.href;
						if (url.indexOf('?') != -1) {
							res = url.split('?');
							estado = {pagina:idPagina};
							history.pushState(estado, 'HelpMe', res[0] + '?pg=' + idPagina);
						} else {
							window.location.href = './hall.html?pg=1';
						}
					}

					if (rdto.codigo == 0) {
						inserirEstilo(rdto.css);
						arquivojs = rdto.usuario + rdto.id;
						inserirScript('./js/' + btoa(arquivojs) + '.js');
						document.getElementById("feed").innerHTML = rdto.html;
					} else {
						document.getElementById("feed").innerHTML = '<h1>' + rdto.mensagem + '</h1>';
					}
				}
			};
		}
	}

	// Função efetuaLogoff destrói sessão

	function efetuaLogoff() {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '../usuario/efetuaLogoff.php');
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					window.location.href = '../index.html?logado=deslogado';
				} else {
					console.log("Erro: " + rdto);
				}
			}
		};
	}

	/* Função inserirEstilo para estilizar as páginas carregadas no feed.
	Insere tag <style> no head com o CSS das páginas */
	
	function inserirEstilo(estilos) { 
              
		// Cria elemento style
		var css = document.createElement('style'); 
   
		if (css.styleSheet)  
			css.styleSheet.cssText = estilos; 
		else  
			css.appendChild(document.createTextNode(estilos)); 
		  
		// Insere o elemnto style na head
		document.getElementsByTagName("head")[0].appendChild(css); 
	}

	// Função inserir script insere a tag <script> com o endereço do arquivo .js que foi criado pelo arquivo carregaPagina.php.
	// Por questões de segurança, o js é carregado via arquivo ao invés de tag.

	function inserirScript(script) { 
              
		/* Cria elemento style */ 
		var js = document.createElement('script'); 
		js.type = 'text/javascript'; 
		js.src = script;
		  
		/* Insere o elemnto style na head */ 
		document.getElementsByTagName("head")[0].appendChild(js); 
	}

	function carregaPaginaEdicao(id_pagina, volta) {

		if (id_pagina === undefined || id_pagina == "") {
			var feed = document.getElementById("corpo");
			feed.innerHTML = '<h1>Há algo de errado na URL :(</h1>';
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "php/editaPagina.php?pagina=" + id_pagina, true);
			xhr.send();
			xhr.onload = function() {
				if (xhr.status != 200) { // analyze HTTP status of the response
					alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
				} else {
					var rdto = JSON.parse(xhr.response);

					// Testa se é volta de histórico

					if (volta == false) {
						url = window.location.href;
						if (url.indexOf('?') != -1) {
							res = url.split('?');
							estado = {pagina:id_pagina};
							history.pushState(estado, 'HelpMe - Editor', res[0] + '?pg=' + id_pagina);
						} else {
							window.location.href = 'backoffice.html?pg=2';
						}
					}

					// Constrói o Mapa

					for (let i=0; i<rdto.mapa.length; i++) {
						if (rdto.mapa.length == 1) {
							var mapa = '<div pagina="'+ rdto.mapa[i][0] +'" class="mapa">' + rdto.mapa[i][1] + '</div>';
						} else {
							if (i==0) {
								var mapa = '<div pagina="'+ rdto.mapa[i][0] +'" class="mapa">' + rdto.mapa[i][1] + '</div>';
							} else {
								var mapa = mapa + ' > ' + '<div pagina="'+ rdto.mapa[i][0] +'" class="mapa">' + rdto.mapa[i][1] + '</div>';
							}
						}
					}

					// Insere o mapa no HTML

					document.getElementById("mapa").innerHTML = mapa;

					// Cria eventos do mapa

					var item = document.getElementsByClassName('mapa');
					for (let i = 0; i < item.length; i++) {
						item[i].addEventListener('click', function() {
							editor_html.destroy();
							editor_css.destroy();
							editor_js.destroy();
							carregaPaginaEdicao(item[i].attributes.pagina.value, false);
						});
					}
					
					// Insere informações da Página

					document.getElementById("nome-pagina").innerHTML = '<h2 class="display-4">Página: <strong>' + rdto.nome_pagina + '</strong></h2>';
					document.getElementById("id-pagina").innerHTML = rdto.id_pagina;
					document.getElementById("produto").innerHTML = rdto.produto;
					document.getElementById("criado-por").innerHTML = rdto.nome_usuario_criacao;
					document.getElementById("criado-em").innerHTML = rdto.data_criacao;

					// Insere conteúdo nos campos editores

					document.getElementById("editor-html").textContent = rdto.html;
					document.getElementById("editor-css").textContent = rdto.css;
					document.getElementById("editor-js").textContent = rdto.js;

					// Dimensiona Ace (editor)

					var conteudo_tab = document.getElementById("conteudo-tab");
					var largura = conteudo_tab.clientWidth;
					var estilo_computado = getComputedStyle(conteudo_tab);
					var tamanho = largura - (parseInt(estilo_computado.paddingLeft,10) * 4);
					var estilo = '#editor-html, #editor-css, #editor-js {top: 0px; left: 0px; width: ' +tamanho+ 'px; height: 372px; font-size:14px;}'
					inserirEstilo(estilo);

					// Carrega Ace (editor)

					var editor_html = ace.edit("editor-html");
					var editor_js = ace.edit("editor-js");
					var editor_css = ace.edit("editor-css");


					editor_html.setTheme("ace/theme/monokai");
					editor_css.setTheme("ace/theme/monokai");
					editor_js.setTheme("ace/theme/monokai");

					editor_html.session.setMode("ace/mode/html");
					editor_css.session.setMode("ace/mode/css");
					editor_js.session.setMode("ace/mode/javascript");

					editor_html.session.setUseWrapMode(true);
					editor_css.session.setUseWrapMode(true);
					editor_js.session.setUseWrapMode(true);

				}
			}
		}
	}

	function salvaPagina(id_pagina) {
		var editor_html = ace.edit("editor-html");
		var editor_css = ace.edit("editor-css");
		var editor_js = ace.edit("editor-js");

		var codigo_html = editor_html.getValue();
		var codigo_css = editor_css.getValue();
		var codigo_js = editor_js.getValue();

		console.log(codigo_js);

		var xhr = new XMLHttpRequest();
		xhr.open('PUT', 'php/salvaPagina.php');
		xhr.send(JSON.stringify({
			pagina: id_pagina,
			html: codigo_html,
			css: codigo_css,
			js: codigo_js
		}));
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				//var rdto = JSON.parse(xhr.response);
				console.log(xhr.response);
			}
		};



	}

	// ################################ Eventos ################################

	window.onpopstate = function(event) {
		carregaPaginaEdicao(event.state.pagina, true);
	};

	document.getElementById("salvar").addEventListener("click", function() {

		var r = window.confirm("Você deseja mesmo salvar TODO o novo conteúdo?"); /* Pede confirmação de logoff */
		if (r === true) {
			url = window.location.href;
			res = url.split('?');
			parametro = res[1].split('=');
			salvaPagina(parametro[1]);
		}
	});

	// ################################ Procedural ################################

	verificaSessao();

	try {
		url = window.location.href;
		res = url.split('?');
		parametro = res[1].split('=');
		carregaPaginaEdicao(parametro[1],false); /* Solicitamos os dados da página */
	} catch (e) {
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
		console.log(e);
		window.location.href = 'backoffice.html?pg=2';
	}























	/*

	// ################################ Eventos ################################

	// Evento acionado por botões <- ou -> do navegador. A página é carregada quando Voltar ou Avançar no histórico.

	window.onpopstate = function(event) {

		carregaPagina(event.state.pagina,true);

	  };

	// Criação dos eventos de clique dos botões do menu da esquerda
	// Cada botão tem um evento para si que foram criados pelo for

	var item = document.getElementsByClassName('item-menu-esquerda');
    for (let i = 0; i < item.length; i++) {
        item[i].addEventListener('click', function(){
			carregaPagina(item[i].attributes.pagina.value,false);
        });
	}

	//Evento de clique para Logoff
	//Pede confirmação através do método confirm()

	document.getElementById("logoff").addEventListener("click", function() {
		var r = window.confirm("Você deseja mesmo sair?"); // Pede confirmação de logoff
		if (r === true) {
			efetuaLogoff();
		}
	});

	// ################################ Procedural ################################
    
	// Ao iniciar o documento, verificamos primeiramente se o usuário está logado
	// Se estiver logado, permanece na página. Se não estiver, é encaminhado ao login
    
    verificaSessao();
    
    // Após, capturamos o número da página na url para requisitarmos ao Banco de Dados o HTML que vamos carregar
    
	try {
		url = window.location.href;
		res = url.split('?');
		parametro = res[1].split('=');
		carregaPagina(parametro[1],false); // Solicitamos o carregamento da página
	} catch (e) {
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
		console.log(e);
		window.location.href = './hall.html?pg=1';
	} 

	*/

});
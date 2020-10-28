document.addEventListener("DOMContentLoaded", function(event) {

	/* Função verificaSessao adaptada à página Backoffice */
	/* Se existir sessão, coloca o nome do usuário no header */
	/* Se não existir sessão, direciona para login dizendo que logado=false (usado para mostrar mensagem adequada) */

	function verificaSessao() {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "php/verificaSessaoBo.php");
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

	/* Carrega página recebe o parâmetro id com o id da página a ser carregada. O HTML será requisitado ao BD no arquivi PHP. */
	/* O parâmetro volta recebe o valor false ou true, usado para identificar se trata-se de uma volta de página no histórico ou carregamento normal.
	Se for true, nenhum novo histórico é gravado. Se for false, é dada a entrada da página atual carregada para o histórico do navegador. */

	function carregaPagina(idPagina, volta) {
		if (idPagina === undefined || idPagina == "") {
			var feed = document.getElementById("feed");
			feed.innerHTML = '<h1>Há algo de errado na URL :(</h1>';
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "php/listaPaginaBo.php?pagina=" + idPagina, true);
			xhr.send();
			xhr.onload = function() {
				if (xhr.status != 200) {
					alert(`Error ${xhr.status}: ${xhr.statusText}`);
				} else {

					/* Captura retorno do BD */
					var rdto = JSON.parse(xhr.response);

					/* Testa se é uma volta de página ou carregamento normal */
					if (volta == false) {
						url = window.location.href;
						if (url.indexOf('?') != -1) {
							res = url.split('?');
							estado = {
								pagina: idPagina
							};
							history.pushState(estado, 'HelpMe', res[0] + '?pg=' + idPagina);
						} else {
							window.location.href = 'backoffice.html?pg=1';
						}
					}

					// Se o retorno for 0
					if (rdto.codigo == 0) {

						// Cria o mapa
						for (let i = 0; i < rdto.mapa.length; i++) {
							if (rdto.mapa.length == 1) {
								var mapa = '<div pagina="' + rdto.mapa[i][0] + '" class="mapa">' + rdto.mapa[i][1] + '</div>';
							} else {
								if (i == 0) {
									var mapa = '<div pagina="' + rdto.mapa[i][0] + '" class="mapa">' + rdto.mapa[i][1] + '</div>';
								} else {
									var mapa = mapa + ' > ' + '<div pagina="' + rdto.mapa[i][0] + '" class="mapa">' + rdto.mapa[i][1] + '</div>';
								}
							}
						}

						// Monta o HTML do Mapa e da tabela com as Páginas cadastradas no BD
						var html = '<div class="row"><div class="cabecalho-mapa col-12 d-flex align-items-center pl-1">' + mapa + '</div></div>';
						html = html + '<div class="row"><div class="col-12">';
						html = html + '<table class="table tabela-pagina mx-auto">';
						html = html + '<thead class="thead-dark"><tr>';
						html = html + '<th scope="col">ID</th>';
						html = html + '<th scope="col">Nome</th>';
						html = html + '<th scope="col">Criado Por</th>';
						html = html + '<th scope="col">Criado Em</th>';
						html = html + '<th scope="col">Modificado Em</th>';
						html = html + '<th scope="col">Ações <i id="adicionar" class="fas fa-plus-circle"></i></th>';
						html = html + '</thead></tr>';
						html = html + '<tbody>';
						if (rdto.dados[0][0]==null) {
							html = html + '<td colspan=6><strong>Crie a primeira página desta camada!</strong></td></tr>';
						} else {
							for (let i = 0; i < rdto.dados.length; i++) {
								html = html + '<tr class="linha-tabela" pagina="' + rdto.dados[i][0] + '">';
								html = html + '<th scope="row">' + rdto.dados[i][0] + '</th>';
								html = html + '<td>' + rdto.dados[i][1] + '</td>';
								html = html + '<td>' + rdto.dados[i][2] + '</td>';
								html = html + '<td>' + rdto.dados[i][3] + '</td>';
								html = html + '<td>' + rdto.dados[i][4] + '</td>';
								html = html + '<td><i pagina="' + rdto.dados[i][0] + '" class="fas fa-edit editar"></i><i pagina="' + rdto.dados[i][0] + '" class="fas fa-trash-alt apagar"></i></td></tr>';
							}
						}

						html = html + '</tbody></table></div></div>';

						// Acopla ao HTML do feed
						document.getElementById("feed").innerHTML = html;

						// Cria os eventos de clique para Mapa e Tabela
						var item = document.getElementsByClassName('mapa');
						for (let i = 0; i < item.length; i++) {
							item[i].addEventListener('click', function() {
								carregaPagina(item[i].attributes.pagina.value, false);
							});
						}
						var item2 = document.getElementsByClassName('linha-tabela');
						for (let i = 0; i < item2.length; i++) {
							item2[i].addEventListener('click', function() {
								carregaPagina(item2[i].attributes.pagina.value, false);
							});
						}
						var item3 = document.getElementsByClassName('editar');
						for (let i = 0; i < item3.length; i++) {
							item3[i].addEventListener('click', function(e) {
								e.stopPropagation();
								editaPagina(item3[i].attributes.pagina.value);
							});
						}
						var item4 = document.getElementsByClassName('apagar');
						for (let i = 0; i < item4.length; i++) {
							item4[i].addEventListener('click', function(e) {
								e.stopPropagation();
								var r = window.confirm("Você deseja mesmo DELETAR a página selecionada?"); /* Pede confirmação de logoff */
								if (r === true) {
									deletaPagina(item4[i].attributes.pagina.value);
								}
							});
						}
						document.getElementById("adicionar").addEventListener("click", function() {
							abreModalAdicionaPagina();
						});

					// Se o	retorno for 1 (sem página) sugere a criação
					} 
				}
			}
		}
	}

	function efetuaLogoff() {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'php/efetuaLogoff.php');
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				window.location.href = 'index.html?logado=deslogado';
			}
		};
	}

	function inserirEstilo(estilos) {
		/* Cria elemento style */
		var css = document.createElement('style');
		css.type = 'text/css';
		if (css.styleSheet)
			css.styleSheet.cssText = estilos;
		else
			css.appendChild(document.createTextNode(estilos));
		/* Insere o elemnto style na head */
		document.getElementsByTagName("head")[0].appendChild(css);
	}

	function inserirScript(script) {
		/* Cria elemento style */
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = script;
		/* Insere o elemnto style na head */
		document.getElementsByTagName("head")[0].appendChild(js);
	}

	function createCookie(name, value, days) {
		var expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		} else {
			expires = "";
		}
		document.cookie = name + "=" + value + expires + "; path=/";
	}

	/* Função para capturar facilmente um Cookie e sua duração  */

	function getCookie(c_name) {
		if (document.cookie.length > 0) {
			c_start = document.cookie.indexOf(c_name + "=");
			if (c_start != -1) {
				c_start = c_start + c_name.length + 1;
				c_end = document.cookie.indexOf(";", c_start);
				if (c_end == -1) {
					c_end = document.cookie.length;
				}
				return unescape(document.cookie.substring(c_start, c_end));
			}
		}
		return "";
	}

	// Carrega a página para edição

	function editaPagina(id_pagina) {
		window.location.href = 'editor.html?pg=' + id_pagina;
	}

	// Adiciona nova página

	function adicionarPagina(nome_pagina,menu_atual) {
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", "php/inserePagina.php");
		xhr.send(JSON.stringify({
			nome: nome_pagina,
			id_anterior: menu_atual
		}));
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				
				if (rdto.codigo == 0) {
					fechaModalAdicionaPagina();
					location.reload();
				}
			}
		};
	}

	// Função para abrir modal de adicionar página

	function abreModalAdicionaPagina() {

		document.getElementById("row-cabecalho").style.filter = "blur(2px)";
		document.getElementById("row-divisor").style.filter = "blur(2px)";
		document.getElementById("menu-esquerda").style.filter = "blur(2px)";
		document.getElementById("feed").style.filter = "blur(2px)";
		document.getElementById("modal-adicionar-pagina").style.display = "block";

		document.getElementById("adicionar-nova-pagina").addEventListener("click", function() {

			var campo_nome = document.getElementById("nome-nova-pagina");

			if (campo_nome.value == "" || campo_nome.value == undefined) {
				alert("O campo Nome é obrigatório!");
			} else {

				var r = window.confirm("Você deseja mesmo INSERIR a nova página?"); // Pede confirmação de PARA INSERIR
				if (r === true) {
					try {
						var url = window.location.href;
						var res = url.split('?');
						var parametro = res[1].split('=');
						var id_pagina_atual = parametro[1];
						adicionarPagina(campo_nome.value, id_pagina_atual);
					} catch (e) {
						Alert("Algum erro ocorreu ao tentar capturar o parâmetro da URL, nenhuma ação foi salva.");
						console.log(e);
						window.location.href = './backoffice.html?pg=1';
					}
				}

			}

		});

		document.getElementById("cancelar").addEventListener("click", function() {
			fechaModalAdicionaPagina();
		});

		var fecha_modal = function (e) {
			if (e.key == "Escape") {
				fechaModalAdicionaPagina();
				window.removeEventListener("keyup", fecha_modal);
			}
		}

		window.addEventListener("keyup", fecha_modal);
	}

	// Função para fechar modal de adicionar página

	function fechaModalAdicionaPagina() {
		document.getElementById("modal-adicionar-pagina").style.display = "none";
		document.getElementById("row-cabecalho").style.filter = null;
		document.getElementById("row-divisor").style.filter = null;
		document.getElementById("menu-esquerda").style.filter = null;
		document.getElementById("feed").style.filter = null;
	}

	function deletaPagina(id_pagina){
		var xhr = new XMLHttpRequest();
		xhr.open("DELETE", "php/deletaPagina.php");
		xhr.send(JSON.stringify({
			pagina: id_pagina,
		}));
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				
				if (rdto.codigo == 0) {
					location.reload();
				} else {
					console.log(rdto);
				}
			}
		};
	}

	// ########################### Eventos ###########################

	/* Carregar a página quando Voltar ou Avançar no histórico. */

	window.onpopstate = function(event) {
		carregaPagina(event.state.pagina, true);
	};

	// Evento de clique para Logoff

	document.getElementById("logoff").addEventListener("click", function() {
		efetuaLogoff();
	});

	// Criação dos eventos de clique dos botões do menu da esquerda

	var item = document.getElementsByClassName('item-menu-esquerda');
	for (let i = 0; i < item.length; i++) {
		item[i].addEventListener('click', function() {
			carregaPagina(item[i].attributes.pagina.value, false);
		});
	}



	// ########################### Procedural ###########################

	// Ao iniciar o documento, verificamos primeiramente se o usuário está logado

	verificaSessao();

	// Após, capturamos o número da página na url para requisitarmos ao Banco de Dados o HTML que vamos carregar

	try {
		var url = window.location.href;
		var res = url.split('?');
		var parametro = res[1].split('=');
		carregaPagina(parametro[1], false); /* Solicitamos os dados da página */
	} catch (e) {
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
		console.log(e);
		window.location.href = './backoffice.html?pg=1';
	}
});
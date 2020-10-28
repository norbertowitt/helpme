document.addEventListener("DOMContentLoaded", function(event) {

	// ################################ Funções ################################

	// Função verificaSessao adaptada à página Hall
	// Se existir sessão, coloca o nome do usuário no header
	// Se não existir sessão, direciona para login dizendo que logado=false (usado para mostrar mensagem adequada)
	function verificaSessao() {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "php/verificaSessao.php");
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					criaCookie("hoje", rdto.hoje);
					console.log(rdto.mensagem);
					var nome = document.getElementById("nome");
					nome.innerHTML = "Oi, " + rdto.usuario + '!'; /* Coloca o nome do usuário no Header */
				} else {
					window.location.href = 'index.html?logado=false'; /* Direciona dizendo que não está logado */
				}
			}
		}
	}

	// Carrega os menus das equipes
	function carregaMenuEquipe() {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/carregaMenuEquipeHall.php", true);
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) {
				alert(`Error ${xhr.status}: ${xhr.statusText}`);
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					var html = '';
					for (let i = 0; i < rdto.equipe.length; i++) {
						html += '<div pagina="' + rdto.equipe[i][0] + '" class="item-menu-esquerda d-flex align-items-center" data-toggle="tooltip" data-placement="right" title="' + rdto.equipe[i][2] + '">';
						html += rdto.equipe[i][3];
						html += '<div class="texto-item-menu-esquerda">' + rdto.equipe[i][1] + '</div></div>';
					}
					document.getElementById("menu").innerHTML = html;
					$('[data-toggle="tooltip"]').tooltip()
					var item = document.getElementsByClassName('item-menu-esquerda');
					for (let i = 0; i < item.length; i++) {
						item[i].addEventListener('click', function() {
							carregaPagina(item[i].attributes.pagina.value, false);
						});
					}
					if (rdto.bo == "S") {
						html = '<div id="bo-hm" class="item-menu-esquerda d-flex align-items-center" data-toggle="tooltip" data-placement="right" title="Acessar o BO das páginas do HM.">';
						html += '<i class="fas fa-atom"></i>';
						html += '<div class="texto-item-menu-esquerda">Backoffice HM</div></div>';
						document.getElementById("menu").insertAdjacentHTML('beforeend', html);
						document.getElementById("bo-hm").addEventListener("click", function(){
							window.open('backoffice.html', '_blank');
						});
					}
					
				} else {
					console.log("carregaEquipeHall.php: Código: " + rdto.codigo + ". Mensagem: " + rdto.mensagem);
				}
			}
		}
	}

	// Carrega página recebe o parâmetro id com o id da página a ser carregada. O HTML será requisitado ao BD no arquivi carregaPagina.php.
	// O parâmetro volta recebe o valor false ou true, usado para identificar se trata-se de uma volta de página no histórico ou carregamento normal.
	// Se for true, nenhum novo histórico é gravado. Se for false, é dada a entrada da página atual carregada para o histórico do navegador.
	carregaPagina = function(id_pagina, pop) {
		document.getElementById("pesquisa").value = '';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/carregaPagina.php?pagina=" + id_pagina, true);
		xhr.onprogress = function() {
			loaderFeed(true)
		};
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				// document.getElementById("feed").scrollTop = 0;
				var rdto = JSON.parse(xhr.response);

				if (pop == false) {
					var url = window.location.href;
					url = (url.split('?'))[0] + '?pg=' + id_pagina;
					var estado = {
						pagina: id_pagina
					};
					gravaHistorico(estado, url);
				}
				if (rdto.codigo == 0) {
					
					limpaEstiloScript();
					carregaMapa(rdto.mapa);
					document.getElementById("feed").insertAdjacentHTML('beforeend', rdto.html);
					insereEstilo(rdto.css);
					insereScript(rdto.js);

					if (rdto.permite_base_conhecimento == "S") {
						listaBaseConhecimento(id_pagina);
					}
				} else {
					document.getElementById("feed").innerHTML = '<h1>' + rdto.mensagem + '</h1>';
				}
			}
			loaderFeed(false);
		};
	}

	// Carrega base de conhecimento
	function listaBaseConhecimento(id_pagina) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/listaBaseConhecimento.php?pagina=" + id_pagina, true);
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr2.status}: ${xhr2.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				console.log(rdto.dados)
				// Cria a tabela de bases de conhecimento
				var html = '<div class="row mt-4"><div class="col-12"><h2>Bases de conhecimento</h2></div></div>'
				html += '<div class="row mt-2"><div class="col-12">';
				html += '<table class="table tabela-pagina mx-auto">';
				html += '<thead class="thead-dark text-center"><tr>';
				html += '<th scope="col">ID</th>';
				html += '<th scope="col">Título</th>';
				html += '<th scope="col">Criado Por</th>';
				html += '<th scope="col">Criado Em</th>';
				html += '<th scope="col">Modificado Em</th>';
				html += '<th scope="col"><i id="adicionar-base-conhecimento" class="fas fa-plus-circle"></i></th>';
				html += '</thead></tr>';
				html += '<tbody>';
				// Testa se possui linhas ou não
				// Se existir, carrega, se não existir, sugere a criação
				if (rdto.codigo == 1) {
					html += '<td class="text-center" colspan=6><strong>Ainda não existem Bases de Conhecimento, crie a sua :D</strong></td></tr>';
				} else if (rdto.codigo == 0) {
					for (let i = 0; i < rdto.dados.length; i++) {
						html += '<tr class="linha-tabela text-center" conhecimento="' + rdto.dados[i][0] + '">';
						html += '<th scope="row"><i class="fas fa-graduation-cap"></i> ' + rdto.dados[i][0] + '</th>';
						html += '<td>' + rdto.dados[i][1] + '</td>';
						html += '<td>' + rdto.dados[i][2] + '</td>';
						html += '<td>' + rdto.dados[i][3] + '</td>';
						html += '<td>' + rdto.dados[i][4] + '</td>';
						html += '<td>' + rdto.dados[i][5] + '<i class="fas fa-thumbs-up"></i> ' + rdto.dados[i][6] + '<i class="fas fa-thumbs-down"></i></td></tr>';
					}
				}
				html += '</tbody></table></div></div>';
				// Acopla HTML ao antes do final do documento
				document.getElementById("feed").insertAdjacentHTML('beforeend', html);
				// Insere o estilo da tabela
				insereEstilo(".table {max-width: 90%;font-size: 10pt;margin-top:10px;}");
				insereEstilo(".tabela-pagina > tbody > tr:hover {background-color: #56BACC;cursor: pointer;}");
				insereEstilo(".tabela-pagina > tbody > tr:active {background-color: #103038;color: #D2C9BF;cursor: pointer;}");
				insereEstilo("#adicionar-base-conhecimento {color:rgb(24, 185, 24);font-size:20px}");
				insereEstilo("#adicionar-base-conhecimento:hover {color:rgb(34, 255, 34);cursor: pointer;}");
				insereEstilo("#adicionar-base-conhecimento:active {color:rgb(116, 248, 116);cursor: pointer;}");
				// Cria eventos
				document.getElementById("adicionar-base-conhecimento").addEventListener("click", function() {
					window.open('criar-conhecimento.html?pg=' + id_pagina + '&novo=true', '_blank');
				});
				var linha_tabela = document.getElementsByClassName('linha-tabela');
				for (let i = 0; i < linha_tabela.length; i++) {
					linha_tabela[i].addEventListener('click', function() {
						window.location.href = 'ler-conhecimento.html?conhecimento=' + linha_tabela[i].attributes.conhecimento.value;
					});
				}
			}
		}
	}

	// Função efetuaLogoff destrói sessão
	function efetuaLogoff() {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'php/efetuaLogoff.php');
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					window.location.href = 'index.html?logado=deslogado';
				} else {
					console.log("Erro: " + rdto);
				}
			}
		};
	}

	// Função inserirEstilo para estilizar as páginas carregadas no feed.
	// Insere tag <style> no head com o CSS das páginas.
	function insereEstilo(estilo) {
		var css = document.createElement('style');
		var att = document.createAttribute("origem");
		att.value = "bd";
		css.setAttributeNode(att);
		if (css.styleSheet) {
			css.styleSheet.cssText = estilo;
		} else {
			css.appendChild(document.createTextNode(estilo));
			document.getElementsByTagName("head")[0].appendChild(css);
		}
	}

	// Função inserir script insere a tag <script> com o endereço do arquivo .js que foi criado pelo arquivo carregaPagina.php
	// Por questões de segurança, o js é carregado via arquivo ao invés de tag
	function insereScript(script) {
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.append(script);
		var att = document.createAttribute("origem");
		att.value = "bd";
		js.setAttributeNode(att);
		document.getElementsByTagName("head")[0].appendChild(js);
	}

	// Limpa os estilos e scripts inseridos pelo BD
	function limpaEstiloScript() {
		var elements = document.head.querySelectorAll('[origem=bd]');
		for (let i = 0; i < elements.length; i++) {
			elements[i].remove();
		}
	}

	// Monta o mapa e carreha no topo do feed
	function carregaMapa(mapa) {
		// Cria o mapa
		for (let i = 0; i < mapa.length; i++) {
			if (mapa.length == 1) {
				var html_mapa = '<div pagina="' + mapa[i][0] + '" class="mapa">' + mapa[i][1] + '</div>';
			} else {
				if (i == 0) {
					var html_mapa = '<div pagina="' + mapa[i][0] + '" class="mapa">' + mapa[i][1] + '</div>';
				} else {
					var html_mapa = html_mapa + ' > ' + '<div pagina="' + mapa[i][0] + '" class="mapa">' + mapa[i][1] + '</div>';
				}
			}
		}
		var html_mapa = '<div class="row"><div class="cabecalho-mapa col-12 d-flex align-items-center pl-1">' + html_mapa + '</div></div>';
		// Insere na pagina
		document.getElementById("feed").innerHTML = html_mapa;
		// Cria os elementos de clique para Mapa
		var item = document.getElementsByClassName('mapa');
		for (let i = 0; i < item.length; i++) {
			item[i].addEventListener('click', function() {
				carregaPagina(item[i].attributes.pagina.value, false);
			});
		}
	}

	// Efetua busca
	function busca(query) {
		document.getElementById("pesquisa").value = query;
		limpaEstiloScript();
		document.getElementById("pesquisa").blur();
		loaderFeed(true);
		document.getElementById("feed").innerHTML = '<div class="row"><div class="col-12"><h2 class="mt-2">Busca: "' + query + '"</h2></div></div>';

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/efetuaBusca.php?query=" + query, true);
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr2.status}: ${xhr2.statusText}`); // e.g. 404: Not Found
			} else {

				var rdto = JSON.parse(xhr.response);

				var url = window.location.href;
				url = (url.split('?'))[0] + '?q=' + query;
				var estado = {pesquisa:true, q:query};
				gravaHistorico(estado, url);

				if (rdto.res_pagina.length == 0 && rdto.res_conhecimento == 0) {

					document.getElementById("feed").insertAdjacentHTML("beforeend", '<div class="row mt-2"><div class="col-12"><h3>Nenhum resultado encontrado...</h3></div></div>');

				} else {

					// Resultado das páginas

					document.getElementById("feed").insertAdjacentHTML("beforeend", '<div class="row mt-2"><div class="col-12"><h4>Página ('+rdto.res_pagina.length+')</h4></div></div>');

					if (rdto.res_pagina.length == 0) {
						document.getElementById("feed").insertAdjacentHTML("beforeend", '<div class="row"><div class="col-12"><h3>Nenhuma página encontrada...</h3></div></div>');
					} else {
						for (let i = 0; i < rdto.res_pagina.length; i++) {
							var html = '<div class="row mt-2"><div tipo="pagina" pagina="'+rdto.res_pagina[i][1]+'" class="col-10 mx-auto item-pesquisa">';
							html += '<div class="row"><div class="col-6"><strong>Página: '+rdto.res_pagina[i][3]+'</strong></div><div class="col-6"><strong>Produto: '+rdto.res_pagina[i][2]+'</strong></div></div>';
							html += '<div class="row"><div class="col-12"><strong>Resumo:</strong> '+rdto.res_pagina[i][4]+'...</div></div>';
							html += '<hr></div></div>';
							document.getElementById('feed').insertAdjacentHTML('beforeend', html);
						}
					}

					// Resultado dos conhecimentos

					document.getElementById("feed").insertAdjacentHTML("beforeend", '<div class="row mt-2"><div class="col-12"><h4>Conhecimento ('+rdto.res_conhecimento.length+')</h4></div></div>');

					if (rdto.res_conhecimento.length == 0) {
						document.getElementById("feed").insertAdjacentHTML("beforeend", '<div class="row"><div class="col-12"><h3>Nenhum conhecimento encontrado...</h3></div></div>');
					} else {
						for (let i = 0; i < rdto.res_conhecimento.length; i++) {
							var html = '<div class="row mt-2"><div tipo="conhecimento" conhecimento="'+rdto.res_conhecimento[i][1]+'" class="col-10 mx-auto item-pesquisa">';
							html += '<div class="row"><div class="col-6"><strong>Página: '+rdto.res_conhecimento[i][3]+'</strong></div><div class="col-6"><strong>Produto: '+rdto.res_conhecimento[i][2]+'</strong></div></div>';
							html += '<div class="row"><div class="col-12">Resumo: '+rdto.res_conhecimento[i][4]+'...</div></div>';
							html += '<hr></div></div>';
							document.getElementById('feed').insertAdjacentHTML('beforeend', html);
						}
					}

					// Eventos páginas

					var paginas = document.getElementById("feed").querySelectorAll('[tipo="pagina"]');
					for (let i = 0; i < paginas.length; i++) {
						paginas[i].addEventListener('click', function() {
							carregaPagina(paginas[i].attributes.pagina.value, false);
						});
					}

					// Eventos conhecimentos

					var conhecimentos = document.getElementById("feed").querySelectorAll('[tipo="conhecimento"]');
					for (let i = 0; i < conhecimentos.length; i++) {
						conhecimentos[i].addEventListener('click', function() {
							window.location.href = 'conhecimento_ler.html?conhecimento=' + conhecimentos[i].attributes.conhecimento.value;
						});
					}

				}

				insereEstilo(".item-pesquisa:hover {background-color: #D9D9D9; cursor: pointer}");

				loaderFeed(false);

			}
		}
	}

	// Liga ou desliga o loader
	function loaderFeed(status) {
		if (status == true) {
			document.getElementById("row-divisor").style.display = "none";
			document.getElementById("row-loader").style.display = "block";
		} else if (status == false) {
			document.getElementById("row-loader").style.display = "none";
			document.getElementById("row-divisor").style.display = "block";
		}
	}

	// Grava no histórico
	function gravaHistorico(obj_estado, url) {
		history.pushState(obj_estado, 'HelpMe', url);
	}

	function abreModalTextoPadrao() {

		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/carregaTextoPadrao.php", true);
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr2.status}: ${xhr2.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);

				console.log(rdto);

				var html = '<div id="conteudo-texto-padrao" class="row mt-3"><div class="col-12">';

				for (let i = 0; i < rdto.tp.length; i++) {
					html += '<div class="row mb-3"><div class="col-12">';
					html += '<div class="row"><div class="col-12 titulo-texto-padrao py-2" onClick="if ((getComputedStyle(document.getElementById(\'texto-'+i+'\'))).getPropertyValue(\'display\') == \'none\') {document.getElementById(\'texto-'+i+'\').style.display=\'block\'} else {document.getElementById(\'texto-'+i+'\').style.display=\'none\'};">'+ rdto.tp[i][0] +'</div></div>';
					html += '<div class="row mt-2"><div id="texto-'+i+'" onClick="copiaTexto(this.textContent)" class="col-10 mx-auto py-2 texto-padrao" style="white-space: pre-line; display:none">'+ rdto.tp[i][1] +'\n\nAtenciosamente,\n'+rdto.nome_usuario+'</div></div>';
					html += '</div></div>';
				}

				html += '</div></div>';

				console.log(html);

				document.getElementById("container-texto-padrao").insertAdjacentHTML("beforeend",html);

			}
		}

		document.getElementById("modal-texto-padrao").style.display = "block";

	}

	fechaModalTextoPadrao = function () {
		document.getElementById("modal-texto-padrao").style.display = "none"
		document.getElementById("conteudo-texto-padrao").innerHTML = '';
		document.getElementById("conteudo-texto-padrao").remove();
		document.removeEventListener("click", cmtp);
	}

	copiaTexto = function (texto) {
		try {
			const el = document.createElement('textarea');
			el.value = texto;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			mostraMensagem('boa', 'Texto copiado.');
		} catch (e) {
			console.log(e);
		}
	}

	function mostraMensagem (tipo, texto) {

		var html = '<div id="modal-mensagem" class="modal-body" style="height: 50px; width: 200x; background-color: #45BF55; position: absolute; top: 85%; right: 2%; z-index:10; border-radius: 10px;">';
		html += '<div class="container-fluid">';
		html += '<div class="row"><div class="col-12 p-0"><i class="fas fa-clipboard-check"></i><span style="font-weight: bold">'+texto+'</span></div></div>';
		html += '</div></div>';

		

		if (document.getElementById("modal-mensagem")) {
			console.log('Ainda existe a mensagem');
		} else {
			setTimeout(() => {
				document.body.insertAdjacentHTML("beforeend", html);
			}, 30);
			setTimeout(() => {
				fadeOut(document.getElementById("modal-mensagem"), 2);;
			}, 2000);
		}
		return false;
	}

	function fadeIn(element, time) {
		processa(element, time, 0, 100);
	}

	function fadeOut(element, time) {
		processa(element, time, 100, 0);
	}

	function processa(element, time, initial, end) {
		if (initial == 0) {
			increment = 2;
			/*element.style.display = "block";*/
		} else {
			increment = -2;
		}
		opc = initial;
		intervalo = setInterval(function() {
			if ((opc == end)) {
				if (end == 0) {
					element.style.display = "none";
					var d1 = document.getElementById("modal-mensagem");
					d1.remove();
				}
				clearInterval(intervalo);
			} else {
				opc += increment;
				element.style.opacity = opc / 100;
				element.style.filter = "alpha(opacity=" + opc + ")";
			}
		}, time * 10);
	}

	criaCookie = function(name, value, days) {
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

	pegaCookie = function(c_name) {
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

	function checaUrgencia (id_equipe) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "php/checaUrgencia.php?equipe=" + id_equipe, true);
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) {
				alert(`Error ${xhr.status}: ${xhr.statusText}`);
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					document.getElementById("urgencia").innerHTML = '<i id="exclamacao-urgencia" class="fas fa-exclamation-circle" onClick="var estado = (getComputedStyle(document.getElementById(\'modal-urgencia\'))).getPropertyValue(\'display\');if (estado == \'none\') {document.getElementById(\'modal-urgencia\').style.display=\'block\'} else if (estado == \'block\') {document.getElementById(\'modal-urgencia\').style.display=\'none\'}"></i>';

					var html = '';

					for (let i = 0; i < rdto.dados.length; i++) {
						html += '<div class="row"><div class="col-12">';
						html += '<div class="row"><div class="col-12 titulo-urgencia py-2"><strong>'+rdto.dados[i][2]+ ' - ' +rdto.dados[i][0]+' | De '+rdto.dados[i][3]+' até '+rdto.dados[i][4]+'.</strong></div></div>';
						html += '<div class="row mt-2"><div class="col-10 mx-auto py-2" style="white-space: pre-line">'+ rdto.dados[i][1]+'</div></div>';
						html += '</div></div><hr>';
					}
	
					document.getElementById("conteudo-urgencia").innerHTML = html;

				} else if (rdto.codigo == 3) {
					document.getElementById("urgencia").innerHTML = '';
				} else {
					console.log(rdto);
				}
			}
		}
	}

	// ################################ Eventos ################################

	// Evento acionado por botões <- ou -> do navegador. A página é carregada quando Voltar ou Avançar no histórico.
	window.onpopstate = function(event) {
		if (event.state.pesquisa == true) {
			busca(event.state.q);
		} else {
			carregaPagina(event.state.pagina, true);
		}
	};

	// Evento de clique para Logoff
	// Pede confirmação através do método confirm()
	document.getElementById("logoff").addEventListener("click", function() {
		var r = window.confirm("Você deseja mesmo sair?"); /* Pede confirmação de logoff */
		if (r === true) {
			efetuaLogoff();
		}
	});

	// Eventos do campo de pesquisa
	document.getElementById("pesquisa").addEventListener("focus", function() {

		window.addEventListener("keyup", p = function(e) {
			if (e.key == "Enter") {
				if (document.getElementById("pesquisa").value.replace(/\s/g, '').length) {
					window.removeEventListener("keyup", p);
					document.getElementById("pesquisa").removeEventListener("blur", b);
					busca(document.getElementById("pesquisa").value);
				}
			}
		})

		document.getElementById("pesquisa").addEventListener("blur", b = function() {
			window.removeEventListener("keyup", p);
			document.getElementById("pesquisa").removeEventListener("blur", b);
		})
		
	})

	// Eventos Texto Padrão

	document.getElementById("texto-padrao").addEventListener("click", function() {

		var estado = (getComputedStyle(document.getElementById("modal-texto-padrao"))).getPropertyValue('display');

		if (estado == 'none') {
			abreModalTextoPadrao();
		} else if (estado == 'block') {
			fechaModalTextoPadrao();
		}

	})

	// Eventos Urgência

	// ################################ Procedural ################################

	// Ao iniciar o documento, verificamos primeiramente se o usuário está logado
	// Se estiver logado, permanece na página. Se não estiver, é encaminhado ao login
	verificaSessao();


	// Carrega o menu da equipe
	carregaMenuEquipe();

	// Após, capturamos os dados na url para requisitarmos ao Banco de Dados o HTML que vamos carregar
	try {
		var url = window.location.href;
		var res = url.split('?');
		var parametro = res[1].split('=');
		
		// Testa se é pesquisa ou carregamento normal

		if (parametro[0] == 'q') {
			busca(decodeURI(parametro[1]));
		} else {
			carregaPagina(parametro[1], false); // Solicitamos o carregamento da página
		}

	} catch (e) {
		console.log("Algum erro ocorreu ao tentar capturar o parâmetro da URL.");
		console.log(e);
		window.location.href = 'hall.html?pg=1';
	}

	// Inicia processo de checagem de urgência
	checaUrgencia(pegaCookie('equipe')) // Início imediato
	setInterval(function(){
		checaUrgencia(pegaCookie('equipe'))}, 
	5000);

});
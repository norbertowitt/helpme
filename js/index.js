document.addEventListener("DOMContentLoaded", function(event) {

	console.log("DOM carregado");

	/* Função verificaSessao requisita ao arquivo verificaSessao.php se o usuário está logado */
	/* A resposta é baseada em um JSON de retorno */
	/* Se está logado vai para o Hall e diz qual a página atual através do valor do Cookie HELPME_ONDE_ESTOU */
	/* Se não estiver logado, direciona para a página de login com a mensagem adequada à situação.
	A mensagem pode ser "Você não está logado" ou "Você foi deslogado" (quando o direcionamento foi feito por um logoff)*/

	function verificaSessao() {
		console.log('Verificando sessão...');
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "php/verificaSessao.php");
		xhr.send();
		xhr.onload = function() {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
			} else {
				var rdto = JSON.parse(xhr.response);
				if (rdto.codigo == 0) {
					window.location.href = "hall.html?pg=" + rdto.pagina;
				} else {
					try {
						var url = window.location.href;
						if (url.indexOf('?') != -1) {
							res = url.split('?');
							if (res === undefined) {
								console.log("Efetue seu login :)");
							} else {
								var parametro = res[1].split('=');
								if (parametro[1] == 'false') {
									mostraMensagem("ruim", "Você não está logado!");
									console.log("Usuário não logado!");
								} else if (parametro[1] == 'deslogado') {
									mostraMensagem("boa", "Você foi deslogado com sucesso!");
									console.log("Usuário deslogado");
								}
							}
						} else {
							console.log("URL não possui parâmetros.");
							console.log("Usuário não logado");
						}
					} catch (e) {
						console.log(e);
						console.log("A URL não possui parâmetros.");
					}
				}
			}
		};
	}

	/* Função efetuaLogin efetua o login enviado os dados ao arquivo efetuaLogin.php */
	/* Os dados são capturados dos campos usuario e senha */
	/* Se o usuário existir na base de dados, uma sessão PHP será criada e um retorno positivo será respondido */
	/* Se qualquer erro ocorrer, uma mensagem de erro será retornada e apresentada ao usuário através da função mostraMensagem */

	function efetuaLogin() {
		var rtn = validaCampos();
		if (rtn.codigo == 0) {
			console.log("Campos preenchidos, efetuando login.")
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "php/efetuaLogin.php");
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify({
				usuario: document.getElementById("usuario").value,
				senha: document.getElementById("senha").value
			}));
			xhr.onload = function() {
				if (xhr.status != 200) { // analyze HTTP status of the response
					alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
				} else { // show the result
					rdto = JSON.parse(xhr.response);
					if (rdto.codigo != 0) {
						console.log("Erro ao efetuar login.");
						mostraMensagem("ruim", rdto.mensagem);
					} else if (rdto.codigo == 0) {
						criaCookie("equipe", rdto.equipe);
						console.log("Login efetuado.")
						mostraMensagem("boa", rdto.mensagem);
						window.location.href = "hall.html?pg=1";
					}
				}
			}
		} else {
			console.log("Campos vazios.")
			mostraMensagem("ruim", rtn.mensagem);
		}
	}

	/* Função validaCampos valida os campos se estão preenchidos e retorna uma mensagem positiva ou negativa */

	function validaCampos() {
		if (document.getElementById("usuario").value && document.getElementById("senha").value) {
			var dto = '{"codigo":0, "mensagem":"Campos preenchidos."}';
		} else {
			var dto = '{"codigo":1, "mensagem":"Algo está vazio!"}';
		}
		return JSON.parse(dto);
	}

	/* Função mostraMensagem mostra uma mensagem na tela de login. */
	/* Se o primeiro argumento for "boa", a mensagem será verde. Se for "ruim", a mensagem será laranja */ 

	function mostraMensagem(tipo, msg) {
		if (document.getElementById("row-mensagem")) {
			console.log('Ainda existe a mensagem');
			return false;
		} else {
			var cabecalho = document.getElementById('row-cabecalho');
			cabecalho.insertAdjacentHTML('afterend', '<div id="row-mensagem" class="row justify-content-center"></div>');
			var mensagem = document.getElementById('row-mensagem');
			fadeIn(mensagem, 2);
			setTimeout(() => {
				mensagem.insertAdjacentHTML('afterbegin', '<div id="mensagem-' + tipo + '" class="col-4 d-flex justify-content-center">' + msg + '</div>');
			}, 30);
			setTimeout(() => {
				fadeOut(mensagem, 2);;
			}, 2000);
		}
		return false;
	}

	/* Funções para efeito Fade In e Fade Out da caixa de mensagem */

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
					var d1 = document.getElementById("row-mensagem");
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

	/* Função para criar facilmente um Cookie e sua duração */

	function criaCookie(name, value, days) {
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

	function pegaCookie(c_name) {
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

	// ######################### Eventos #########################

	// Cria evento Click ou Enter para efetuar o login

	document.getElementById("botao-login").addEventListener("click", function() {
		efetuaLogin(); /* Chama a função efetuaLogin quando o botão for clicado*/
	});

	document.getElementById("usuario").addEventListener("keyup", function(e) {
		if (e.key == "Enter") {
			efetuaLogin();
		}
	});

	document.getElementById("senha").addEventListener("keyup", function(e) {
		if (e.key == "Enter") {
			efetuaLogin();
		}
	});

	// ######################### Procedural #########################
	
	// Quando for carregado o arquivo, será verificada se a sessão existe ou não
    
	verificaSessao();
	

    

});
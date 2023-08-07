sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
      onInit: function () {
        this.vez = "X";
        this.vitorias_possiveis = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [1, 4, 7],
          [2, 5, 8],
          [3, 6, 9],
          [1, 5, 9],
          [3, 5, 7],
        ];
      },

      onClickCasa: function (oEvent) {
        //Obter referencia do objeto que foi criado
        let casa = oEvent.getSource();

        //Obter imagem atual
        let imagem = casa.getSrc();

        //Verifica se imagem é branco
        if (imagem == "../img/Branco.png") {
          // Comando para adicionar a imagem
          casa.setSrc("../img/" + this.vez + ".png");

          //Logica para verificar ganhador do jogo
          if (this.temVencedor() == true) {
            MessageBox.success(this.vez + " Ganhou");
          }
          // Trocar a vez do jogador
          if (this.vez == "X") {
            this.vez = "O";
            //Chamar função computador
            this.jogadaComputador();
          } else {
            this.vez = "X";
          }
        }

        // Verifica se o jogo acabou
      },

      temVencedor: function () {
        if (
          this.casasIguais(1, 2, 3) ||
          this.casasIguais(4, 5, 6) ||
          this.casasIguais(7, 8, 9) ||
          this.casasIguais(1, 4, 7) ||
          this.casasIguais(2, 5, 8) ||
          this.casasIguais(3, 6, 9) ||
          this.casasIguais(1, 5, 9) ||
          this.casasIguais(3, 5, 7)
        ) {
          return true;
        }
      },

      casasIguais: function (p1, p2, p3) {
        let casaP1 = this.byId("casa" + p1);
        let casaP2 = this.byId("casa" + p2);
        let casaP3 = this.byId("casa" + p3);

        // Obtenho a imagem de cada casa
        let imgP1 = casaP1.getSrc();
        let imgP2 = casaP2.getSrc();
        let imgP3 = casaP3.getSrc();

        if (imgP1 == imgP2 && imgP2 == imgP3 && imgP1 !== "../img/Branco.png") {
          return true;
        }
      },

      jogadaComputador: function () {
        // definir parametros iniciais ( pontuação)
        // lista pontos x
        let listaPontosX = [];
        let listaPontosO = [];

        //lista de jogadas possiveis
        let jogadaInicial = [];
        let jogadaVitoria = [];
        let jogadaRisco = [];
        let tentativa_vitoria = [];

        //Calculo da pontuação possibilidade de vitório
        this.vitorias_possiveis.forEach((combinacao) => {
          //zera pontos iniciais
          let pontosX = 0;
          let pontosO = 0;
          //debugger
          //dentro das vitorias possiveis fazer um loop para verificar cada casa daquela combinação
          combinacao.forEach((posicao) => {
            let casa = this.byId("casa" + posicao);
            let img = casa.getSrc();
            // dar pontuação de acordo com quem jogou
            if (img == "../img/X.png") pontosX++;
            if (img == "../img/O.png") pontosO++;
          });

          listaPontosO.push(pontosO);
          listaPontosX.push(pontosX);
        });

        //jogar com base na pontuação maior
        //para cada possibilidade de vitoria do jogador O, ver quantos pontos X tem na mesma combinação
        //loop na lista de pontos O
        listaPontosO.forEach((posicao, index) => {
          //ver quantos pontos o jogador O tem
          switch (posicao) {
            case 0: // menor pontuação
              if (listaPontosX[index] == 2) {
                jogadaRisco.push(this.vitorias_possiveis[index]);
              } else if (listaPontosX[index] == 1) {
                jogadaInicial.push(this.vitorias_possiveis[index]);
              }
              break;
            case 1: // jogada neutra
              if (listaPontosX[index] == 1) {
                jogadaInicial.push(this.vitorias_possiveis[index]);
              } else if (listaPontosX[index] == 0) {
                tentativa_vitoria.push(this.vitorias_possiveis[index]);
              }
              break;
            case 2: // jogada vitoria
              if (listaPontosX[index] == 0) {
                jogadaVitoria.push(this.vitorias_possiveis[index]);
              }
              break;
          }
        });

        if (jogadaVitoria.length > 0) {
          //jogar nas combinacoes de vitoria
          this.jogadaIA(jogadaVitoria);
        } else if (jogadaRisco.length > 0) {
          //jogar aonde pode perder
          this.jogadaIA(jogadaRisco);
        } else if (tentativa_vitoria > 0) {
          //jogar aonde pode ganhar
          this.jogadaIA(tentativa_vitoria);
        } else if (jogadaInicial.length > 0) {
          //jogada neutra
          this.jogadaIA(jogadaInicial);
        }
      },

      jogadaIA: function (dados) {
        //separar numeros das casas que posso jogar
        let numeros = [];

        dados.forEach((combinacao) => {
          // verificar casa individualmente
          combinacao.forEach((num) => {
            let casa = this.byId("casa" + num);
            let img = casa.getSrc();
            if (img == "../img/Branco.png") {
              numeros.push(num);
            }
          });
        });

        // jogada aleatoria nos valores possiveis
        this.jogadaAleatoriaIA(numeros);
      },

      jogadaAleatoriaIA: function (numeros) {
        // gera numero aleatorio entre 0 e 1
        let numeroAleatorio = Math.random() * numeros.length;
        let numeroInteiro = Math.floor(numeroAleatorio);
        let jogada = numeros[numeroInteiro];
        // Joga na casa selecionada
        let casa = this.byId("casa" + jogada);
        casa.setSrc("../img/O.png");
        // Verificar vencedor
        // if (this.temVencedor() == true) {
        //  MessageBox.success(this.vez + " Ganhou");
        // } else {
        this.vez = "X";
        //  }
      },
    });
  }
);

sap.ui.define(
  [
    './BaseController',
    'sap/ui/model/json/JSONModel',
    '../model/formatter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
  ],
  function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    'use strict'

    return BaseController.extend(
      'carmo5495p.solicitacaoaprovacao.controller.Worklist',
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
          var oViewModel

          // keeps the search state
          this._aTableSearchState = []

          // Model used to manipulate control states
          oViewModel = new JSONModel({
            worklistTableTitle:
              this.getResourceBundle().getText('worklistTableTitle'),
            shareSendEmailSubject: this.getResourceBundle().getText(
              'shareSendEmailWorklistSubject'
            ),
            shareSendEmailMessage: this.getResourceBundle().getText(
              'shareSendEmailWorklistMessage',
              [location.href]
            ),
            tableNoDataText: this.getResourceBundle().getText('tableNoDataText')
          })
          this.setModel(oViewModel, 'worklistView')
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
          // update the worklist's object counter after the table update
          var sTitle,
            oTable = oEvent.getSource(),
            iTotalItems = oEvent.getParameter('total')
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding('items').isLengthFinal()) {
            sTitle = this.getResourceBundle().getText(
              'worklistTableTitleCount',
              [iTotalItems]
            )
          } else {
            sTitle = this.getResourceBundle().getText('worklistTableTitle')
          }
          this.getModel('worklistView').setProperty(
            '/worklistTableTitle',
            sTitle
          )

          this.buscaPreco()
        },

        buscaPreco: function () {
          let oTable = this.byId('id.Table')
          let aItems = oTable.getItems()
          //loop nos items // Função assincrona
          if (aItems.length > 0) {
            aItems.forEach(
              async function (aEntry, i, array) {
                let bc = aEntry.getBindingContext()
                let obj = bc.getObject() // pega dos dados da tabela
                let path = bc.getPath() // pega o caminho do serviço atual com parametros
                let model = this.getView().getModel()
                let material = model.getProperty(path + '/tomaterial') // pega o objeto da associação especifica.

                try {
                  let request = await this.ajaxRequest(material.Productid) // fazer a chamada da API externa
                  let dados = request[0].d
                  let preco = dados.UnitPrice //Recupera o preco da API
                  model.setProperty(path + '/PrecoNovo', preco)
                  debugger
                } catch {}
              }.bind(this) // Para funcionar nesse contexto.
            )
          }
        },

        ajaxRequest: function (idExterno) {
          idExterno = idExterno * 1 // tirar os zeros a esquerda.
          return new Promise((resolve, reject) => {
            $.ajax({
              url:
                'https://cors-anywhere.herokuapp.com/https://services.odata.org/V2/Northwind/Northwind.svc/Products(' +
                idExterno +
                ')',
              method: 'GET',
              dataType: 'json',
              crossDomain: true,
              success: (...args) => resolve(args),
              error: (...args) => reject(args)
            })
          })
        },

        onRejeitar: function () {
        debugger
          let oTable = this.byId('id.Table') // Instancia a tabela
          let aContexts = oTable.getSelectedContexts() // Pega todos as linhas selecionadas.
          let model = this.getView().getModel() // Instacia a model

          for (let index = 0; index < aContexts.length; index++) {
            let path = aContexts[index].getPath();
            path = path + '/Status'; // Pega o caminho do campo status
            model.setProperty(path, 'R'); // coloca o valor no campo Status
          }

          model.submitChanges(); //Commita os valores no backend.

        },

        onAprovar: function () {
          debugger
            let oTable = this.byId('id.Table') // Instancia a tabela
            let aContexts = oTable.getSelectedContexts() // Pega todos as linhas selecionadas.
            let model = this.getView().getModel() // Instacia a model
  
            for (let index = 0; index < aContexts.length; index++) {
              let path = aContexts[index].getPath();
              path = path + '/Status'; // Pega o caminho do campo status
              model.setProperty(path, 'A'); // coloca o valor no campo Status
            }
  
            model.submitChanges(); //Commita os valores no backend.
  
          },
        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource())
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          // eslint-disable-next-line fiori-custom/sap-no-history-manipulation, fiori-custom/sap-browser-api-warning
          history.go(-1)
        },

        onSearch: function (oEvent) {
          if (oEvent.getParameters().refreshButtonPressed) {
            // Search field's 'refresh' button has been pressed.
            // This is visible if you select any main list item.
            // In this case no new search is triggered, we only
            // refresh the list binding.
            this.onRefresh()
          } else {
            var aTableSearchState = []
            var sQuery = oEvent.getParameter('query')

            if (sQuery && sQuery.length > 0) {
              aTableSearchState = [
                new Filter('Material', FilterOperator.Contains, sQuery)
              ]
            }
            this._applySearch(aTableSearchState)
          }
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
          var oTable = this.byId('table')
          oTable.getBinding('items').refresh()
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
          this.getRouter().navTo('object', {
            objectId: oItem
              .getBindingContext()
              .getPath()
              .substring('/SolicitacaoSet'.length)
          })
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
          var oTable = this.byId('table'),
            oViewModel = this.getModel('worklistView')
          oTable.getBinding('items').filter(aTableSearchState, 'Application')
          // changes the noDataText of the list in case there are no filter results
          if (aTableSearchState.length !== 0) {
            oViewModel.setProperty(
              '/tableNoDataText',
              this.getResourceBundle().getText('worklistNoDataWithSearchText')
            )
          }
        }
      }
    )
  }
)

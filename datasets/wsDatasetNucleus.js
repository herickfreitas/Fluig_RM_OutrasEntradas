function createDataset(fields, constraints, sortFields) {
	
	try
	{
		
	var filtros = fields[0] + ";"+ fields[1]+ ";"+  fields[2];
	log.info("wsProjetos-> Fields: " + filtros);
	
	// Criar o objeto de Integração
	const SERVICE_STUB = ServiceManager.getService('RMWsDataServer');
    log.info("wsProjetos-> SERVICE_STUB: " + SERVICE_STUB);
    const SERVICE_HELPER = SERVICE_STUB.getBean();

    log.info("wsProjetos-> SERVICE_HELPER: " + SERVICE_HELPER);
    
    // Criar o obejto da classe principal do Servico
    const wsDataServer = SERVICE_HELPER.instantiate('com.totvs.WsDataServer');
    log.info("wsProjetos-> wsDataServer: " + wsDataServer);
    // Obter o objeto do WS
    var iWsDataServer = wsDataServer.getRMIwsDataServer();
    log.info("wsProjetos-> iWsDataServer: " + iWsDataServer);
    // Configurar a autenticação
    var rm_user = 'integracao';
    var rm_pass = '!2018@Minha!';
     
    var authIwsDataServer = SERVICE_STUB.getBasicAuthenticatedClient(iWsDataServer, 'com.totvs.IwsDataServer', rm_user, rm_pass);
    log.info("wsProjetos-> authIwsDataServer: " + authIwsDataServer);
    // Passar os parametros
    var dataServerName = "MovMovimentoFluigData/"+ fields[2];
    var filtro = fields[0] + ";"+ fields[1]+ ";"+  fields[2];
    var contexto = "CODSISTEMA=T;CODUSUARIO=integracao;CODCOLIGADA="+ fields[0];
    
    // Executar
    var readView = authIwsDataServer.readRecord(dataServerName, filtro, contexto);
    log.info("wsProjetos-> readViewResult: " + readView);
    if ((readView != null) && (readView.indexOf("===") != -1)) {
        var msgErro = readView.substring(0, readView.indexOf("==="));                
        throw msgErro;
     }
    
    var xmlNewDataSet = new XML(readView);
    log.info("wsProjetos-> WS: " + xmlNewDataSet);
    log.info("wsProjetos-> readView: " + readView);
    
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn('XML');
        
    var Movimento = "<Mov> "+ xmlNewDataSet + "</Mov> ";
    log.info("wsProjetos -> MovMovimento: "+Movimento);
    
	var registro = new Array();
	registro.push(Movimento);
	
	dataset.addRow( registro );
    
    return dataset;
    
    } catch(e) {
          return getDatasetError(e);
    };          
}

function getDatasetError(exception) {
    var dtsError = new DatasetBuilder.newDataset();
    dtsError.addColumn("ERROR");
    dtsError.addRow([ "Ocorreu um erro na execucao do DataSet. Mensagem: "
                 + exception.message + '(#' + exception.lineNumber + ')' ]);
    return dtsError;

};
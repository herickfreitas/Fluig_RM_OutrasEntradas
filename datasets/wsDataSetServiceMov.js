function createDataset(fields, constraints, sortFields) {
	try
	{
	// Criar o objeto de Integra??o
	const SERVICE_STUB = ServiceManager.getService('RMWsDataServer');
    log.info("wsProjetos-> SERVICE_STUB: " + SERVICE_STUB);
    const SERVICE_HELPER = SERVICE_STUB.getBean();

    // Criar o obejto da classe principal do Servico
    const wsDataServer = SERVICE_HELPER.instantiate('com.totvs.WsDataServer');
    log.info("wsProjetos-> wsDataServer: " + wsDataServer);
    // Obter o objeto do WS
    var iWsDataServer = wsDataServer.getRMIwsDataServer();
    log.info("wsProjetos-> iWsDataServer: " + iWsDataServer);
    // Configurar a autentica??o
    var rm_user = 'integracao';
    var rm_pass = '!2018@Minha!';
    
    var authIwsDataServer = SERVICE_STUB.getBasicAuthenticatedClient(iWsDataServer, 'com.totvs.IwsDataServer', rm_user, rm_pass);
    log.info("wsProjetos-> authIwsDataServer: " + authIwsDataServer);

    // Passar os parametros - ATENÇÃO Usuário MESTRE deverá ter acesso ao movimento relacionado
    var contexto = "CODSISTEMA=T;CODUSUARIO=integracao;CODCOLIGADA="+ fields[0];
           
	// Enviar dados pelo dataset
	var fieldsXml = "<MovMovimento>";		
	fieldsXml += "<TMOV> ";
	fieldsXml += ValidaCampo("CODCOLIGADA",  fields[0]);
	fieldsXml += ValidaCampo("IDMOV",  fields[1]);
	fieldsXml += ValidaCampo("SERVICO",  fields[2]);
	fieldsXml += ValidaCampo("IDFLUIG",  fields[4]);
	fieldsXml += "</TMOV> ";
	fieldsXml += "</MovMovimento> ";
			  
	log.info("DataSet enviado para o TBC: " + fieldsXml);
	log.info("DataSet enviado Fluig: " + fields[4]);
	
	
	var result = authIwsDataServer.saveRecordEmail("MovMovimentoFluigData", fieldsXml, contexto, fields[3]);
	
	log.info("Resultado do Servico: " + result);
	
	//O TBC retorna os valores da chave caso o registro tenha sido salvo,
	//caso contr?rio, a exce??o ocorrida ? enviada pelo mesmo retorno, por?m
	//formatada entre linhas '==='
	if ((result != null) && (result.indexOf("===") != -1))
	{
		log.info("Erro no serviço." );	
		var msgErro = result.substring(0, result.indexOf("==="));
		log.info(msgErro);
		throw msgErro;
	}
	
	var dataset = DatasetBuilder.newDataset();
	
	dataset.addColumn("RESULT");
	dataset.addRow(new Array(result));
	
	log.info("RESULT: " + result);		 		

	return dataset;
	
    } catch(e) {
          return getDatasetError(e);
    };   
}

function getDatasetError(exception) {
    var dtsError = DatasetBuilder.newDataset();
    dtsError.addColumn("ERROR");
    dtsError.addRow([ "Ocorreu um erro na execucao do DataSet. Mensagem: " + exception ]);
    return dtsError;

};

function ValidaCampo(campo, valor)
{
	if ((valor != null) && (valor != ""))
	{
		return "<"+campo+">"+valor+"</"+ campo + "> ";
	}
	else
		return "";
};
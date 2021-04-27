var SeqAtualizaWf = 116;
var SeqCancelaMov = 134;
var SeqFaturaMov = 22;
var SeqConcluiMov = 24;

function beforeStateEntry(sequenceId){

	log.info("beforeStateEntry "+sequenceId);
	
	//Define Respons?vel
    if (sequenceId == SeqAtualizaWf) {
    	atualizaEtapaWorkflow();
    }  
    else
	// De acordo com os estados finais ? passada a a??o a ser realizada no Movimento
    if (sequenceId == SeqCancelaMov)
    	AtualizaMovimento("Cancela");
	else if (sequenceId == SeqConcluiMov)
		AtualizaMovimento("Conclui");
	else if (sequenceId == SeqFaturaMov)
		AtualizaMovimento("Fatura");   
}

function AtualizaMovimento(acaoMovimento){
	try 
	{		
		log.info("AtualizaMovimento: "+acaoMovimento);
		
		var codColigada = hAPI.getCardValue("CodColigada"); 
		var idMov = hAPI.getCardValue("IdMov");
		var idFluig = getValue('WKNumProces');
		
		var cCompany = DatasetFactory.createConstraint("companyId", getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);	
		log.info("cCompany: "+getValue("WKCompany"));
		var cUser = DatasetFactory.createConstraint("colleagueId", getValue("WKUser"), getValue("WKUser"), ConstraintType.MUST);	
		log.info("cUser: "+getValue("WKUser"));
		var constraintsEmail = new Array(cCompany, cUser);
		var colleague = DatasetFactory.getDataset("colleague", null, constraintsEmail, null);
		
		var Email = colleague.getValue(0, "mail");
		
		// Passa as chaves do Movimento e o servi?o que dever? ser chamado.
		var fields = new Array(codColigada, idMov, acaoMovimento , Email, idFluig);
		
		log.info("Passou: "+acaoMovimento);
		
		var dsServiceMov = DatasetFactory.getDataset("wsDataSetServiceMov", fields, null, null);	
		
		if(dsServiceMov.getColumnsName()[0] == "ERROR"){
			throw dsServiceMov.getValue(0, "ERROR");
		}
			
		log.info("Retorno Dataset: AtualizaMovimento: "+ dsServiceMov);
	}
	catch (e)
	{
		log.error(e);
		throw e;
	}	
}

function atualizaEtapaWorkflow(){
	try {
		
		log.info("==========[ atualizaEtapaWorkflow ENTROU ]==========");
		
		var processo = getValue("WKNumProces");     //Recupera o numero da solicitação
		var requisitante = getValue("WKUser");		//Recupera o usuário corrente associado a atividade
		
		// Gravando valores no formulário
		hAPI.setCardValue("n_solicitacao", processo);
	    hAPI.setCardValue("solicitante", requisitante);
	    
	    // Coletando variáveis para consulta de dataSet
	    var id_mov = hAPI.getCardValue("IdMov");
	    var codcoligada = 1;
	    
	    // Array com varáveis coletadas
	    var fields = new Array(codcoligada, id_mov, processo);
	    //log.info("==========[ atualizaEtapaWorkflow fields ]=========="+fields);
	    
	    // Chamada do dataset
	    var dsNucleus = DatasetFactory.getDataset('wsDatasetNucleus', fields, null, null);
	    //log.info("==========[ atualizaEtapaWorkflow dsNucleus ]=========="+dsNucleus);
	    
	    // Coletando XML do retorno
	    var retorno = dsNucleus.getValue(0, "XML");
		//log.info("==========[ atualizaEtapaWorkflow retorno ]========== " + retorno);
        
		// Ajustando retorno XML para retirada de elemento
        var factory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
        var parser = factory.newDocumentBuilder();
        var source = new org.xml.sax.InputSource(new java.io.StringReader(retorno));
        var xmlResponse = parser.parse(source);
        
        // 1º Retirando o elemento 2º Retirando o conteúdo
        var nodes = xmlResponse.getElementsByTagName("CODCCUSTO");
        var ccusto = nodes.item(0).getTextContent();
        //log.info("==========[ atualizaEtapaWorkflow nodes CODCCUSTO ]========== " + nodes.item(0).getTextContent());
 
        // Rodando novo dataset para coletar responsável do centro de custo
        var c1 = DatasetFactory.createConstraint("CODCCUSTO", ccusto, ccusto, ConstraintType.MUST);
        var constraints = new Array(c1);
        log.info("==========[ atualizaEtapaWorkflow constraints ]========== " + constraints);
        
        // Executando chamada de dataset
        var datasetReturned = DatasetFactory.getDataset("_RM_GESTOR_CENTRO_CUSTO", null, constraints, null);
        
		// Retirando o campo do resultado
		var chefe = datasetReturned.getValue(0, "RESPONSAVEL");
		log.info("==========[ atualizaEtapaWorkflow createDataset chefe ]========== " + chefe);        
        
        // Gravando retorno no formulário		
		hAPI.setCardValue("gestorcc", chefe);
		
		
		var FlganaliseObrigatoria = datasetReturned.getValue(0, "Flg_Analise");
		  
		
		 // Rodando novo dataset para coletar id tipo produto
        var cmov = DatasetFactory.createConstraint("IDMOV", id_mov, id_mov, ConstraintType.MUST);
        var constraintsProd = new Array(cmov);
        
        // Executando chamada de dataset
        var datasetReturnedProd = DatasetFactory.getDataset("_RM_TITMMOV", null, constraintsProd, null);
        
        if ( datasetReturnedProd.getValue(0, "IDPRD") == 15296 )
        {
        	FlganaliseObrigatoria = 0;
        }
        
        
        // Gravando retorno no formulário		
		hAPI.setCardValue("analiseObrigatoria", FlganaliseObrigatoria);
		
				
	  	/////////////////////////////////////////////
	  	//		ATRIBUINDO GRUPO AUTORIZADOR 	   //
	  	/////////////////////////////////////////////
		
        // Rodando novo dataset para coletar responsável do centro de custo
        var a1 = DatasetFactory.createConstraint("CODCCUSTO", ccusto, ccusto, ConstraintType.MUST);
        var constraints = new Array(a1);
        log.info("==========[ selecionaAutorizador constraints ]========== " + constraints);
        
        // Executando chamada de dataset
        var datasetReturn = DatasetFactory.getDataset("_RM_CCUSTO_AUTORIZADOR", null, constraints, null);
		
		// Retirando o campo do resultado
        var autorizador = datasetReturn.getValue(0, "");
		log.info("==========[ selecionaAutorizador autorizador ]========== " + autorizador); 
    	
    	// Gravando retorno no formulário		
		hAPI.setCardValue("autorizador", autorizador);
		
		
	  	/////////////////////////////////////////////////////////////////
	  	//		ATRIBUINDO FAIXA DE VALORES PARA APROVAÇÃO		 	   //
	  	/////////////////////////////////////////////////////////////////
		
        // 1º Retirando o elemento 2º Retirando o conteúdo
        var nodes = xmlResponse.getElementsByTagName("VALORLIQUIDO");
        var VALORLIQUIDO = nodes.item(0).getTextContent();
		

    	if (parseFloat(VALORLIQUIDO) > parseFloat('115070.6000'))
       	 	var faixa = '2';
    
    	if (parseFloat(VALORLIQUIDO) <= parseFloat('115070.6000'))
       	 	var faixa = '1';
    
    	// Gravando retorno no formulário		
		hAPI.setCardValue("nivelAprov", faixa);

		}
	
	catch (e)
	{
		log.error(e);
		throw e;
	}
}
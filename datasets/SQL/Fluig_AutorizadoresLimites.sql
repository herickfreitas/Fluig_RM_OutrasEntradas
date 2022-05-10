USE [corporerm]
GO

/****** Object:  UserDefinedFunction [dbo].[Fluig_AutorizadoresLimites]    Script Date: 10/05/2022 12:21:31 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO






/* funcao retorna o autorizador da Gesta da CNC, conforme o centro de custo informado. */

ALTER FUNCTION [dbo].[Fluig_AutorizadoresLimites]  

( @CENTROCUSTO AS VARCHAR(17)) 

RETURNS varchar(30) 
AS

    BEGIN  
		
		DECLARE @Retorno AS VARCHAR(30) -- (Autorizador, limite) Portaria N CNC nº 502 2022 
	
		
    	if  (SUBSTRING(@CENTROCUSTO,0,12) = ('12.01.02.01'))
    		SELECT @Retorno = 'simoneguimaraes , 179075.0000' -- COMO SG
    		
    	else if (@CENTROCUSTO = ('20.01.02.08.70080'))
    		SELECT @Retorno = 'leandropinto , 0.0000' -- COMO VPF
    	
    	else if (SUBSTRING(@CENTROCUSTO,0,9) = ('20.01.01'))
			SELECT @Retorno =  'leandropinto , 0.0000' -- COMO VPF
    		
    	else if (SUBSTRING(@CENTROCUSTO,0,3) = ('12') OR SUBSTRING(@CENTROCUSTO,0,3) = ('13') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('14') OR 	SUBSTRING(@CENTROCUSTO,0,3) = ('15') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('16'))
    		SELECT @Retorno =  'elienaicamara , 10000.0000' -- COMO GP
    	
    	else if (SUBSTRING(@CENTROCUSTO,0,3) = ('11') OR SUBSTRING(@CENTROCUSTO,0,3) = ('18') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('50') OR SUBSTRING(@CENTROCUSTO,0,3) = ('90') 
			OR SUBSTRING(@CENTROCUSTO,0,3) = ('99'))
    		SELECT @Retorno =  'leandropinto , 0.0000' --// COMO VPF
    	
    	else
    		SELECT @Retorno =  'simoneguimaraes , 179075.0000' -- // COMO SG 
    	
		RETURN @Retorno 


    END

GO



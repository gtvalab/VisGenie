(function(){

	var dataFilePath = "data/test.csv";
	
	dataProcessor.processFile(dataFilePath);
	
	setTimeout(function () {
		var dataAttributeMap = dataProcessor.getAttributeMap();

		dataProcessorTest(dataAttributeMap);
		visGenie.generateRecommendationMap(dataAttributeMap)
		// getVisObjectsTestSingleAttribute(["AWD"],dataAttributeMap);
		// getVisObjectsTestTwoAttributes(["Retail Price","Len"],dataAttributeMap);
		// getVisObjectsTestThreeAttributes(["AWD","RWD","RWD"],dataAttributeMap);
		// getVisObjectsTestFourAttributes(["AWD","RWD","RWD","RWD"],dataAttributeMap);
	},1000);

	function dataProcessorTest(dataAttributeMap){
		console.log(dataAttributeMap);
	}

	function getVisObjectsTestSingleAttribute(attributes,dataAttributeMap){
		console.log(visGenie.getVisObjects(attributes,dataAttributeMap));	
	}

	function getVisObjectsTestTwoAttributes(attributes,dataAttributeMap){
		console.log(visGenie.getVisObjects(attributes,dataAttributeMap));	
	}

	function getVisObjectsTestThreeAttributes(attributes,dataAttributeMap){
		console.log(visGenie.getVisObjects(attributes,dataAttributeMap));	
	}

	function getVisObjectsTestFourAttributes(attributes,dataAttributeMap){
		console.log(visGenie.getVisObjects(attributes,dataAttributeMap));	
	}	

})();
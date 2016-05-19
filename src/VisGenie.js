(function(){
	visGenie = {};

	var chartTypes = ["Bar","Scatter","Line","Pie","Histogram","Distribution"];

	var datasetAttributeMap = {};

	var recommendationMap = {};

	visGenie.getRecommendations = function(attributes){
		var uniqueAttributes = [];
		var tempAttrMap = {};
		for(var i in attributes){
			var attr = attributes[i];
			tempAttrMap[attr] = 1;
		}
		var attributeCombination = Object.keys(tempAttrMap).sort();
		return recommendationMap[attributeCombination.join(",")];
	};

	visGenie.generateRecommendationMap = function(attributeMap){

		console.log(getPermutations(["RP","DC"]))
		datasetAttributeMap = attributeMap;

		for(var k=1;k<=3;k++){
			var attributeCombinations = getCombinations(Object.keys(datasetAttributeMap),k);
			for(var attributeCombinationIndex in attributeCombinations){
				var attributeCombination = attributeCombinations[attributeCombinationIndex].sort();

				var attributePermutation = getPermutations(attributeCombination);

				var visObjectsForAttributeCombination = []; 

				for(var attributePermutationIndex in attributePermutation){

					var attributes = attributePermutation[attributePermutationIndex];
					for(var chartTypeIndex in chartTypes){
						var chartType = chartTypes[chartTypeIndex];
						var visObjects = generateVisObjects(attributes,chartType);

						//if(attributes.length==1 && attributes.indexOf("Type")!=-1 && chartType=="Bar"){
						//	console.log(attributes,visObjects);
						//}

						for(var visObjectIndex in visObjects){
							var visObject = visObjects[visObjectIndex];
							//if(attributes.length==1 && attributes.indexOf("Type")!=-1 && visObject.chartType=='Bar'){
							//	console.log(visObject,visObjectsForAttributeCombination);
							//	console.log(visGenie.isRepeatedVisObject(visObject,visObjectsForAttributeCombination));
							//}
							if(visGenie.isRepeatedVisObject(visObject,visObjectsForAttributeCombination)==-1 && isValidVisObject(visObject)==1){
								visObjectsForAttributeCombination.push(visObject);
							}
						}
					}

				}

				recommendationMap[attributeCombination.join(",")] = visObjectsForAttributeCombination;
			}
		}

		console.log(recommendationMap)
	
	}

	function getPermutations(attributes){

		var permArr = [],
		  usedChars = [];
		var opt = permute(attributes);

		function permute(input) {
		  var i, ch;
		  for (i = 0; i < input.length; i++) {
		    ch = input.splice(i, 1)[0];
		    usedChars.push(ch);
		    if (input.length == 0) {
		      permArr.push(usedChars.slice());
		    }
		    permute(input);
		    input.splice(i, 0, ch);
		    usedChars.pop();
		  }
		  return permArr
		};

		return opt;

	}

	function generateVisObjects(attributes,chartType){
		var visObjects;
		switch(chartType){
			case "Histogram":
				if(attributes.length==1){
					visObjects = getHistogramVisObjects(attributes[0]);
				}
				break;
			case "Distribution":
				if(attributes.length==1) {
					visObjects = getDistributionChartVisObjects(attributes[0]);
				}
				break;
			case "Scatter":
				visObjects = getScatterplotVisObjects(attributes);
				break;
			case "Bar":
				visObjects = getBarChartVisObjects(attributes);
				break;
			case "Line":
				visObjects = getLineChartVisObjects(attributes);
				break;
			case "Pie":
				visObjects = getPieChartVisObjects(attributes);
				break;
			default:
				break;					
		}
		return visObjects;
	}

	function getHistogramVisObjects(attribute){
		var histogramObject = new VisObject("Histogram");
		histogramObject.setXAttr(attribute);
		return [histogramObject];
	}

	function getDistributionChartVisObjects(attribute){
		var distributionChartObject = new VisObject("Distribution");
		distributionChartObject.setXAttr(attribute);
		return [distributionChartObject];
	}

	function getLineChartVisObjects(attributes) {
		var lineChartObjects = [];
		//var possibleTransforms = ["","MEAN","MODE"];

		if(attributes.length==3){
			var otherChartProperties = ["colorAttr","xFacetAttr"];

			for(var i in otherChartProperties){
				var chartProperty = otherChartProperties[i];

				// var dataAggregationVariationIndex = 0;
				// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated
					var possibleXTransforms = [""], possibleYTransforms = [""];


					// if(dataAggregationVariationIndex>0){	
						possibleXTransforms = getPossibleTransformsBasedOnAttribute(attributes[0]);
						possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
					// }


					if(possibleXTransforms.length>possibleYTransforms.length){
						for(var tmp = 0;tmp<possibleXTransforms.length;tmp++){
							if(tmp>=possibleYTransforms.length){
								possibleYTransforms.push("");
							}
						}
					}else if(possibleXTransforms.length<possibleYTransforms.length){
						for(var tmp = 0;tmp<possibleYTransforms.length;tmp++){
							if(tmp>=possibleXTransforms.length){
								possibleXTransforms.push("");
							}
						}
					}


					for(var tmp in possibleXTransforms){

						var lineChartObject = new VisObject("Line");

						var swapped = setXYAttributes(attributes[0],attributes[1],lineChartObject);

						// lineChartObject.setXAttr(attributes[0]);
						// lineChartObject.setYAttr(attributes[1]);

						if(chartProperty=="colorAttr"){
							lineChartObject.setColorAttr(attributes[2]);
						}else if(chartProperty=="xFacetAttr"){
							lineChartObject.setXFacetAttr(attributes[2]);
						}

						if(swapped==1){
							lineChartObject.setXTransform(possibleYTransforms[tmp]);
							lineChartObject.setYTransform(possibleXTransforms[tmp]);
						}else{
							lineChartObject.setXTransform(possibleXTransforms[tmp]);
							lineChartObject.setYTransform(possibleYTransforms[tmp]);
						}



						lineChartObjects.push(lineChartObject);
					}

					// dataAggregationVariationIndex += 1;

				// }
			}
		}else if(attributes.length==2){
			
			// var dataAggregationVariationIndex = 0;
			// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated

				var possibleXTransforms = [""], possibleYTransforms = [""];

				// if(dataAggregationVariationIndex>0){	
					possibleXTransforms = getPossibleTransformsBasedOnAttribute(attributes[0]);
					possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
				// }

				if(possibleXTransforms.length>possibleYTransforms.length){
					for(var tmp = 0;tmp<possibleXTransforms.length;tmp++){
						if(tmp>=possibleYTransforms.length){
							possibleYTransforms.push("");
						}
					}
				}else if(possibleXTransforms.length<possibleYTransforms.length){
					for(var tmp = 0;tmp<possibleYTransforms.length;tmp++){
						if(tmp>=possibleXTransforms.length){
							possibleXTransforms.push("");
						}
					}
				}

				// console.log(possibleXTransforms,possibleYTransforms)

				for(var tmp in possibleXTransforms){
					var lineChartObject = new VisObject("Line");
					
					// lineChartObject.setXAttr(attributes[0]);
					// lineChartObject.setYAttr(attributes[1]);

					var swapped = setXYAttributes(attributes[0],attributes[1],lineChartObject);

					if(swapped==1){
						lineChartObject.setXTransform(possibleYTransforms[tmp]);
						lineChartObject.setYTransform(possibleXTransforms[tmp]);
					}else{
						lineChartObject.setXTransform(possibleXTransforms[tmp]);
						lineChartObject.setYTransform(possibleYTransforms[tmp]);
					}

					lineChartObjects.push(lineChartObject);
				}

				// dataAggregationVariationIndex += 1;
			// }
		}

		return lineChartObjects;

	}

	function getScatterplotVisObjects(attributes) {
		var scatterplotObjects = [];
		var possibleTransforms = ["","MEAN","MODE"];

		if(attributes.length==3){
			var otherChartProperties = ["colorAttr","sizeAttr","xFacetAttr"];

			for(var i in otherChartProperties){
				var chartProperty = otherChartProperties[i];

				// var dataAggregationVariationIndex = 0;
				// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated

					var possibleXTransforms = [""], possibleYTransforms = [""];

					// if(dataAggregationVariationIndex>0){	
						possibleXTransforms = getPossibleTransformsBasedOnAttribute(attributes[0]);
						possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
					// }

					if(possibleXTransforms.length>possibleYTransforms.length){
						for(var tmp = 0;tmp<possibleXTransforms.length;tmp++){
							if(tmp>=possibleYTransforms.length){
								possibleYTransforms.push("");
							}
						}
					}else if(possibleXTransforms.length<possibleYTransforms.length){
						for(var tmp = 0;tmp<possibleYTransforms.length;tmp++){
							if(tmp>=possibleXTransforms.length){
								possibleXTransforms.push("");
							}
						}
					}

					for(var tmp in possibleXTransforms){

						var scatterplotObject = new VisObject("Scatter");

						var swapped = setXYAttributes(attributes[0],attributes[1],scatterplotObject);
						
						
						if(chartProperty=="colorAttr"){
							scatterplotObject.setColorAttr(attributes[2]);
						}else if(chartProperty=="sizeAttr"){
							scatterplotObject.setSizeAttr(attributes[2]);
						}else if(chartProperty=="xFacetAttr"){
							scatterplotObject.setXFacetAttr(attributes[2]);
						}

						if(swapped==1){
							scatterplotObject.setXTransform(possibleYTransforms[tmp]);
							scatterplotObject.setYTransform(possibleXTransforms[tmp]);
						}else{
							scatterplotObject.setXTransform(possibleXTransforms[tmp]);
							scatterplotObject.setYTransform(possibleYTransforms[tmp]);
						}
						

						scatterplotObjects.push(scatterplotObject);
					}

					// dataAggregationVariationIndex += 1;

				// }
			}
		}else if(attributes.length==2){
			
			// var dataAggregationVariationIndex = 0;
			// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated

				var possibleXTransforms = [""], possibleYTransforms = [""];

				// if(dataAggregationVariationIndex>0){	
					possibleXTransforms = getPossibleTransformsBasedOnAttribute(attributes[0]);
					possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
				// }

				if(possibleXTransforms.length>possibleYTransforms.length){
					for(var tmp = 0;tmp<possibleXTransforms.length;tmp++){
						if(tmp>=possibleYTransforms.length){
							possibleYTransforms.push("");
						}
					}
				}else if(possibleXTransforms.length<possibleYTransforms.length){
					for(var tmp = 0;tmp<possibleYTransforms.length;tmp++){
						if(tmp>=possibleXTransforms.length){
							possibleXTransforms.push("");
						}
					}
				}

				// console.log(possibleXTransforms,possibleYTransforms)

				for(var tmp in possibleXTransforms){
					var scatterplotObject = new VisObject("Scatter");
					
					var swapped = setXYAttributes(attributes[0],attributes[1],scatterplotObject);

					if(swapped==1){
						scatterplotObject.setXTransform(possibleYTransforms[tmp]);
						scatterplotObject.setYTransform(possibleXTransforms[tmp]);
					}else{
						scatterplotObject.setXTransform(possibleXTransforms[tmp]);
						scatterplotObject.setYTransform(possibleYTransforms[tmp]);
					}

					scatterplotObjects.push(scatterplotObject);
				}

				// dataAggregationVariationIndex += 1;
			// }
		}

		return scatterplotObjects;

	}

	function getPossibleTransformsBasedOnAttribute(attribute){

		var possibleTransforms = [""];
		if(datasetAttributeMap[attribute]["isNumeric"]=="1"){ // if is a numeric variable, use MEAN
			possibleTransforms.push("MEAN");
		}

		if(datasetAttributeMap[attribute]["isNumeric"]=="1" && datasetAttributeMap[attribute]["isCategorical"]=="1"){ // if is a categorical (numerical) variable, use MODE
			possibleTransforms.push("MODE");
		}


		return possibleTransforms;
	}

	function getBarChartVisObjects(attributes) {
		var barChartObjects = [];

		if(attributes.length==3){
			var dataAggregationVariationIndex = 0;
			// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated
				
				var possibleYTransforms = [""];

				// if(dataAggregationVariationIndex>0){
					possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
				// }

				for(var tmp in possibleYTransforms){
					for(var i=1;i<3;i++){
						var barChartObject = new VisObject("Bar");

						// barChartObject.setXAttr(attributes[0]);
						// barChartObject.setYAttr(attributes[1]);
						setXYAttributes(attributes[0],attributes[1],barChartObject);

						barChartObject.setXFacetAttr(attributes[2]);

						barChartObject.setYTransform(possibleYTransforms[tmp]);


						if(i==2){
							barChartObject.setColorAttr(barChartObject.xAttr);
						}

						barChartObjects.push(barChartObject);
					}

				}

				// dataAggregationVariationIndex += 1;
			// }
		}else if(attributes.length==2){
			// var dataAggregationVariationIndex = 0;
			// while(dataAggregationVariationIndex<2){ // 2 iterations : 1 for raw attributes and 1 for aggregated

				var possibleYTransforms = [""];

				// if(dataAggregationVariationIndex>0){
					possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
				// }

				for(var tmp in possibleYTransforms){
					for(var i=1;i<3;i++){
						var barChartObject = new VisObject("Bar");

						setXYAttributes(attributes[0],attributes[1],barChartObject);

						barChartObject.setYTransform(possibleYTransforms[tmp]);

						if(i==2){
							barChartObject.setColorAttr(barChartObject.xAttr);
						}

						barChartObjects.push(barChartObject);
					}
				}

				// dataAggregationVariationIndex += 1;

			// }
		}else if(attributes.length==1){
			for(var i=1;i<3;i++){
				var barChartObject = new VisObject("Bar");

				setXYAttributes(attributes[0],attributes[0],barChartObject);

				barChartObject.setYTransform("COUNT");

				if(i==2){
					barChartObject.setColorAttr(barChartObject.xAttr);
				}
				barChartObjects.push(barChartObject);
			}
		}

		return barChartObjects;
	}

	function getPieChartVisObjects(attributes) {
		var pieChartObjects = [];

		if(attributes.length==2){
			var possibleYTransforms = [""];

			possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);
			
			for(var tmp in possibleYTransforms){
				var pieChartObject = new VisObject("Pie");
				
				// pieChartObject.setXAttr(attributes[0]);
				// pieChartObject.setYAttr(attributes[1]);
				setXYAttributes(attributes[0],attributes[1],pieChartObject);

				pieChartObject.setYTransform(possibleYTransforms[tmp]);
				pieChartObject.setColorAttr(pieChartObject.xAttr);

				pieChartObjects.push(pieChartObject);
			}
		}else if(attributes.length==1){
			var pieChartObject = new VisObject("Pie");

			// pieChartObject.setXAttr(attributes[0]);
			// pieChartObject.setYAttr(attributes[0]);
			setXYAttributes(attributes[0],attributes[0],pieChartObject);

			pieChartObject.setYTransform("COUNT");
			pieChartObject.setColorAttr(pieChartObject.xAttr);

			pieChartObjects.push(pieChartObject);
		}

		return pieChartObjects;
	}

	visGenie.isRepeatedVisObject = function(newVisObject,visObjects){
		for(var i in visObjects){
			var visObject = visObjects[i];
			if(visObject["chartType"]==newVisObject["chartType"]){
				if(visObject['xAttr']==newVisObject['xAttr'] && visObject['yAttr']==newVisObject['yAttr'] && visObject['xTransform']==newVisObject['xTransform'] && visObject['yTransform']==newVisObject['yTransform'] && visObject['colorAttr']==newVisObject['colorAttr']){
					return 1;
				} else if(visObject['chartType']=="Bar"){
					if(visObject['xAttr']==newVisObject['yAttr'] && visObject['yAttr']==newVisObject['xAttr'] && visObject['xTransform']==newVisObject['yTransform'] && visObject['yTransform']==newVisObject['xTransform'] && visObject['colorAttr']==newVisObject['colorAttr']){
						return 1;
					}
				} else {
					if(visObject['xAttr']==newVisObject['yAttr']){
						return 1;
					}
				}
			}
		}
		return -1;
	};

	function setXYAttributes(attribute1,attribute2,visObject){

		var swapped = -1;

		if(isOnlyCategorical(attribute1)==1 || isOnlyCategorical(attribute2)==1){
				if(isOnlyCategorical(attribute1)==1){
					visObject.setXAttr(attribute1);
					visObject.setYAttr(attribute2);
				}else if(isOnlyCategorical(attribute2)==1){
					visObject.setXAttr(attribute2);
					visObject.setYAttr(attribute1);

					swapped = 1;
				}
		}else{
			if(datasetAttributeMap[attribute1]['domain'].length<=datasetAttributeMap[attribute2]['domain'].length){
				visObject.setXAttr(attribute1);
				visObject.setYAttr(attribute2);
			}else{
				visObject.setXAttr(attribute2);
				visObject.setYAttr(attribute1);

				swapped = 1;
			}
		}

		//if(visObject['chartType']=="Bar" || visObject['chartType']=="Pie"){
		//	if(isOnlyCategorical(attribute1)==1){
		//		visObject.setXAttr(attribute1);
		//		visObject.setYAttr(attribute2);
		//	}else if(isOnlyCategorical(attribute2)==1){
		//		visObject.setXAttr(attribute2);
		//		visObject.setYAttr(attribute1);
		//	}
		//}

		return swapped;

	}

	function getCombinations(set, k) {
	    var i, j, combs, head, tailcombs;

	    if (k > set.length || k <= 0) {
	        return [];
	    }

	    if (k == set.length) {
	        return [set];
	    }

	    if (k == 1) {
	        combs = [];
	        for (i = 0; i < set.length; i++) {
	            combs.push([set[i]]);
	        }
	        return combs;
	    }

	    // Assert {1 < k < set.length}

	    combs = [];
	    for (i = 0; i < set.length - k + 1; i++) {
	        head = set.slice(i, i+1);
	        tailcombs = getCombinations(set.slice(i + 1), k - 1);
	        for (j = 0; j < tailcombs.length; j++) {
	            combs.push(head.concat(tailcombs[j]));
	        }
	    }
	    return combs;
	}

	function isValidVisObject(visObject){
		var chartType = visObject["chartType"];
		switch(chartType){
			case "Histogram":
				if(visObject.attributeCount>1){
					return -1;
				}
				if(isOnlyNumeric(visObject.xAttr)==-1){
					return -1;
				}
				break;
			case "Distribution":
				if(visObject.attributeCount>1){
					return -1;
				}
				if(isOnlyNumeric(visObject.xAttr)==-1){
					return -1;
				}
				break;
			case "Scatter":
				if(visObject.attributeCount<2){
					return -1;
				}else if(visObject.xFacetAttr!=""){
					if(isOnlyNumeric(visObject.xFacetAttr)==1){
						return -1;
					}
				}else if(visObject.yFacetAttr!=""){
					if(isOnlyNumeric(visObject.yFacetAttr==1)){
						return -1;
					}
				}
				break;
			case "Bar":
				if(isOnlyCategorical(visObject.yAttr)==1 && visObject.yTransform==""){
					return -1;
				}else if(isOnlyNumeric(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){
					return -1;
				} else if(visObject.yTransform==""){
					return -1;
				}else if(visObject.xFacetAttr!=""){
					if(isOnlyNumeric(visObject.xFacetAttr)==1){
						return -1;
					}
				}else if(visObject.yFacetAttr!=""){
					if(isOnlyNumeric(visObject.yFacetAttr==1)){
						return -1;
					}
				}
				break;
			case "Line":
				if(visObject.attributeCount<2){
					return -1;
				}else if(visObject.xFacetAttr!=""){
					if(isOnlyNumeric(visObject.xFacetAttr)==1){
						return -1;
					}
				}else if(visObject.yFacetAttr!=""){
					if(isOnlyNumeric(visObject.yFacetAttr==1)){
						return -1;
					}
				}else{
					if(isOnlyCategorical(visObject.xAttr)==1 && isOnlyCategorical(visObject.yAttr)==1){
						if(visObject.xTransform=="" && visObject.yTransform==""){
							return -1;
						}
					}
				}
				break;
			case "Pie":
				if(isOnlyCategorical(visObject.yAttr)==1 && visObject.yTransform==""){
					return -1;
				}else if(isOnlyNumeric(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){
					return -1;
				}else if(visObject.yTransform==""){
					return -1;
				}else if(visObject.xFacetAttr!=""){
					if(isOnlyNumeric(visObject.xFacetAttr)==1){
						return -1;
					}
				}else if(visObject.yFacetAttr!=""){
					if(isOnlyNumeric(visObject.yFacetAttr==1)){
						return -1;
					}
				}

				break;
			default:
				break;					
		}

		return 1;
	}

	function isNumeric(attribute){
		if(attribute!="" && (attribute in datasetAttributeMap)){
			if(datasetAttributeMap[attribute]['isNumeric']=='1'){
				return 1;
			}
		}
		return -1;
	}

	function isOnlyNumeric(attribute){
		if(attribute!="" && (attribute in datasetAttributeMap)){
			if(datasetAttributeMap[attribute]['isCategorical']=='0' && datasetAttributeMap[attribute]['isNumeric']=='1'){
				return 1;
			}
		}
		return -1;
	}

	function isOnlyCategorical(attribute){
		if(datasetAttributeMap[attribute]['isCategorical']=='1' && datasetAttributeMap[attribute]['isNumeric']=='0'){
			return 1;
		}
		return -1;
	}

	function isCategoricalAndNumeric(attribute){
		if(datasetAttributeMap[attribute]['isCategorical']=='1' && datasetAttributeMap[attribute]['isNumeric']=='1'){
			return 1;
		}
		return -1;
	}

	function swap(a,b){
		var tmp;
		tmp = clone(a);
		a = clone(b);
		b = clone(tmp);
	}

	function clone(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;

		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}


	/*

	function isValidChart(attributes,chartType){
		switch(chartType){
			case "Scatter":
				if(attributes.length<2){
					return -1;
				}else{

				}
				break;
			case "Bar":
				if(attributes.length<2){
					return -1;
				}else{
					
				}
				break;
			case "Line":
				if(attributes.length<2){
					return -1;
				}else{
					
				}
				break;
			case "Pie":
				if(attributes.length<2){
					return -1;
				}else{
					
				}
				break;
		}
		return 1;
	}

	visGenie.getVisObjects = function (attributes,attributeMap,useAllCombinations) {

		useAllCombinations = typeof useAllCombinations !== 'undefined' ? useAllCombinations : 0;
		
		var attributeCount = attributes.length;
		var visObjects = [];
		datasetAttributeMap = attributeMap;
		
		switch(attributeCount){
			case 1:				
				visObjects = singleAttribute(attributes[0]);
				break;
			case 2:				
			case 3:
			case 4:
				if(useAllCombinations==1){
					visObjects = multipleAttributesAllCombinations(attributes);
				}else{
					visObjects = multipleAttributes(attributes);
				}
				break;
			default:
				console.log(">4 attributes. Currently unsupported feature!");
		}
		return visObjects;
	}

	function singleAttribute(attribute){
		var countSpecificCharts = ["Histogram","Distribution"];
		var visObjects = [];

		for(var i in countSpecificCharts){
			var chartType = countSpecificCharts[i];
			var visObject = generateVisObject([attribute],chartType)
			visObjects.push(visObject);
		}

		return visObjects;
	}

	function multipleAttributesAllCombinations(attributes){
		var countSpecificCharts = ["Scatter","Bar","Line","Pie"];
		var visObjects = [];

		var attributeCombinations = getCombinations(attributes);
		
		for(var i in attributeCombinations){
			var attributeCombination = attributeCombinations[i];
			for(var i in countSpecificCharts){
				var chartType = countSpecificCharts[i];
				if(attributeCombination.length==1){
					var visObject = generateVisObject([attribute],chartType)
					visObjects.push(visObject);
				}else{
					if(isValidChart(attributeCombination,chartType)==1){
						var visObject = generateVisObject(attributeCombination,chartType)
						visObjects.push(visObject);
					}
				}
			}
		}

		return visObjects;
	}

	function multipleAttributes(attributes){
		var countSpecificCharts = ["Scatter","Bar","Line","Pie"];
		var visObjects = [];

		for(var i in countSpecificCharts){
			var chartType = countSpecificCharts[i];
			console.log(isValidChart(attributes,chartType),chartType,attributes)
			if(isValidChart(attributes,chartType)==1){
				var visObject = generateVisObject(attributes,chartType)
				visObjects.push(visObject);
			}
		}

		return visObjects;
	}
	
	*/

	/*
	function getCombinations(set, min) {
		
		for(var i=0;i<set.length-1; i++){
			var item1 = set[i];
			for(var j = i+1; j<set.length;j++){
				var item2 = set[j];
				if(item1==item2){
					throw "getCombinations() takes a set of items (no duplicates)."
				}
			}
		}
		
		min = typeof min !== 'undefined' ? min : 1;

	    var fn = function(n, src, got, all) {
	        if (n == 0) {
	            if (got.length > 0) {
	                all[all.length] = got;
	            }
	            return;
	        }
	        for (var j = 0; j < src.length; j++) {
	            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
	        }
	        return;
	    }
	    var all = [];
	    for (var i = min; i < set.length; i++) {
	        fn(i, set, [], all);
	    }
	    all.push(set);
	    return all;
	}*/
	
})();
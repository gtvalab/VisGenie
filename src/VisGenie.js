(function(){
	visGenie = {};

	var chartTypes = ["Bar","Scatterplot","Line","Pie","Histogram","Distribution"];
	//var chartTypes = ["Scatter"];

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

	visGenie.generateRecommendationMap = function(attributeMap,attributesToSkip){

		//console.log(getPermutations(["Retail Price","Dealer Cost","Type"]))

		attributesToSkip = typeof attributesToSkip !== 'undefined' ? attributesToSkip : [];

		var attributesToConsider = [];
		if (attributesToSkip.length==0){
			attributesToConsider = Object.keys(attributeMap);
			datasetAttributeMap = attributeMap;
		}else{
			var allAttributes = Object.keys(attributeMap);
			for(var i in allAttributes){
				var attr = allAttributes[i];
				if(attributesToSkip.indexOf(attr)==-1){
					attributesToConsider.push(attr);
					datasetAttributeMap[attr] = attributeMap[attr];
				}
			}
		}


		for(var k=1;k<=3;k++){
			var attributeCombinations = getCombinations(attributesToConsider,k);
			for(var attributeCombinationIndex in attributeCombinations){
				var attributeCombination = attributeCombinations[attributeCombinationIndex].sort();

				var attributePermutations = getPermutations(attributeCombination);

				var visObjectsForAttributeCombination = [];

				for(var attributePermutationIndex in attributePermutations){

					var attributes = attributePermutations[attributePermutationIndex];

					for(var chartTypeIndex in chartTypes){
						var chartType = chartTypes[chartTypeIndex];
						var visObjects = generateVisObjects(attributes,chartType);

						for(var visObjectIndex in visObjects){
							var visObject = visObjects[visObjectIndex];
							//if(attributes.length==1 && attributes.indexOf("Type")!=-1 && visObject.chartType=='Bar'){
							//	console.log(visObject,visObjectsForAttributeCombination);
							//	console.log(visGenie.isRepeatedVisObject(visObject,visObjectsForAttributeCombination));
							//}

							//if(visObject.xAttr=="Type" && visObject.yAttr=="Retail Price" && visObject.attributeCount==3 && visObject.xFacetAttr!=""){
							//	console.log(visObject)
							//}

							//if(attributes[2]=="Dealer Cost" && visObject.attributeCount==3){
							//	console.log(visGenie.isRepeatedVisObject(visObject,visObjectsForAttributeCombination,1))
							//}
							if(visGenie.isRepeatedVisObject(visObject,visObjectsForAttributeCombination)==-1 && isValidVisObject(visObject)==1){
								scoreVisObject(visObject);
								visObjectsForAttributeCombination.push(visObject);
							}
						}
					}

				}

				sortObjectList(visObjectsForAttributeCombination,'score','d');

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
		var visObjects = [];
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
			case "Scatterplot":
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

					var scatterplotObject = new VisObject("Scatterplot");

					var swapped = setXYAttributes(attributes[0],attributes[1],scatterplotObject);


					if(chartProperty=="colorAttr"){
						if(datasetAttributeMap[attributes[2]['isCategorical']]=='1'){
							scatterplotObject.setColorAttr(attributes[2]);
						}
					}else if(chartProperty=="sizeAttr"){
						if(datasetAttributeMap[attributes[2]['isCategorical']]=='1' && datasetAttributeMap[attributes[2]['isNumeric']]=='1') {
							scatterplotObject.setSizeAttr(attributes[2]);
						}
					}else if(chartProperty=="xFacetAttr"){
						if(datasetAttributeMap[attributes[2]['isCategorical']]=='1') {
							scatterplotObject.setXFacetAttr(attributes[2]);
						}
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
				var scatterplotObject = new VisObject("Scatterplot");

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

		//if(attributes[2]=="Dealer Cost"){
		//	console.log(scatterplotObjects)
		//}


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

		if(attributes.length==3){
			var dataAggregationVariationIndex = 0;

			var possibleYTransforms = [""];

			possibleYTransforms = getPossibleTransformsBasedOnAttribute(attributes[1]);

			for(var tmp in possibleYTransforms){
				var pieChartObject = new VisObject("Pie");

				setXYAttributes(attributes[0],attributes[1],pieChartObject);

				pieChartObject.setXFacetAttr(attributes[2]);

				pieChartObject.setYTransform(possibleYTransforms[tmp]);

				pieChartObject.setColorAttr(pieChartObject.xAttr);

				pieChartObjects.push(pieChartObject);

			}

		} else if(attributes.length==2){
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

	visGenie.isRepeatedVisObject = function(newVisObject,visObjects,print){

			for(var i in visObjects){
			var visObject = visObjects[i];
			if(visObject["chartType"]==newVisObject["chartType"] && visObject.attributeCount==newVisObject.attributeCount){
				if(visObject['xAttr']==newVisObject['xAttr'] && visObject['yAttr']==newVisObject['yAttr'] && visObject['xTransform']==newVisObject['xTransform'] && visObject['yTransform']==newVisObject['yTransform'] && visObject['colorAttr']==newVisObject['colorAttr'] && visObject['xFacetAttr']==newVisObject['xFacetAttr'] && visObject['yFacetAttr']==newVisObject['yFacetAttr']){
					//if(print==1){
					//	console.log(newVisObject,visObject)
					//}
					return 1;
				} else if(visObject['chartType']=="Bar"){
					if(visObject['xAttr']==newVisObject['yAttr'] && visObject['yAttr']==newVisObject['xAttr'] && visObject['xTransform']==newVisObject['yTransform'] && visObject['yTransform']==newVisObject['xTransform'] && visObject['colorAttr']==newVisObject['colorAttr'] && visObject['xFacetAttr']==newVisObject['yFacetAttr'] && visObject['yFacetAttr']==newVisObject['xFacetAttr']){
						return 1;
					}
				} else {
					//if(print==1){
					//	console.log(newVisObject,visObject)
					//}
					if(visObject['xAttr']==newVisObject['yAttr'] && visObject['yAttr']==newVisObject['xAttr']){
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
			case "Scatterplot":
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

	function isCategorical(attribute){
		if(attribute!="" && (attribute in datasetAttributeMap)){
			if(datasetAttributeMap[attribute]['isCategorical']=='1'){
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

	function scoreVisObject(visObject){
		var chartType = visObject.chartType;
		switch (chartType){
			case "Histogram":
				scoreHistogram(visObject);
				break;
			case "Distribution":
				scoreDistributionChart(visObject);
				break;
			case "Scatterplot":
				scoreScatterplot(visObject);
				break;
			case "Bar":
				scoreBarChart(visObject);
				break;
			case "Line":
				scoreLineChart(visObject);
				break;
			case "Pie":
				scorePieChart(visObject);
				break;
			default:
				break;
		}
	}

	function scoreBarChart(visObject){

		if(isCategorical(visObject.xAttr)==1){
			visObject.score += 1;
		}

		if(isOnlyNumeric(visObject.yAttr) && visObject.yTransform!=""){
			visObject.score += 1;
		}else if(isCategorical(visObject.yAttr) && visObject.yTransform=="COUNT"){ // single or two attribute chart with COUNT on Y-axis (prefer a pie chart to a bar chart)
			visObject.score += 0.5;
		}

		var xAttrDomainLength = visObject.xAttr=="" ? 0 : datasetAttributeMap[visObject.xAttr]['domain'].length;
		var xFacetAttrDomainLength = visObject.xFacetAttr=="" ? 0 : datasetAttributeMap[visObject.xFacetAttr]['domain'].length;
		var yFacetAttrDomainLength = visObject.yFacetAttr=="" ? 0 : datasetAttributeMap[visObject.yFacetAttr]['domain'].length;
		var colorAttrDomainLength = visObject.colorAttr=="" ? 0 : datasetAttributeMap[visObject.colorAttr]['domain'].length;

		if(xAttrDomainLength>0 && xAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(xFacetAttrDomainLength>0 && xFacetAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(yFacetAttrDomainLength>0 && yFacetAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(colorAttrDomainLength>0 && colorAttrDomainLength<=12 && (visObject.colorAttr!=visObject.xAttr)){
			visObject.score += 1;
		}


	}

	function scorePieChart(visObject){

		if(isCategorical(visObject.xAttr)==1){
			visObject.score += 1;
		}

		if(isOnlyNumeric(visObject.yAttr) && visObject.yTransform!=""){
			visObject.score += 1;
		}else if(isCategorical(visObject.yAttr) && visObject.yTransform=="COUNT"){ // single or two attribute chart with COUNT on Y-axis (prefer a pie chart to a bar chart)
			visObject.score += 1;
		}

		var xAttrDomainLength = visObject.xAttr=="" ? 0 : datasetAttributeMap[visObject.xAttr]['domain'].length;
		var xFacetAttrDomainLength = visObject.xFacetAttr=="" ? 0 : datasetAttributeMap[visObject.xFacetAttr]['domain'].length;
		var yFacetAttrDomainLength = visObject.yFacetAttr=="" ? 0 : datasetAttributeMap[visObject.yFacetAttr]['domain'].length;
		var colorAttrDomainLength = visObject.colorAttr=="" ? 0 : datasetAttributeMap[visObject.colorAttr]['domain'].length;

		if(xAttrDomainLength>0 && xAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(xFacetAttrDomainLength>0 && xFacetAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(yFacetAttrDomainLength>0 && yFacetAttrDomainLength<=12){
			visObject.score += 1;
		}

		if(colorAttrDomainLength>0 && colorAttrDomainLength<=12 && (visObject.colorAttr!=visObject.xAttr)){
			visObject.score += 1;
		}

	}

	function scoreHistogram(visObject){

		visObject.score = 1;

	}

	function scoreDistributionChart(visObject){

		visObject.score = 1;

	}

	function scoreScatterplot(visObject){

		if(isOnlyNumeric(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){
			visObject.score += 2;
		}else if(isCategorical(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){
			visObject.score += 1;
		}else if(isCategorical(visObject.xAttr)==1 && isCategorical(visObject.yAttr)==1){
			visObject.score += 0.5;
		}
		//add a date check to increment score slightly (1)


		//var colorAttrDomainLength = visObject.colorAttr=="" ? 0 : datasetAttributeMap[visObject.colorAttr]['domain'].length;
		//var sizeAttrDomainLength = visObject.sizeAttr=="" ? 0 : datasetAttributeMap[visObject.colorAttr]['domain'].length;
        //
		//if(colorAttrDomainLength>0 && colorAttrDomainLength<=12){
		//	visObject.score += 1;
		//}
        //
		//if(sizeAttrDomainLength>0 && sizeAttrDomainLength<=12){
		//	visObject.score += 1;
		//}

		if(isAggregationTransform(visObject.xTransform)==1 && isAggregationTransform(visObject.yTransform)==1){
			visObject.score -= 1;
		}

	}

	function isAggregationTransform(transform){
		var aggregationTransforms = ["MEAN","MODE","COUNT","SUM"];
		if(aggregationTransforms.indexOf(transform)!=-1){
			return 1;
		}
		return -1;
	}

	function scoreLineChart(visObject){

		if(isOnlyNumeric(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){ // gets 2 for date + numeric
			visObject.score += 1.5;
		}else if(isCategorical(visObject.xAttr)==1 && isOnlyNumeric(visObject.yAttr)==1){
			visObject.score += 1;
		}else if(isCategorical(visObject.xAttr)==1 && isCategorical(visObject.yAttr)==1){
			visObject.score += 0.5;
		}

		if(isAggregationTransform(visObject.xTransform)==1 && isAggregationTransform(visObject.yTransform)==1){
			visObject.score -= 1;
		}

	}

	function sortObjectList(list, key,order) {
		order = typeof order !== 'undefined' ? order : 'a';
		function compare(a, b) {
			a = a[key];
			b = b[key];
			var type = (typeof(a) === 'string' || typeof(b) === 'string') ? 'string' : 'number';
			var result;
			if (type === 'string'){
				if(key=='startDate' || key=='endDate'){
					a = new Date(a).getTime();
					b = new Date(b).getTime();
					if(order=='a'){
						result = a - b;
					}else if(order=='d'){
						result = b - a;
					}
					//if(order=='a'){
					//    result = a < b;
					//}else if(order=='d'){
					//    result = a > b;
					//}
				}else{
					if(order=='a'){
						result = a.localeCompare(b);
					}else if(order=='d'){
						result = b.localeCompare(a);
					}
				}
			} else {
				if(order=='a'){
					result = a - b;
				}else if(order=='d'){
					result = b - a;
				}
			}
			return result;
		}
		return list.sort(compare);
	}

})();
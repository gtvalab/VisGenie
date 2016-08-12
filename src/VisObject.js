(function(){

    VisObject = function(chartType){
        this.chartType = chartType;
        this.data = [];
        this.xAttr = "";
        this.yAttr = "";
        this.colorAttr = "";
        this.sizeAttr = "";
        this.xFacetAttr = "";
        this.yFacetAttr = "";
        this.xTransform = "";
        this.yTransform = "";
        this.score = 0.0;
        this.attributeCount = 0;
    };

    VisObject.prototype.setData = function(completeDataList) {
        this.data = data;
    };

    VisObject.prototype.setXAttr = function(attr) {
        this.xAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setYAttr = function(attr) {
        this.yAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setColorAttr = function(attr) {
        this.colorAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setSizeAttr = function(attr) {
        this.sizeAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setXFacetAttr = function(attr) {
        this.xFacetAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setYFacetAttr = function(attr) {
        this.yFacetAttr = attr;
        updateAttributeScore(this);
    };

    VisObject.prototype.setXTransform = function(transform) {
        this.xTransform = transform;
    };

    VisObject.prototype.setYTransform = function(transform) {
        this.yTransform = transform;
    };

    VisObject.prototype.setScore = function(score) {
        this.score = score;
    };

    VisObject.prototype.getScore = function(score) {
        return this.score;
    };

    var updateAttributeScore = function(visObject){
        visObject.attributeCount = 0;
        var visObjectAttrs = ["xAttr","yAttr","xFacetAttr","yFacetAttr","sizeAttr","colorAttr"];

        var attributesInVisObject = [];
        for(var i in visObjectAttrs ){
            var visObjectAttr = visObjectAttrs[i];
            if(attributesInVisObject.indexOf(visObject[visObjectAttr])==-1 && visObject[visObjectAttr]!=""){
                attributesInVisObject.push(visObject[visObjectAttr]);
            }
        }

        visObject.attributeCount = attributesInVisObject.length;

    };

    function getHistogramData(xAttr,data) {

    }

    function getBarChartData(xAttr,yAttr,xAttrTransform,yAttrTransform,colorAttr,facetAttr,data) {
        var transformedList = [];
        var labelValueMap = {};
        for(var i in dataList){
            //console.log(i, dataList[i], labelAttr, valueAttr);
            var dataItem = dataList[i];
            var labelAttrVal = dataItem[xAttr];
            var valueAttrVal = dataItem[yAttr];

            if(Object.keys(labelValueMap).indexOf(labelVal)==-1){ // encountering label for first time
                labelValueMap[labelAttrVal] = {
                    "valueSum":parseFloat(valueAttrVal),
                    "count":1
                };
            }else{
                labelValueMap[labelAttrVal]["valueSum"]+=parseFloat(valueAttrVal);
                labelValueMap[labelAttrVal]["count"]+=1;
            }
        }

        
        if(yAttrTransform=="MEAN"){
            for(var labelVal in labelValueMap){
                transformedList.push({
                    "xVal":labelVal,
                    "yVal":parseFloat(labelValueMap[labelVal]['valueSum']/labelValueMap[labelVal]['count']),
                    "colorVal":labelVal
                });
            }
        }

        return transformedList;
    }

    function getDistributionChartData(xAttr,yAttr,xAttrTransform,yAttrTransform,sizeAttr,colorAttr,facetAttr,data) {

    }

    function getPieChartData(xAttr,yAttr,xAttrTransform,yAttrTransform,sizeAttr,colorAttr,facetAttr,data) {

    }

    function getScatterplotData(xAttr,yAttr,xAttrTransform,yAttrTransform,sizeAttr,colorAttr,facetAttr,data) {

    }

    function getLineChartData(xAttr,yAttr,xAttrTransform,yAttrTransform,sizeAttr,colorAttr,facetAttr,data) {

    }
})();
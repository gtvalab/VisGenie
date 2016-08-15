/**
 * Created by a.srinivasan on 7/19/16.
 */
(function(){

    VisObject = function(chartType){
        this.chartType = chartType;
        this.data = [];
        this.xAttr = "";
        this.yAttr = "";
        this.tooltipLabelAttribute = "";
        this.colorAttr = "";
        this.sizeAttr = "";
        this.xFacetAttr = "";
        this.yFacetAttr = "";
        this.xTransform = "";
        this.yTransform = "";
        this.score = 0.0;
        this.attributeCount = 0;
    }

    VisObject.prototype.setData = function(data) {
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

    VisObject.prototype.setLabelAttr = function(attr) {
        this.tooltipLabelAttribute = attr;
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

        //for(var i in attrs){
        //    var attr = attrs[i];
        //    if(visObject[attr]!="" && visObject[attr]!=undefined){
        //        var increment = 1;
        //        for(var j in attrs){
        //            if(i!=j){
        //                if(visObject[attrs[j]]==visObject[attr]){
        //                    increment = 0;
        //                    break;
        //                }
        //            }
        //        }
        //        if(increment==1){
        //            visObject.attributeCount += 1;
        //        }
        //    }
        //}
        //
        //if(visObject["xAttr"]==visObject["yAttr"] && ((visObject["chartType"]=="Bar") || (visObject["chartType"]=="Pie"))){
        //    if(visObject.attributeCount==0){
        //        visObject.attributeCount = 1;
        //    }
        //}
    }

})();
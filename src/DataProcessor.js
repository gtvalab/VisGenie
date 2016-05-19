(function() {
    dataProcessor = {};
    var attributeMap = {};
    var dataList = [];

    dataProcessor.reset = function () {
        attributeMap = {};
        dataList = [];
    };

    dataProcessor.processFile = function (dataFile,att) {
        dataProcessor.reset();
        d3.csv(dataFile, function(error, data) {
            dataList = data;
            for(var attribute in data[0]){
                attributeMap[attribute] = {
                    'domain':[],
                    'isNumeric':'',
                    'isCategorical':''
                };
            }
            for(var i in data){
                var d = data[i];
                for(var attribute in attributeMap){
                    if(isNaN(d[attribute])){
                        attributeMap[attribute]['isCategorical'] = '1';
                        attributeMap[attribute]['isNumeric'] = '0';
                        attributeMap[attribute]['domain'].push(d[attribute]);
                    }else{
                        attributeMap[attribute]['isNumeric'] = '1';
                        attributeMap[attribute]['isCategorical'] = '0';
                        attributeMap[attribute]['domain'].push(parseFloat(d[attribute]));
                    }
                }
            }
            for(var attribute in attributeMap){
                var valueSet = [];
                $.each(attributeMap[attribute]['domain'], function(i, el){
                    if($.inArray(el, valueSet) === -1) valueSet.push(el);
                });
                attributeMap[attribute]['domain'] = valueSet;
                if(valueSet.length<=12 && attributeMap[attribute]['isCategorical']!='1'){
                    attributeMap[attribute]['isCategorical'] = '1';
                }
            }
        });
    };

    dataProcessor.processList = function (data,attributesToSkip) {

        attributesToSkip = typeof attributesToSkip !== 'undefined' ? attributesToSkip : [];

        dataProcessor.reset();
        for(var attribute in data[0]){
            if(attributesToSkip.length>0){
                if(attributesToSkip.indexOf(attribute)==-1) {
                    attributeMap[attribute] = {
                        'domain': [],
                        'isNumeric': '',
                        'isCategorical': ''
                    };
                }
            }else{
                attributeMap[attribute] = {
                    'domain': [],
                    'isNumeric': '',
                    'isCategorical': ''
                };
            }
        }
        for(var i in data){
            var d = data[i];
            for(var attribute in attributeMap){
                if(isNaN(d[attribute])){
                    attributeMap[attribute]['isCategorical'] = '1';
                    attributeMap[attribute]['isNumeric'] = '1';
                    attributeMap[attribute]['domain'].push(d[attribute]);
                }else{
                    attributeMap[attribute]['isNumeric'] = '1';
                    attributeMap[attribute]['isCategorical'] = '0';
                    attributeMap[attribute]['domain'].push(parseFloat(d[attribute]));
                }
            }
        }
        for(var attribute in attributeMap){
            var valueSet = [];
            $.each(attributeMap[attribute]['domain'], function(i, el){
                if($.inArray(el, valueSet) === -1) valueSet.push(el);
            });
            attributeMap[attribute]['domain'] = valueSet;
            if(valueSet.length<=12 && attributeMap[attribute]['isCategorical']!='1'){
                attributeMap[attribute]['isCategorical'] = '1';
            }
        }
    };

    dataProcessor.getAttributeMap = function(){
        return attributeMap;
    };

    dataProcessor.getDataObjectList = function(){
        return dataList;
    };

    dataProcessor.getAttributeDetails = function(attribute){
        return attributeMap[attribute];
    };
})();
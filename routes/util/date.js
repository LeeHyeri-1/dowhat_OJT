/**
 * Created by Administrator on 2017-01-11.
 */


var date = {
    today : function() {
        var d = new Date();
        var year = d.getFullYear();
        var month = date.addZero(d.getMonth() + 1);
        var day = date.addZero(d.getDate());
        return year +"-"+ month +"-"+ day;
    },
    addDate : function(val) {
        var d = new Date();
        d.setDate(d.getDate() + val);
        var year = d.getFullYear();
        var month = date.addZero(d.getMonth() + 1);
        var day = date.addZero(d.getDate());
        return year +"-"+ month +"-"+ day;
    },
    addZero : function(num) {
        if (num < 10) {
            return "0"+num;
        } else {
            return ""+ num;
        }
    }
};
exports.date = date;
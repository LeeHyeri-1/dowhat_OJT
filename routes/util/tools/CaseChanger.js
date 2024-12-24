/**
 * Created by 유희찬 on 2018-04-13.
 */


var arr = ['funeral_seq', 'user_name', 'phone_number', 'place_seq', 'item_seq', 'director_id', 'reg_method', 'status', 'sale_amount', 'director_fee', 'recommend_fee', 'recommender_id', 'comment', 'reg_date', 'dispatch_date', 'deposit_date', 'calculate_date'];

for(var k in arr) {
    var position = arr[k].search('_');
    if(position > 0) {
        var newStr = arr[k].substr(0, position) + arr[k][position +1].toUpperCase() + arr[k].substr(position + 2);

        arr[k] = newStr;
    }
}

console.log(arr);

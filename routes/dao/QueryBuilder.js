/**
 * Created by 유희찬 on 2019-07-31.
 */

const escape = require('mysql').escape;

const ServerConfig = require('../../ServerConfig');
const globalConfig = ServerConfig.globalConfig;
const AES_SECRET = globalConfig.AES_SECRET;


class QueryBuilder {

    escape(text) {
        return escape(text)
    };

    escapeLike(keyword) {
        return "\\\\LIKE " + escape('%' + keyword + '%');
    };

    parseObject(bigObject, targetArray, addObj) {
        let retObject = {};
        let position = 0;

        for (let i = 0; i < targetArray.length; i++) {
            retObject[targetArray[i]] = bigObject[targetArray[i]];

            let flag = targetArray[i];
            let cnt = 0;
            while (flag.search('_') > 0) {
                position = flag.search('_');
                if (position > 0 && retObject[targetArray[i]] === undefined) {
                    retObject[targetArray[i]] = bigObject[flag.substr(0, position) + flag[position + 1].toUpperCase() + flag.substr(position + 2)];
                    flag = flag.substr(0, position) + flag[position + 1].toUpperCase() + flag.substr(position + 2);

                }

                if (++cnt > 10)
                    break;
            }
        }

        if (addObj !== undefined)
            for (let k in Object.keys(addObj))
                retObject[k] = addObj[k];

        return retObject;
    };

    buildInsert(tblName, insertObj, option = "") {

        if (typeof (option) != 'string')
            option = '';

        let query =
            " INSERT " + option + " INTO " + tblName +
            " SET ";

        let idx = 0;
        for (let k in insertObj) {
            try {
                if (insertObj[k][0] === '\\')
                    query += k + " = " + insertObj[k].slice(1, insertObj[k].length);
                else
                    query += k + " = " + escape(insertObj[k]);

            } catch (err) {
                query += k + " = " + escape(insertObj[k]);

            }

            if (++idx < Object.keys(insertObj).length)
                query += ", ";

        }

        return query;
    };

    buildInsertMultiple (tblName, insertList, option = "") {

        if (typeof (option) != 'string')
            option = '';

        let query = (option == "REPLACE" ? " REPLACE " : " INSERT "  + option  ) + " INTO " + tblName + " (";

        for (let val in insertList[0]) {
            query += val + ", ";
        }


        query = query.substring(0, query.length - 2) + ") VALUES ";

        for (let i = 0; i < insertList.length; i++) {
            query += "(";

            let idx = 0;
            for (let val in insertList[i]) {
                try {
                    if (insertList[i][val][0] === '\\')
                        query += insertList[i][val].slice(1, insertList[i][val].length);
                    else
                        query += escape(insertList[i][val]);

                } catch (err) {
                    query += escape(insertList[i][val]);

                }

                if (++idx < Object.keys(insertList[i]).length)
                    query += ", ";

            }

            query += ")";

            if (i + 1 < insertList.length)
                query += ", ";
        }

        return query;
    };

    buildInsertDupUpdate(tblName, insertObj, updateObj) {

        let query =
            " INSERT INTO " + tblName +
            " SET ";

        let idx = 0;
        for (let k in insertObj) {
            try {
                if (insertObj[k][0] === '\\')
                    query += k + " = " + insertObj[k].slice(1, insertObj[k].length);
                else
                    query += k + " = " + escape(insertObj[k]);

            } catch (err) {
                query += k + " = " + escape(insertObj[k]);

            }

            if (++idx < Object.keys(insertObj).length)
                query += ", ";

        }

        query += " ON DUPLICATE KEY UPDATE ";


        idx = 0;
        for (let k in updateObj) {
            try {
                if (updateObj[k][0] === '\\')
                    query += k + " = " + updateObj[k].slice(1, updateObj[k].length);
                else
                    query += k + " = " + escape(updateObj[k]);

            } catch (err) {
                query += k + " = " + escape(updateObj[k]);

            }

            if (++idx < Object.keys(updateObj).length)
                query += ", ";

        }

        return query;
    };

    buildUpdate(tblName, updateObj, whereObj) {

        let query =
            " UPDATE " + tblName +
            " SET ";

        let idx = 0;
        for (let k in updateObj) {
            try {
                if (updateObj[k] === null)
                    query += k + " = NULL ";
                else if (updateObj[k][0] === '\\')
                    query += k + " = " + updateObj[k].slice(1, updateObj[k].length);
                else
                    query += k + " = " + escape(updateObj[k]);

            } catch (err) {
                query += k + " = " + escape(updateObj[k]);

            }

            if (++idx < Object.keys(updateObj).length)
                query += ", ";

        }

        query += " WHERE 1 = 1 ";

        for (let k in whereObj) {
            try {
                if (whereObj[k][0] === '\\')
                    if (whereObj[k][1] === '\\')
                        query += " AND " + k + " " + whereObj[k].slice(2, whereObj[k].length);
                    else
                        query += " AND " + k + " = " + whereObj[k].slice(1, whereObj[k].length);
                else
                    query += " AND " + k + " = " + escape(whereObj[k]);

            } catch (err) {
                query += " AND " + k + " = " + escape(whereObj[k]);

            }
        }
        return query;
    };

    buildDelete(tblName, whereObj) {

        let query =
            " DELETE FROM " + tblName +
            " WHERE 1 = 1 ";

        for (let k in whereObj) {
            try {
                if (whereObj[k][0] === '\\')
                    if (whereObj[k][1] === '\\')
                        query += " AND " + k + " " + whereObj[k].slice(2, whereObj[k].length);
                    else
                        query += " AND " + k + " = " + whereObj[k].slice(1, whereObj[k].length);
                else
                    query += " AND " + k + " = " + escape(whereObj[k]);

            } catch (err) {
                query += " AND " + k + " = " + escape(whereObj[k]);

            }
        }

        return query;
    };

    buildSelect(tblName, whereObj, selectColumnTxt = "") {

        let query =
            " SELECT " + (selectColumnTxt === "" ? "*" : selectColumnTxt) +
            " FROM " + tblName + " t " +
            " WHERE 1 = 1 ";

        if (whereObj !== undefined)
            for (let k in whereObj) {
                try{
                    if (whereObj[k][0] === '\\')
                        if (whereObj[k][1] === '\\') {
                            console.log("whereObj[k][0] : " + whereObj[k][0], "whereObj[k][1] : " + whereObj[k][1]);
                            query += " AND " + k + " " + whereObj[k].slice(2, whereObj[k].length);
                        }
                        else
                            query += " AND " + k + " = " + whereObj[k].slice(1, whereObj[k].length);
                    else
                        query += " AND " + k + " = " + escape(whereObj[k]);

                } catch (err) {
                    query += " AND " + k + " = " + escape(whereObj[k]);

                }
            }

        query += ' ';

        return query;
    };

    buildCount(tblName, whereObj, addQuery) {

        let query =
            " SELECT COUNT(*) as count " +
            " FROM " + tblName + " t " +
            " WHERE 1 = 1 ";

        for (let k in whereObj) {
            try {
                if (whereObj[k][0] === '\\')
                    if (whereObj[k][1] === '\\')
                        query += " AND " + k + " " + whereObj[k].slice(2, whereObj[k].length);
                    else
                        query += " AND " + k + " = " + whereObj[k].slice(1, whereObj[k].length);
                else
                    query += " AND " + k + " = " + escape(whereObj[k]);

            } catch (err) {
                query += " AND " + k + " = " + escape(whereObj[k]);

            }
        }

        query += ' ';

        if (addQuery !== undefined)
            query += addQuery;

        return query;
    };

    appendLeftJoin(input, tblName, mapperList, appendColumnList, originColumnList, selectText) {
        let query = " SELECT ";

        if (originColumnList.length > 0) {
            for (let item of originColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", i." + item;

        }

        if (appendColumnList.length > 0) {
            for (let item of appendColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", j." + item;
        }

        query = query.replace(",", "");

        query += selectText;

        query +=
            " FROM ( " + input + " ) i " +
            " LEFT JOIN " + tblName + " j ON ";

        for (let item of mapperList)
            try {
                if (item[0] === '\\')
                    query += item.slice(1, item.length) + " AND ";
                else
                    query += " j." + item + " = i." + item + " AND ";

            } catch (err) {
                query += " j." + item + " = i." + item + " AND ";

            }

        return query.slice(0, query.length - 4);
    };

    appendInnerJoin(input, tblName, mapperList, appendColumnList, originColumnList, selectText) {
        let query = " SELECT ";

        if (originColumnList.length > 0) {
            for (let item of originColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", i." + item;

        }

        if (appendColumnList.length > 0) {
            for (let item of appendColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", j." + item;
        }

        query = query.replace(",", "");

        query += selectText;

        query +=
            " FROM ( " + input + " ) i " +
            " INNER JOIN " + tblName + " j ON ";

        for (let item of mapperList)
            try {
                if (item[0] === '\\')
                    query += item.slice(1, item.length) + " AND ";
                else
                    query += " j." + item + " = i." + item + " AND ";

            } catch (err) {
                query += " j." + item + " = i." + item + " AND ";

            }

        return query.slice(0, query.length - 4);
    };

    appendJoinTxt(input, tblName, joinType, appendTxt, appendColumnList, originColumnList, selectText) {
        let query = " SELECT ";

        if (originColumnList.length > 0) {
            for (let item of originColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", i." + item;

        }

        if (appendColumnList.length > 0) {
            for (let item of appendColumnList)
                if (item[0] === "\\")
                    query += ", " + item.slice(1, item.length);
                else
                    query += ", j." + item;
        }

        query = query.replace(",", "");

        query += " " + selectText;

        query +=
            " FROM ( " + input + " ) i " +
            joinType + " JOIN " + tblName + " j ON " + appendTxt;

        return query;
    };

    appendCount(input) {
        let query =
            " SELECT COUNT(*) as count " +
            " FROM ( " + input + " ) i ";

        return query;
    };

    txtPageLimit(page, itemCountPerPage) {
        return " LIMIT " + (page - 1) * itemCountPerPage + ", " + itemCountPerPage;
    };

    txtLikeEscape(columnList, keyword) {
        let txt = "";

        for (let item of columnList)
            txt += item + " LIKE " + escape('%' + keyword + '%') + " OR ";

        return txt.slice(0, txt.length - 4);
    };

    getDecryptValue(usePrefix, value, alias) {
        let valueString;

        if (value[0] === "\\")
            valueString = value.slice(1, value.length);
        else
            valueString = escape(value);

        return (usePrefix ? "\\" : "") + "CONVERT(AES_DECRYPT(UNHEX(" + valueString + "), '" + sql.escape(AES_SECRET) + "') USING UTF8)" + (alias === "" ? "" : " as " + alias);
        // return (usePrefix ? "\\" : "") + valueString + (alias === "" ? "" : " as " + alias);

    };

    getEncryptValue(usePrefix, value, alias) {
        let valueString;

        if (value[0] === "\\")
            valueString = value;
        else
            valueString = escape(value);

        return (usePrefix ? "\\" : "") + "HEX(AES_ENCRYPT( " + valueString + ", '" + sql.escape(AES_SECRET) + "' ))" + (alias === "" ? "" : " as " + alias);

    };

    inList(list) {
        return "\\\\IN ( " + escape(list) + " ) ";

    };

    notInList(list) {
        return "\\\\NOT IN ( " + escape(list) + " ) ";

    };

    between(startDate, endDate) {
        return "\\\\BETWEEN " + startDate + " AND " + endDate;
    }

}

module.exports = {
    QBClass: new QueryBuilder(),
};

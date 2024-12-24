const sql = require("mysql");

exports.insertUpdateCustomerData = function (tableName, customerData) {
    let query = `INSERT INTO ${tableName} ( customer_name, customer_contact, post_code, agreement_status, agree_date)`;

    query += ` VALUES (${sql.escape(customerData.customer_name)}, ${sql.escape(customerData.customer_contact)}, ${sql.escape(customerData.post_code)}, ${customerData.agreement_status}, ${customerData.agree_date})`;

    query += `
    ON DUPLICATE KEY UPDATE
        customer_name = VALUES(customer_name),
        customer_contact = VALUES(customer_contact),
        post_code = VALUES(post_code),
        agreement_status = VALUES(agreement_status),
        agree_date = VALUES(agree_date)
    `;

    return query;
}

exports.insertUpdateRepairData = function (tableName, repairData) {
    let query = `INSERT INTO ${tableName} ( customer_seq, symptom_seq, category_seq, post_code, repair_memo, repair_price, repair_cost)`;

    query += ` 
    SELECT  
         i.customer_seq, 
         ${sql.escape(repairData.symptom_seq)}, 
         ${sql.escape((repairData.category_seq))}, 
         ${sql.escape(repairData.post_code)}, 
         ${sql.escape(sql.escape(repairData.repair_memo))}, 
         ${sql.escape(repairData.repair_price)}, 
         ${sql.escape(repairData.repair_cost)} 
    FROM t_nf_customer as i
    WHERE i.customer_contact = ${sql.escape(repairData.customer_contact)}
 `;

    // query += `
    //     ON DUPLICATE KEY UPDATE
    //         repair_seq = VALUES(repair_seq),
    //         customer_seq = VALUES(customer_seq),
    //         symptom_seq = VALUES(symptom_seq),
    //         category_seq = VALUES(category_seq),
    //         post_code = VALUES(post_code),
    //         repair_memo = VALUES(repair_memo),
    //         repair_cost = VALUES(repair_cost)
    //     `;

    return query;
}

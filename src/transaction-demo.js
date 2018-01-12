const MySqlConnection = require('./index');
const mysql = new MySqlConnection({
  //debug: true,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'demo'
});

const tableName = 'demo_user';

async function doIt() {
  try {
    const transactionResult = await mysql.transaction(async () => {
      console.log('transaction-demo.js: inside transaction');
      await mysql.deleteAll(tableName);

      const id1 = await mysql.insert(tableName, {
        username: 'batman',
        password: 'robin'
      });
      console.log('id1 =', id1);

      const id2 = await mysql.insert(tableName, {
        username: 'joker',
        password: 'penguin'
      });
      console.log('id2 =', id2);

      let result = await mysql.getAll(tableName);
      console.log('all =', result);

      result = await mysql.updateById(tableName, id1, {
        username: 'batman',
        password: 'wayne'
      });

      result = await mysql.getById(tableName, id1);
      console.log('just id1 after update =', result);

      const sql = `select * from ${tableName} where password = ?`;
      result = await mysql.query(sql, 'wayne');
      console.log('query result =', result);

      await mysql.deleteById(tableName, id1);

      result = await mysql.getAll(tableName);
      console.log('after deleting id1 =', result);

      return result;
    });
    console.log(
      'transaction-demo.js: result from transaction =',
      transactionResult
    );
  } catch (e) {
    console.error(e);
  } finally {
    mysql.disconnect();
  }
}

doIt();

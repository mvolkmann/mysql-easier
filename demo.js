const MySqlConnection = require('./index');
const mysql = new MySqlConnection({
  //debug: true,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'demo'
});

async function doIt() {
  await mysql.deleteAll('user');

  const id1 = await mysql.insert(
    'user', {username: 'batman', password: 'robin'});
  console.log('id1 =', id1);

  const id2 = await mysql.insert(
    'user', {username: 'joker', password: 'penguin'});
  console.log('id2 =', id2);

  let result = await mysql.getAll('user');
  console.log('all =', result);

  result = await mysql.updateById(
    'user', id1, {username: 'batman', password: 'wayne'});

  result = await mysql.getById('user', id1);
  console.log('just id1 after update =', result);

  const sql = 'select * from user where password = ?';
  result = await mysql.query(sql, 'wayne');
  console.log('query result =', result);

  await mysql.deleteById('user', id1);

  result = await mysql.getAll('user');
  //const result = await mysql.query('select * from user');
  console.log('after deleting id1 =', result);

  mysql.disconnect();
}

doIt();

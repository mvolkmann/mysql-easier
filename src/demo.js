const mySqlEasier = require('./index');
mySqlEasier.configure({
  //debug: true,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'demo'
});

async function doIt() {
  const tableName = 'demo_user';

  try {
    const conn = await mySqlEasier.getConnection();
    await conn.deleteAll(tableName);

    const id1 = await conn.insert(tableName, {
      username: 'batman',
      password: 'robin',
      company: 'Wayne Enterprises',
      active: true,
      small: 1
    });
    console.log('id1 =', id1);

    const id2 = await conn.insert(tableName, {
      username: 'joker',
      password: 'penguin'
    });
    console.log('id2 =', id2);

    let result = await conn.getAll(tableName);
    console.log('all =', result);

    const [batman] = result;
    console.log('batman.small =', batman.small.readInt8());

    result = await conn.updateById(tableName, id1, {
      username: 'batman',
      password: 'wayne'
    });

    result = await conn.getById(tableName, id1);
    console.log('just id1 after update =', result);

    const sql = `select * from ${tableName} where password = ?`;
    result = await conn.query(sql, 'wayne');
    console.log('query result =', result);

    await conn.deleteById(tableName, id1);

    result = await conn.getAll(tableName);
    console.log('after deleting id1 =', result);
    await conn.done();
  } catch (e) {
    console.error(e);
  } finally {
    await mySqlEasier.endPool();
  }
}

doIt();

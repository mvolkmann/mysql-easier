const SqlUtil = require('./sql-util');

describe('sql', () => {
  const tableName = 'test_table';
  let sqlUtil;

  beforeEach(() => {
    sqlUtil = new SqlUtil(false);
  });

  test('constructor', () => {
    expect(sqlUtil.debug).toBe(false);
  });

  test('deleteAll', () => {
    const expected = `delete from ${tableName}`;
    expect(sqlUtil.deleteAll(tableName)).toBe(expected);
  });

  test('deleteById', () => {
    const expected = `delete from ${tableName} where id=?`;
    expect(sqlUtil.deleteById(tableName, 7)).toBe(expected);
  });

  test('getAll', () => {
    const expected = `select * from ${tableName}`;
    expect(sqlUtil.getAll(tableName)).toBe(expected);
  });

  test('getById', () => {
    const expected = `select * from ${tableName} where id=?`;
    expect(sqlUtil.getById(tableName, 7)).toBe(expected);
  });

  test('insert', () => {
    const obj = {foo: true, bar: 7, baz: 'qux'};
    const expected = `insert into ${tableName} (foo, bar, baz) values(?, ?, ?)`;
    expect(sqlUtil.insert(tableName, obj)).toEqual(expected);
  });

  test('upsert', () => {
    const obj = {foo: true, bar: 7, baz: 'qux'};
    const expected =
      `insert into ${tableName} (foo, bar, baz) values(?, ?, ?) ` +
      'on duplicate key ' +
      'update id = last_insert_id(id), foo = ?, bar = ?, baz = ?';
    expect(sqlUtil.upsert(tableName, obj)).toEqual(expected);
  });
});

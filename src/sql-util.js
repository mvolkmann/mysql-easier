class SqlUtil {
  constructor(debug) {
    this.debug = debug;
  }

  log(...msg) {
    if (this.debug) console.log('mysql-easier:', msg.join(' '));
  }

  /**
   * Deletes all records from a given table.
   */
  deleteAll(tableName) {
    const sql = `delete from ${tableName}`;
    this.log('deleteAll: sql =', sql);
    return sql;
  }

  /**
   * Deletes a record from a given table by id.
   * This requires the table to have a column named "id".
   */
  deleteById(tableName /*, id*/) {
    const sql = `delete from ${tableName} where id=?`;
    this.log('deleteById: sql =', sql);
    return sql;
  }

  /**
   * Gets all records from a given table.
   */
  getAll(tableName) {
    const sql = `select * from ${tableName}`;
    this.log('getAll: sql =', sql);
    return sql;
  }

  /**
   * Gets a record from a given table by id.
   * This requires the table to have a column named "id".
   */
  getById(tableName /*, id*/) {
    const sql = `select * from ${tableName} where id=?`;
    this.log('getById: sql =', sql);
    return sql;
  }

  /**
   * Inserts a record into a given table.
   * The keys of obj are column names
   * and their values are the values to insert.
   */
  insert(tableName, obj) {
    const keys = Object.keys(obj);
    const values = keys.map(key => obj[key]);
    const cols = keys.join(', ');
    const placeholders = values.map(() => '?').join(', ');
    const sql = `insert into ${tableName} (${cols}) values(${placeholders})`;

    this.log('insert: sql =', sql);
    return sql;
  }

  /**
   * Updates a record in a given table by id.
   * This requires the table to have a column named "id".
   */
  updateById(tableName, id, obj) {
    const sets = Object.keys(obj).map(key => {
      const v = obj[key];
      const value = typeof v === 'string' ? `'${v}'` : v;
      return `${key}=${value}`;
    });
    const sql = `update ${tableName} set ${sets} where id=?`;
    this.log('updateById: sql =', sql);
    return sql;
  }

  /**
   * Inserts a record in a given table if it doesn't already exist.
   * Updates it if it does exist.
   */
  upsert(tableName, obj) {
    const keys = Object.keys(obj);
    const values = keys.map(key => obj[key]);
    const cols = keys.join(', ');
    const placeholders = values.map(() => '?').join(', ');
    const part1 = `insert into ${tableName} (${cols}) values(${placeholders})`;

    const assignments = keys.map(key => key + ' = ?').join(', ');
    const part2 =
      'on duplicate key update id = last_insert_id(id), ' + assignments;
    const sql = part1 + ' ' + part2;

    this.log('upsert: sql =', sql);
    return sql;
  }
}

module.exports = SqlUtil;

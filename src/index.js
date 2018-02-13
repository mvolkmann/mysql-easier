const mysql = require('mysql');
const MySqlConnection = require('./mysql-connection');
const MySqlPool = require('./mysql-pool');

class MySqlEasier {
  constructor() {
    this.globalPool = null;
  }

  configure(config) {
    this.globalPool = this.createPool(config);
  }

  createConnection(config) {
    return new MySqlConnection(mysql.createConnection(config), config);
  }

  createPool(config) {
    return new MySqlPool(config);
  }

  endPool() {
    if (!this.globalPool) return Promise.reject('Pool not configured');
    const poolToEnd = this.globalPool;
    this.globalPool = null;
    return poolToEnd.end();
  }

  getConnection() {
    if (!this.globalPool) return Promise.reject('Pool not configured');
    return this.globalPool.getConnection();
  }

}

module.exports = new MySqlEasier();
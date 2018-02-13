const mysql = require('mysql');
const MySqlConnection = require('./mysql-connection');

class MySqlPool {
  constructor(config) {
    this.config = config;
    this.pool = new mysql.createPool(config);
  }

  end() {
    if (!this.pool) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.pool.end(err => {
        this.pool = null;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getConnection() {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        reject('Pool has ended. New connections are not available.');
      } else {
        this.pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(new MySqlConnection(connection));
          }
        });
      }
    });
  }
}

module.exports = MySqlPool;
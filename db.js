// db.js
// const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'thesis_barksound'
// });

// db.connect((err) => {
//   if (err) {
//     console.error("error connecting to mysql: ", err)
//   } else {
//     console.log("connected to mysql")
//   }
// });

// module.exports = db;

const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'sql6.freemysqlhosting.net',
  user: 'sql6683531',
  password: 'K2CM97kUHR',
  database: 'sql6683531'
});

db.connect((err) => {
  if (err) {
    console.error("error connecting to mysql: ", err)
  } else {
    console.log("connected to mysql")
  }
});

module.exports = db;
 


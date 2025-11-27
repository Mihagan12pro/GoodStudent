import pool from '../db.js';
async function test() {
    try {
    const res = await pool.query('SELECT * FROM groups;');
    console.log(res.rows);
    pool.end();
    } catch (err) {
    console.error(err);
    }
}
test();

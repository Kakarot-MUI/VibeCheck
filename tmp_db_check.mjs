import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgres://vibecheck_db_7pxk_user:Z7I1pQo3I5fU22iK8Q8z0o2s7o8p9o9@dpg-cvibecheck-eqip-a.oregon-postgres.render.com/vibecheck_db_7pxk?ssl=true",
});

async function check() {
  try {
    const res = await pool.query('SELECT email, name, username FROM profiles');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

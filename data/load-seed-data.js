const client = require('../lib/client');
// import our seed data:
const snowboards = require('./snowboards.js');
const brands = require('./brands.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );

    await Promise.all(
      brands.map(brand => {
        return client.query(`
                    INSERT INTO brands (name)
                    VALUES ($1);
                `,
        [brand.name]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      snowboards.map(snowboard => {
        return client.query(`
                    INSERT INTO snowboards (snowboard_name, flex, is_all_mountain, brand_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [snowboard.snowboard_name, snowboard.flex, snowboard.is_all_mountain, snowboard.brand_id, user.id]);
      })
    );
    
    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}

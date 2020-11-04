const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/snowboards', async(req, res) => {
  try {
    const data = await client.query('SELECT * from snowboards');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/snowboards/:id', async(req, res) => {
  try {
    const snowboardId = req.params.id;
  
    const data = await client.query(`
        SELECT * FROM snowboards 
        WHERE snowboards.id=$1 
    `, [snowboardId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/snowboards/', async(req, res) => {
  try {
    const newName = req.body.snowboard_name;
    const newFlex = req.body.flex;
    const newIsAllMountain = req.body.is_all_mountain;
    const newBrand = req.body.brand;
    const newOwnerId = req.body.owner_id;
  
    const data = await client.query(`
    INSERT INTO snowboards (snowboard_name, flex, is_all_mountain, brand, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,  [newName, newFlex, newIsAllMountain, newBrand, newOwnerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/snowboards/:id', async(req, res) => {
  try {
    const newName = req.body.snowboard_name;
    const newFlex = req.body.flex;
    const newIsAllMountain = req.body.is_all_mountain;
    const newBrand = req.body.brand;
    const newOwnerId = req.body.owner_id;
  
    const data = await client.query(`
    UPDATE snowboards
    SET snowboard_name = $1,
    flex = $2,
    is_all_mountain = $3,
    brand = $4,
    owner_id = $5
    WHERE snowboards.id = $6
    RETURNING *
  `,  [newName, newFlex, newIsAllMountain, newBrand, newOwnerId, req.params.id]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete('/snowboards/:id', async(req, res) => {
  try {
    const snowboardId = req.params.id;
  
    const data = await client.query(`
    DELETE from snowboards
    WHERE snowboards.id=$1
    RETURNING *
  `,  [snowboardId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;

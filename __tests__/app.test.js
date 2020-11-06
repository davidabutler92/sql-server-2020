require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    // let token;

    beforeAll(async(done) => {
      execSync('npm run setup-db');

      client.connect();

      // const signInData = await fakeRequest(app)
      //   .post('/auth/signup')
      //   .send({
      //     email: 'jon@user.com',
      //     password: '1234'
      //   });

      // token = signInData.body.token;

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    test('returns snowboards', async() => {
      const expectation = [
        {
          'id': 2,
          'snowboard_name': 'Brew C2',
          'flex': 7,
          'is_all_mountain': true,
          'brand': 'Lib Tech',
          'owner_id': 1
        },
        {
          'id': 3,
          'snowboard_name': 'T. Rice Orca',
          'flex': 7,
          'is_all_mountain': true,
          'brand': 'Lib Tech',
          'owner_id': 1
        },
        {
          'id': 1,
          'snowboard_name': 'Defenders of Awesome',
          'flex': 5,
          'is_all_mountain': true,
          'brand': 'Capita',
          'owner_id': 1
        },
        {
          'id': 4,
          'snowboard_name': 'Boss',
          'flex': 4,
          'is_all_mountain': false,
          'brand': 'Bataleon',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/snowboards')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single snowboard', async() => {
      const expectation = {
        id: 1,
        snowboard_name: 'Defenders of Awesome',
        flex: 5,
        is_all_mountain: true,
        owner_id: 1,
        brand: 'Capita',
      };

      const data = await fakeRequest(app)
        .get('/snowboards/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('add snowboard to the database and returns it', async() => {
      const expectation = {
        id: 5,
        snowboard_name: 'Process',
        flex: 2,
        is_all_mountain: true,
        owner_id: 1,
        brand_id: 2,
      };
  
      const data = await fakeRequest(app)
        .post('/snowboards')
        .send({
          snowboard_name: 'Process',
          flex: 2,
          is_all_mountain: true,
          owner_id: 1,
          brand_id: 2,
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      const allSnowboards = await fakeRequest(app)
        .get('/snowboards')
        .expect('Content-Type', /json/)
        .expect(200);
  

      expect(data.body).toEqual(expectation);
      expect(allSnowboards.body.length).toEqual(5);
    });

    test('return updated snowboard', async() => {
      const expectation = {
        id: 1,
        snowboard_name: 'Wake',
        flex: 2,
        is_all_mountain: true,
        brand_id: 1,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .put('/snowboards/1')
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('removes a snowboard and then returns it', async() => {
      const expectation = {
        id: 4,
        snowboard_name: 'Boss',
        flex: 4,
        is_all_mountain: false,
        owner_id: 1,
        brand_id: 4,
      };
  
      const data = await fakeRequest(app)
        .delete('/snowboards/4')
        .send({
          id: 4,
          snowboard_name: 'Boss',
          flex: 4,
          is_all_mountain: false,
          owner_id: 1,
          brand_id: 4,
        })
        .expect('Content-Type', /json/)
        .expect(200);
  
      const allSnowboards = await fakeRequest(app)
        .get('/snowboards/')
        .expect('Content-Type', /json/)
        .expect(200);
  

      expect(data.body).toEqual(expectation);
      expect(allSnowboards.body.length).toEqual(4);
    });
    
  });
});

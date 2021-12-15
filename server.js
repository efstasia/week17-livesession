import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import techFundings from './data/tech_fundings.json';

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:

const mongoUrl =
  process.env.MONGO_URL || 'mongodb://localhost/project-mongo-api-live';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

const Company = mongoose.model('Company', {
  index: Number,
  company: String,
  website: String,
  region: String,
  vertical: String,
  FundingAmountUSD: Number,
  fundingStage: String,
  fundingDate: String,
});

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    // the seed isn't necessary when creating a new database. seed it once and then only run npm run dev
    await Company.deleteMany({});

    // loop through all of the companies in our json file
    techFundings.forEach(item => {
      // for each of the company, we're creating new data that will be shown. new company for each item in the data
      const newCompany = new Company(item);
      newCompany.save();
    });
  };
  seedDatabase();
}

// // NEW MODEL - pascal case and singular - first argument is the name of the model, second argument is an object about the user, tell then what kind of data you're expecting in the object (number, string boolean etc)
// const User = mongoose.model('User', {
//   name: String, // could also be mongoose.types.String
//   age: Number,
// });

// const newUser = new User({
//   // this means we're gonna create a new user from our model
//   name: 'Sofia',
//   age: 28,
// });

// const newUser2 = new User({
//   // this means we're gonna create a new user from our model
//   name: 'Elton',
//   age: 11,
// });

// if (process.env.RESET_DB) {
//   // RESET_DB is just the name that describes the action
//   //if we're using this database, it will delete the users and then save user 1 and 2
//   // User.deleteMany({}); //deleteMany is a method from mongoose. deleteMany should only be used when setting everything up
//   // this means saving to the database

//   const seedDatabase = async () => {
//     await User.deleteMany({});    // wait for the users to be cleared, then show the saved users. if we want to clear our database we could just skip adding the newUser.save() etc

//     newUser.save();
//     newUser2.save(); // save() is a method and a function, the parentesis shows us that this is invoked and running
//   };
//   seedDatabase();
// }

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world');
});

// get all the companies
app.get('/companies', async (req, res) => {
  // res.json(techFundings); this only works for getting the data from the json file and NOT the database
  console.log(req.query);

  let companies = await Company.find(req.query).limit(10); // you put what you wanna find inside the curly brackets, this automatically filters our list with whatever we add, like companies?fundingStage=Seed. the limit() limits our search result to how many we add in the parentheses
  //.find() gets all the companies, but can be used to filter when adding something in the parentheses. the find() will take some time, so we have to make sure it waits with async/await. wait for the find action to be finished BEFORE running the res.json(companies to show all companies that match

  // gt = greater than, lt = lower than
  if (req.query.FundingAmountUSD) {
    // if it's that query (fundingAmountUSD)
    const companiesByAmount = await Company.find().gt(
      'fundingAmountUSD',
      req.query.FundingAmountUSD
    ); // this shows the companies with funding GREATER THAN what we add in the url
    companies = companiesByAmount;
  }

  res.json(companies);
});

// get one company based on iD
app.get('/companies/id/:id', async (req, res) => {
  // this will only be triggered IF we have an ID, otherwise we'll just see the companies
  const { id } = req.params;

  try {
    const companyById = await Company.findById(id);
    if (companyById) {
      res.json(companyById);
    } else {
      res.status(404).json({ error: 'Company not found' });
    }
  } catch (err) {
    res.status(400).json({ error: 'invalid id' });
  }
});

// alternative to findById = findOne()

// app.post('/companies', {req, res} => {
//   const newCompany = new Company({info})
// })

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

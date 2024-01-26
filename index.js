/*
  Terminar Coding Train -> github, gitignore, publish website

  TODO next:

    * estilizar poster/square -> templates
      * maybe permitir refazer design, mas manter random
    * guardar poster final na galeria
    * loading animation
*/

const OpenAI = require("openai");
const express = require("express");
const Datastore = require("nedb");

const fetch = require('node-fetch');
const html2canvas = require('html2canvas');
const fs = require('fs');

require("dotenv").config();

const APP = express();
const PORT = process.env.PORT;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

APP.listen(PORT, () => console.log(`server listen at ${PORT}`));
APP.use(express.static('public'));
APP.use(express.json({ limit: '50mb' }));

const database = new Datastore('database.db');
database.loadDatabase();
// const object = {};

APP.post("/keyword", async (req, res) => {
  let keyword_1 = req.body.keyword_1;
  let keyword_2 = req.body.keyword_2;
  console.log(keyword_1 + " " + keyword_2);
  let result = await run(keyword_1, keyword_2);
  res.status(result.code).json(result.msg);

  // object.keyword_1 = keyword_1;
  // object.keyword_2 = keyword_2;
  // object.msg = result.msg;

  //let keyword = req.params.keyword;
  //let result = await run(keyword);
  //res.status(result.code).json(result.msg);
});


const run = async (keyword_1 = "", keyword_2 = "") => {
  //const msg = `generate a short motivational quote using your own words about a theme of your choice using the word ${keyword} in it`;
  const msg = `Generate a short ironic demotivational quote using your own words about a theme of your choice (reveal the theme in the end like this: "Theme: your theme") using the words ${keyword_1} and ${keyword_2} in it. Maximum 20 words.`;
  try {
    let response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: msg }],
      temperature: 0.8,
      max_tokens: 256,
    });
    const res = response.choices[0].message.content;
    return {
      code: 200,
      msg: res
    };
  } catch (err) {
    console.error(err.message);
    return {
      code: 500,
      msg: null
    };
  }
}


// de alguma forma colocar keyword em tags
APP.post('/image', async (request, response) => {
  let theme = request.body.theme;
  //let theme_2 = request.body.keyword_1;
  //console.log(theme_1 + theme_2);

  const api_url = `http://api.pexels.com/v1/search?query=${theme}&per_page=25&page=1`;
  const options = {
    headers: {
      'Authorization': process.env.PEXELS_API_KEY,
    }
  }
  const fetch_response = await fetch(api_url, options);
  const json = await fetch_response.json();
  response.json(json);
});

APP.get('/db', (request, response) => {
  database.find({}).sort({ timestamp: -1 }).exec(function (err, data) {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

APP.post('/db', (request, response) => {
  let data = request.body.object;
  const timestamp = Date.now();
  data.timestamp = timestamp;

  var file_name = 'public/img_files/' + timestamp + '.txt';
  var file_content = data.image64;
  //console.log('data.image64: ' + file_content);

  var stream = fs.createWriteStream(file_name);
  stream.once('open', function () {
    stream.write(file_content);
    stream.end();
  });

  data.image64 = 'img_files/' + timestamp + '.txt';
  database.insert(data);
});
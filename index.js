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

APP.post("/keyword", async (req, res) => {
  let keyword_1 = req.body.keyword_1;
  let keyword_2 = req.body.keyword_2;
  console.log(keyword_1 + " " + keyword_2);
  let result = await run(keyword_1, keyword_2);
  res.status(result.code).json(result.msg);
});


const run = async (keyword_1 = "", keyword_2 = "") => {
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

APP.post('/image', async (request, response) => {
  let theme = request.body.theme;

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

  var stream = fs.createWriteStream(file_name);
  stream.once('open', function () {
    stream.write(file_content);
    stream.end();
  });

  data.image64 = 'img_files/' + timestamp + '.txt';
  database.insert(data);
});
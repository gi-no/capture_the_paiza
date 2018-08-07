const fs = require("fs");
const parseJSON = require('json-parse-async');
const puppeteer = require('puppeteer');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const electron = require("electron");
const {app} = electron;

const {USER_ID, PASSWORD} = require(app.getPath('userData') + '/config.json');

const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

async function login(user_id, password) {
  const page = await global.browser.newPage();
  await page.goto('https://paiza.jp/login')
  await page.type('#email',   USER_ID);
  await page.type('#password',PASSWORD);
  const submit_button = await page.$('#regist_btn');
  await submit_button.click();
  await page.close();
}

async function take_screen_shot(url, filename) {
  const page = await global.browser.newPage();
  page.setViewport({width: 1200, height: 800})

  await page.goto(url);
  await page.waitForNavigation({waitUntil:'networkidle2', timeout: 30000})
            .catch(e => console.log('timeout exceed. proceed to next operation'))
  await page.screenshot({path: global.result_dir + '/' + filename, fullPage: true});
  return page.close()
};

async function diff(filename) {
  var result_file_path = global.result_dir + '/' + filename;
  var origin_file_path = app.getPath('userData') + '/origin/' + filename;
  if(!fs.existsSync(result_file_path) || !fs.existsSync(origin_file_path)) {
    return;// new Promise((resolve, reject) => {resolve();});
  }
  var img1 = await PNG.sync.read(fs.readFileSync(result_file_path));
  var img2 = await PNG.sync.read(fs.readFileSync(origin_file_path));
  var diff = await new PNG({width: img1.width, height: img1.height});
  await pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0.1});
  return diff.pack().pipe(fs.createWriteStream(app.getPath('userData') + '/diff/' + filename));
}

module.exports.take_all_screen_shot = take_all_screen_shot;
function take_all_screen_shot() {
  (async () => {
    var date = new Date();
    global.result_dir = app.getPath('userData') + '/test_result/' + date.getTime();
    fs.mkdirSync(global.result_dir);
    global.browser = await puppeteer.launch();

    await login(USER_ID, PASSWORD);

    parseJSON(fs.readFileSync(app.getPath('userData') + '/url_list.json', 'utf8'))
      .then(async (content) => {
        var url_info_list = content.url_info_list

        for(const url_info of url_info_list) {
          await take_screen_shot(url_info.url, url_info.filename);
        }

        await global.browser.close();

        await imagemin([global.result_dir+ '/*.png'], global.result_dir + '/', {
          plugins: [
            imageminPngquant()
          ]
        });

        await Promise.all( url_info_list.map(async (url_info) => {
          diff(url_info.filename);
        }));

        console.log('all done');
      })
      .catch(function (err) {
         console.log('promise was rejected:', err);
      });
  })();
}

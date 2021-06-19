var express = require('express');
var axios = require('axios');
var router = express.Router();

const sheeturl = "https://spreadsheets.google.com/feeds/cells/1G84y_BUtrae7raC9K8Bz30rPanzdYIwMDRZNn_9xgeo/1/public/full?alt=json";



/* GET home page. */
router.get('/', async function(req, res, next) {
  const portfolios = await setPortFolios();

  res.render('pages/index', {portfolios});
});

function setPortFolios() {
  return new Promise((resolve, reject) => {
    getPortfolData()
    .then((res) => {
      const entries = res.feed.entry;
      const portfoliObject = getObjectField(entries);
      let previousRow = 2;
      let temp = {};
      let portfolioData = []; 
      for (let index = 0; index < entries.length; index++) {
        const element = entries[index];
        const currentRow = parseInt(element.gs$cell.row);
        if (currentRow > 1) {
          if (currentRow === previousRow) {
            temp[portfoliObject[element.gs$cell.col]] = element.gs$cell.$t;
          }
          if (currentRow > previousRow) {
            portfolioData.push(temp);
            temp = {};
            temp[portfoliObject[element.gs$cell.col]] = element.gs$cell.$t;
            previousRow++;
          }
        }
      }
      portfolioData.push(temp);
      resolve(portfolioData);
    })
    .catch((error) => {
      console.log("get portfolio error: ", error);
      reject(error);
    });
  })
}


function getPortfolData() {
  return new Promise((resolve, reject) => {
    axios.get(sheeturl).then(res => {
      resolve(res.data);
    }).catch(error => {
      reject(error);
    })
  });
}

function getObjectField(entryData) {
  let temp = {};
  entryData.map((item) => {
    if (item.gs$cell.row === "1") {
      temp[item.gs$cell.col] = item.gs$cell.inputValue;
    }
  });
  return temp;
}

module.exports = router;

const axios = require("axios");
const xml2js = require("xml2js");
let url = "https://cal.syoboi.jp/db.php?Command=TitleLookup&Fields=Title&TID=";

async function get(TID) {
  try {
    let data = await axios.get(url + TID);
    let xml = data.data;
    let result = await xml2js.parseStringPromise(xml);
    let Items = result?.TitleLookupResponse?.TitleItems?.[0]?.TitleItem?.[0];
    if (!Items) {
      return { error: "Title not found" };
    }
    let id = Items.$.id;
    let title = Items.Title[0];
    let response = { title: title, id: id };
    return response;
  } catch (error) {
    console.log(error);
    return { error: "Failed to fetch data" };
  }
}
module.exports = get;
/*
テスト用コード
(async () => {
  let TID = ;
  let result = await get(TID);
  if (result.error) {
    console.log(result.error);
    return;
  }
  console.log(result);
})();
*/

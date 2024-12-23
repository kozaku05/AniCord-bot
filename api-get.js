const axios = require("axios");
const xml2js = require("xml2js");
const url = "https://cal.syoboi.jp/db.php?Command=TitleLookup&Fields=Title&TID=";

async function get(TID) {
  try {
    const data = await axios.get(url + TID);
    const xml = data.data;
    const result = await xml2js.parseStringPromise(xml);
    const Items = result?.TitleLookupResponse?.TitleItems?.[0]?.TitleItem?.[0];
    if (!Items) {
      return { error: "タイトルが見つかりませんでした" };
    }
    const id = Items.$.id;
    const title = Items.Title[0];
    const response = { title: title, id: id };
    return response;
  } catch (error) {
    console.log(error);
    return { error: "通信エラー" };
  }
}
module.exports = get;

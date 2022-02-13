const axios = require("axios");
const cheerio = require("cheerio");
const { StatusCodes } = require("http-status-codes");
const { ngQuery, puncts } = require("../config/conf");

function cleanText(text) {
  const texts = text
    .toLowerCase()
    .replace(/[\r\n]/g, " ")
    .split(" ");
  let cleaned = "";
  for (let t of texts) {
    cleaned += t.replace(puncts, "").trim();
  }
  return cleaned;
}

function bigram(text) {
  const s = new Set();
  for (let i = 0; i < text.length - 1; ++i) {
    s.add(text.slice(i, i + 2));
  }
  return s;
}

function getSimilarity(tx, ty) {
  // Sørensen–Dice coefficient
  // 2 | x n y | / (|x| + |y|) => 2nt / (nx + ny)
  const b1 = bigram(cleanText(tx));
  const b2 = bigram(cleanText(ty));
  let nt = 0;
  b1.forEach((t) => {
    if (b2.has(t)) nt++;
  });
  return (2 * nt) / (b1.size + b2.size);
}

const extractData = ($, elem, query) => {
  // image url, description, price range,
  const data = {};
  // extract img-url
  $(elem)
    .find($(".img-c img"))
    .each((i, img) => {
      if (data.imgUrl) return;
      const attr = $(img).attr("data-src");
      if (attr.includes("product")) {
        data.imgUrl = attr;
      }
    });
  // extract product description
  $(elem)
    .find($(".name"))
    .each((i, desc) => {
      if (data.desc) return;
      data.desc = $(desc).text().trim();
    });
  // extract product description
  $(elem)
    .find($(".prc"))
    .each((i, price) => {
      if (data.price) return;
      data.price = $(price).text().replace(/[₦,]/g, "").trim();
    });
  data.score = data.desc && data.price ? getSimilarity(query, data.desc) : 0;
  return data;
};

function getQ(query) {
  return query.trim().toLowerCase().replace(" ", "+");
}

async function ngFind(query) {
  const q = getQ(query);
  const resp = await axios.get(`${ngQuery}${q}`);
  const $ = cheerio.load(resp.data);
  const items = [];
  $(".core").each((i, elem) => {
    const data = extractData($, elem, query);
    if (data.desc && data.price) {
      items.push(data);
    }
  });
  return items;
}

const find = async (query, mode) => {
  const modes = { ng: ngFind };
  return await modes[mode](query);
};

const processData = (items, threshold) => {
  const error = Error("No items found");
  if (!items.length) throw error;
  let mostSimilar;
  do {
    mostSimilar = items.filter(({ score }) => score > threshold);
    threshold -= 0.1;
  } while (!mostSimilar.length );
  if (!mostSimilar.length) throw error;

  // sort most similar items by similarity score, take top 5
  mostSimilar = mostSimilar
    .slice(0, 5)
    .filter((x) => !isNaN(Number(x.price)))
    .sort((a, b) => b.score - a.score);
  const fmtPrice = (prc) =>
    prc.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const prices = mostSimilar.map((item) => Number(item.price));
  const average = fmtPrice(prices.reduce((a, b) => a + b) / mostSimilar.length);
  const max = fmtPrice(Math.max(...prices));
  const min = fmtPrice(Math.min(...prices));
  const rep = mostSimilar[0];
  const res = {
    max,
    min,
    average,
    imgUrl: rep.imgUrl,
    desc: rep.desc,
    score: rep.score,
    smImgUrl: rep.imgUrl.replace("300x300", "200x200"),
  };
  return res;
};

const search = async (query, threshold, mode = "ng") => {
  const items = await find(query, mode);
  return processData(items, threshold);
};

const getThreshold = (th, defaultTh = 0.35) => {
  if (!th) return defaultTh;
  th = Number(th);
  if (isNaN(th) || th < 0 || th > 0.9) return defaultTh;
  return th;
};

exports.findProduct = async (req, res) => {
  const { query, threshold } = req.body;
  if (!query) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, data: null, msg: "Invalid search query." });
  }
  try {
    const data = await search(query, getThreshold(threshold));
    res.status(StatusCodes.OK).json({ success: true, data, msg: "Found" });
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, data: null, msg: "An error occurred." });
  }
};

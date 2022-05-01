const axios = require("axios");
const { Robin } = require("@ziord/robin");
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

const extractData = (robin, elem, query) => {
  // image url, description, price range,
  const data = {};
  // *extract img-url using path
  const path = robin.path(elem, true);
  try {
      const img = path.queryOne("//*[@class='img-c']/following::img");
      data.imgUrl = img.getAttributeNode("data-src").value;
  } catch (e) {
      data.imgUrl = "";
  }
  // *extract product description using path
  try {
      data.desc = path.queryOne("//*[@class='name']/text()").value.trim();
  } catch (e) {
      data.desc = "";
  }
  // *extract product description using path
  try {
      data.price = path.queryOne("//*[@class='prc']/text()").value.replace(/[₦,]/g, "").trim();
  } catch (e) {
      data.price = "";
  }
  data.score = data.desc && data.price ? getSimilarity(query, data.desc) : 0;
  return data;
};

function getQ(query) {
  return query.trim().toLowerCase().replace(" ", "+");
}

async function ngFind(query) {
    const q = getQ(query);
    const resp = await axios.get(`${ngQuery}${q}`);
    const robin = new Robin(resp.data, "HTML");
    // console.log(robin.prettify());
    const items = [];
    robin.path(robin.getRoot()).queryAll("//*[@class='core']").forEach((elem) => {
        const data = extractData(robin, elem, query);
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

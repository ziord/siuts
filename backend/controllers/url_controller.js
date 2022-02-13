const { StatusCodes } = require("http-status-codes");
const { getPartialUrl } = require("../config/conf");
const Url = require("../models/url_model");

//
const PUNCT = /['!"$\\'()\*;<>@\[\\\]\^`{|}']/g;
const SPACES = [" ", "\t", "\n", "\r", "\v"];
const TAKEN_ALIAS = [
  "about",
  "create",
  "shorten",
  "scrape",
  "scraper",
  "shortener",
  "search",
  "resolve",
];

function getUrlAlias() {
  let alias = "";
  const alnum =
    "-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_~";
  const max = alnum.length - 1;
  for (let i = 0; i < 6; ++i) {
    alias += alnum[Math.floor(Math.random() * max) + 1];
  }
  return alias;
}

function getOkResponse(data, msg, req) {
  // todo: remove `origin`
  return { success: true, origin: req ? getPartialUrl(req) : null, data, msg };
}

function getErrResponse(msg) {
  return { success: false, data: null, msg };
}

exports.validateAlias = (req, res, next) => {
  const { alias } = req.body;
  const ret = getErrResponse("Invalid alias provided.");
  if (!alias) {
    ret.msg = "Alias not provided";
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  }
  if (alias.length < 6) {
    ret.msg = "Alias must be six characters or more.";
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  } else if (SPACES.some((e) => alias.trim().includes(e))) {
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  } else if (TAKEN_ALIAS.includes(alias.toLowerCase())) {
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  } else if (alias.replace(PUNCT) !== alias) {
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  }
  next();
};

exports.validateBody = (req, res, next) => {
  const { url, alias } = req.body;
  const ret = getErrResponse("Invalid url.");

  if (SPACES.some((e) => url.trim().includes(e))) {
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  } else if (url.replace(PUNCT) !== url) {
    return res.status(StatusCodes.BAD_REQUEST).json(ret);
  } else if (alias) {
    if (alias.length < 6) {
      ret.msg = "Alias must be six characters or more.";
      return res.status(StatusCodes.BAD_REQUEST).json(ret);
    } else if (SPACES.some((e) => alias.trim().includes(e))) {
      ret.msg = "Invalid alias provided.";
      return res.status(StatusCodes.BAD_REQUEST).json(ret);
    } else if (TAKEN_ALIAS.includes(alias.toLowerCase())) {
      ret.msg = "Alias already taken.";
      return res.status(StatusCodes.BAD_REQUEST).json(ret);
    } else if (alias.replace(PUNCT) !== alias) {
      ret.msg = "Invalid alias provided.";
      return res.status(StatusCodes.BAD_REQUEST).json(ret);
    }
  }
  next();
};

class AliasError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

function generateUniqueAlias(alias, res, trials = 0) {
  if (alias) {
    alias = alias.trim();
    return Url.findOne({ alias })
      .exec()
      .then((doc) => {
        if (doc) {
          throw new AliasError("The alias already exists.");
        }
        return alias;
      });
  } else {
    alias = getUrlAlias();
    return Url.findOne({ alias })
      .exec()
      .then((doc) => {
        if (!doc) return alias;
        if (trials >= 4) {
          throw new AliasError(
            "Could not generate a unique alias. Please try again later."
          );
        }
        return generateUniqueAlias(null, res, trials + 1);
      });
  }
}

exports.shortenUrl = (req, res) => {
  let { url, alias } = req.body;
  generateUniqueAlias(alias, res)
    .then((uAlias) => {
      Url.create({ full: url.trim(), alias: uAlias })
        .then(() => {
          return res.json(getOkResponse(uAlias, "Ok", req));
        })
        .catch((e) => {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(getErrResponse("An error occurred."));
        });
    })
    .catch((err) => {
      if (err instanceof AliasError) {
        return res.json(getErrResponse(err.message));
      } else {
        console.log(err);
      }
    });
};

exports.resolveUrl = (req, res) => {
  const { alias } = req.body;
  Url.findOne({ alias })
    .exec()
    .then((doc) => {
      if (!doc) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(getErrResponse("Alias not found"));
      }
      res.status(StatusCodes.OK).json(getOkResponse(doc.full, "Alias found"));
    })
    .catch(() => {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(getErrResponse("An error occurred"));
    });
};

export const makeFetch = async (endpoint, method, payload, timeout = 10000) => {
  const abortCtrl = new AbortController();
  const id = setTimeout(() => abortCtrl.abort(), timeout);
  return fetch(endpoint, {
    signal: abortCtrl.signal,
    method,
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  }).then((resp) => {
    clearTimeout(id);
    return resp.json();
  });
};

export const eUrl = () => {
  if (window.location.origin.includes("localhost")) {
    return "http://localhost:5000";
  }
  return "";
};

export const getLocCode = async () => {
  const key = "siuts-loc-code";
  let code = window.localStorage.getItem(key);
  if (!code) {
    try {
      const resp = await fetch("https://api.ipregistry.co/?key=tryout");
      const res = await resp.json();
      window.localStorage.setItem(key, res.location.country.code);
    } catch {
      return null;
    }
  } else {
    return new Promise((resolve, reject) => resolve(code));
  }
};

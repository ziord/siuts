import { useState } from "react";
import SearchInput from "./SearchInput";
import { eUrl, makeFetch } from "../utils";

const Home = () => {
  const [includeCustom, setIncludeCustom] = useState(true);
  const [btnText, setBtnText] = useState("Shorten");
  const [errMsg, setErrMsg] = useState(null);
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleClick = () => {
    if (btnText === "Shorten") {
      // make api request
      const body = { url, alias };
      if (!url) {
        setErrMsg("Please enter a valid url.");
        return;
      }
      const endpoint = `${eUrl()}/api/url/shorten`;
      const origin = window.location.origin.toString();
      makeFetch(endpoint, "POST", body)
        .then((res) => {
          if (!res.success) {
            setErrMsg(res.msg);
            return;
          }
          setIncludeCustom(false);
          setBtnText("Copy");
          setUrl(`${origin}/${res.data}`);
          setErrMsg("");
          setDisabled(true);
        })
        .catch((e) => {
          setErrMsg("An internal error occurred. Please try again.");
        });
    } else {
      // copy short
      window.navigator.clipboard
        .writeText(url)
        .then(() => alert("Copied!"))
        .catch(() => alert("Failed to copy. Please try manually."));
    }
  };

  return (
    <SearchInput
      includeCustom={includeCustom}
      headerLabel="URL Shortener"
      customLabel="custom:/"
      btnText={btnText}
      headerValue={url}
      headerValueCb={(e) => setUrl(e.target.value)}
      headerPlaceholderValue="Enter a url"
      customValue={alias}
      customValueCb={(e) => setAlias(e.target.value)}
      customPlaceholderValue="Use an optional cusom alias"
      errorMsg={errMsg}
      disabled={disabled}
      handleClick={handleClick}
    />
  );
};

export default Home;

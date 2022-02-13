import { useState } from "react";
import { makeFetch } from "../utils";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import { eUrl, getLocCode } from "../utils";

const Search = () => {
  const [errMsg, setErrMsg] = useState(null);
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const endpoint = `${eUrl()}/api/product/search`;
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (!query) {
      setErrMsg("Please enter a valid query.");
      return;
    }
    getLocCode().then((code) => {
      if (code && code !== "NG") {
        setDisabled(true);
        alert("This service is currently not available in your country");
        return false;
      }
      setIsLoading(true);
      makeFetch(endpoint, "POST", { query, threshold })
        .then((res) => {
          setIsLoading(false);
          if (!res.success) {
            setErrMsg(res.msg);
            return;
          } else {
            setErrMsg("");
            navigate("/product", { state: { data: res.data, query } });
          }
        })
        .catch((e) => {
          setIsLoading(false);
          setErrMsg("An error occurred. Please try again later.");
        });
    });
  };

  return (
    <SearchInput
      includeCustom={true}
      headerLabel="Product Pricer"
      customLabel="Threshold"
      btnText="Search"
      disabled={disabled}
      headerValue={query}
      customValue={threshold}
      headerValueCb={(e) => setQuery(e.target.value)}
      customValueCb={(e) => setThreshold(e.target.value)}
      errorMsg={errMsg}
      headerPlaceholderValue="Enter a product name or description"
      customPlaceholderValue="Use an optional accuracy threshold"
      isLoading={isLoading}
      handleClick={handleClick}
    />
  );
};

export default Search;

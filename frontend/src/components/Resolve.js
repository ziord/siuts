import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eUrl, makeFetch } from "../utils";
import Loading from "./Loading";

const Resolve = () => {
  const { alias } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const endpoint = `${eUrl()}/api/url/resolve`;
    makeFetch(endpoint, "POST", { alias })
      .then((res) => {
        if (!res.success) {
          navigate("/404");
          return;
        }
        window.location.href = res.data;
      })
      .catch((e) => {
        navigate("/");
      });
  }, [alias, navigate]);
  return <Loading />;
};

export default Resolve;

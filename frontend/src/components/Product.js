import { Link, useLocation } from "react-router-dom";

const Product = () => {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="centralize notfound">
        <h2>Wow such empty!</h2>
        <p>
          <Link
            to="/"
            style={{
              color: "azure",
              textDecoration: "none",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Back to home page
          </Link>
        </p>
      </div>
    );
  }
  const { data, query } = state;
  return (
    <div className="product-item">
      <div className="product-image">
        <img src={data.imgUrl} alt="product" />
        <img src={data.smImgUrl} alt="product" />
      </div>
      <div className="product-info">
        <div className="product-title">
          <h3>{query}</h3>
        </div>
        <div className="product-desc">
          <p>
            On average, you can get this around <span>₦{data.average}</span>
          </p>
          {data.min !== data.max && (
            <p>
              However, it ranges from <span>₦{data.min}</span> -{" "}
              <span>₦{data.max}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;

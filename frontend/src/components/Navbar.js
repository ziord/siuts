import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [navbarCls, setNavbarCls] = useState("navbar");
  const [toggle, setToggle] = useState(false);

  const handleClick = () => {
    setToggle(!toggle);
    if (navbarCls === "navbar") {
      setNavbarCls(`${navbarCls} responsive`);
    } else {
      setNavbarCls("navbar");
    }
  };

  return (
    <header>
      <nav className={navbarCls}>
        <h4>SIUTS - Simple Utility Services</h4>
        <ul className="links">
          <li>
            <a href="/">Shorten</a>
          </li>
          <li>
            <Link to="/search">Search</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li className="toggle-icon" onClick={handleClick}>
            {!toggle && (
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            )}
            {toggle && (
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

import ghLogo from "../GitHub-Mark-32px.png";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-items">
        <div>
          &copy; 2022 <a href="https://github.com/ziord">ziord</a>
        </div>
        <div>
          <a href="https://github.com/ziord/siuts">
            <img src={ghLogo} alt="github logo" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;

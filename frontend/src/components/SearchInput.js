import Loading from "./Loading";

const SearchInput = ({
  includeCustom,
  headerLabel,
  customLabel,
  btnText,
  headerValue,
  customValue,
  headerValueCb,
  customValueCb,
  headerPlaceholderValue,
  customPlaceholderValue,
  errorMsg,
  disabled,
  isLoading,
  handleClick,
}) => {
  if (isLoading) {
    return <Loading />
  }
  return (
    <div className="search-container">
      <div className="search">
        <div>
          <h3>{headerLabel}</h3>
          <input
            type="text"
            id="header-input"
            value={headerValue}
            onChange={headerValueCb}
            disabled={disabled}
            placeholder={headerPlaceholderValue}
            autoFocus
          />
        </div>
        {includeCustom && (
          <div className="custom">
            <label>{customLabel}</label>
            <input
              type="text"
              value={customValue}
              onChange={customValueCb}
              disabled={disabled}
              placeholder={customPlaceholderValue}
            />
          </div>
        )}
        <div>
          <button onClick={handleClick}>{btnText}</button>
        </div>
        {errorMsg && (
          <div className="error">
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

SearchInput.defaultProps = {
  includeCustom: false,
  btnText: "Go",
  errorMsg: null,
  disabled: false,
  headerPlaceholderValue: "",
  customPlaceholderValue: "",
  isLoading: false,
};

export default SearchInput;

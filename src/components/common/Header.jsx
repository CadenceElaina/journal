import ThemeSelector from "./ThemeSelector";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Journal</h1>
        <ThemeSelector />
      </div>
    </header>
  );
};

export default Header;

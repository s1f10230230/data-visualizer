import React from "react";

interface HeaderProps {
  title: string;
  description: string;
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="header fade-in">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
};

export default Header;

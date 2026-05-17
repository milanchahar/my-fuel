import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RiLogoutBoxLine } from "react-icons/ri";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);
  const isAdmin = user?.role === "admin";

  const links = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/analytics", label: "Analytics" },
        { to: "/admin", label: "Admin" },
      ]
    : [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/place-order", label: "Place Order" },
        { to: "/history", label: "History" },
      ];

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="my">My</span><span className="fuels">Fuels</span>
      </div>

      <div className="nav-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
        ))}
      </div>

      <button
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="nav-links-mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="nav-right">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <span className="logout-text">Logout</span>
          <RiLogoutBoxLine style={{ fontSize: 18 }} className="logout-icon" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

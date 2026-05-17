import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="my">My</span><span className="fuels">Fuels</span>
      </div>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        {isAdmin ? (
          <>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/place-order">Place Order</NavLink>
            <NavLink to="/history">History</NavLink>
          </>
        )}
      </div>
      <div className="nav-right">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;

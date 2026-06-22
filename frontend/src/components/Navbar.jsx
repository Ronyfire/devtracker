import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className="navbar navbar-dark bg-primary sticky-top">
      <div className="container-xl d-flex align-items-center justify-content-between w-100">
        <Link to="/" className="navbar-brand fw-bold mb-0 text-white text-decoration-none">
          DevTracker
        </Link>

        {user && (
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-outline-light btn-sm dropdown-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="true"
            >
              <span className="d-none d-sm-inline">{user.email}</span>
              <i className="bi bi-person-circle d-sm-none" aria-label={user.email} />
            </button>
            <ul
              className={`dropdown-menu${open ? " show" : ""}`}
              style={{ position: "absolute", right: 0, left: "auto", top: "100%", marginTop: "2px" }}
            >
              <li>
                <span className="dropdown-item-text small text-muted d-none d-sm-block">
                  {user.email}
                </span>
              </li>
              <li><hr className="dropdown-divider d-none d-sm-block" /></li>
              <li>
                <Link
                  className="dropdown-item"
                  to="/profile"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

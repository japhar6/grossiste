import React from "react";
import Swal from "sweetalert2";

function Header() {
  const handleLogout = () => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Vous allez être déconnecté !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, déconnecter !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");  
        window.location.href = "/";   
      }
    });
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <div className="notification-icon">
                  <i className="fas fa-bell fa-lg"></i>
                  <span className="badge">3</span>
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Mariusrandrianarison@example.com</a>
              </li>
              <li
                className="nav-item"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                <i className="fa-solid fa-right-from-bracket notification-icon mt-2 text-success"></i>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

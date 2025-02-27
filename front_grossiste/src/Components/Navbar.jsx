import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Pusher from 'pusher-js';
import '../Styles/Navbar.css'

function Header() {
  const [email, setEmail] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [notifications, setNotifications] = useState([]); // Stocke les notifications

  // Configurer Pusher
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      window.location.href = "/";
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    // Pusher configuration
    const pusher = new Pusher('a8a7ea8b3c692c9f97f7', {
      cluster: 'mt1',
    });

    const channel = pusher.subscribe('admin-channel');
    
    // Écoute les notifications en temps réel
    channel.bind('transfert-en-attente', (data) => {
      // Ajoute la nouvelle notification à l'état
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        data.message,
      ]);
    });

    return () => {
      clearInterval(intervalId);
      pusher.unsubscribe('admin-channel'); // Désabonne lors du démontage du composant
    };
  }, []);

  // Gérer la déconnexion
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
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <div className="notification-icon">
                  <i className="fas fa-bell fa-lg"></i>
                  {notifications.length > 0 && (
                    <span className="notification-badge">{notifications.length}</span>
                  )}
                </div>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/profil">{email}</a>
              </li>
              <li
                className="nav-item"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                <i className="fa-solid fa-right-from-bracket notification-icon mt-2 text-success"></i>
              </li>
              <span className="heure">{currentTime}</span>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

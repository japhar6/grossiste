import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Pusher from 'pusher-js';
import { useNavigate } from "react-router-dom"; // Importer le hook useNavigate
import '../Styles/Navbar.css';
import audio from '../assets/mixkit-happy-bells-notification-937.wav';


function Header() {
  const [email, setEmail] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // Hook pour naviguer

  // Préparer l'audio pour la notification
  const notificationSound = new Audio(audio);

  // Configurer Pusher
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      window.location.href = "/"; // Redirige si aucun email trouvé
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
      setNotifications((prevNotifications) => {
        // Si la notification existe déjà, ne pas l'ajouter
        if (!prevNotifications.some(notif => notif.message === data.message)) {
          notificationSound.play();
          return [...prevNotifications, data.message];
        }
        return prevNotifications;
      });
    });
  
    // Écoute les notifications de type "nouvelle-notification"
    channel.bind('remise', (data) => {
      setNotifications((prevNotifications) => {
        // Si la notification existe déjà, ne pas l'ajouter
        if (!prevNotifications.some(notif => notif.message === data.message)) {
          notificationSound.play();
          return [...prevNotifications, data.message];
        }
        return prevNotifications;
      });
    });

    return () => {
      clearInterval(intervalId);
      pusher.unsubscribe('admin-channel');
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

  // Naviguer vers la page des notifications
  const goToNotifications = () => {
    navigate('/notif'); 
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
                <div className="notification-icon" onClick={goToNotifications}>
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

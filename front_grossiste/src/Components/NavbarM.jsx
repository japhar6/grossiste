import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import '../Styles/Navbar.css';
import Pusher from 'pusher-js';
import audionotif from '../assets/mixkit-positive-notification-951.wav';
function Header() {
    const [email, setEmail] = useState("");
    const [currentTime, setCurrentTime] = useState("");
 const [isLoggingOut, setIsLoggingOut] = useState(false);
     const [notifications, setNotifications] = useState([]);
    const notificationSoundCom = new Audio(audionotif);
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


    return () => clearInterval(intervalId);
    }, []);
     useEffect(() => {
          // Initialiser Pusher avec ta clé et cluster
          const pusher = new Pusher('a8a7ea8b3c692c9f97f7', {
               cluster: 'mt1',
             });
      
          // S'abonner au canal spécifique (dans ce cas "caissier-channel")
          const channel = pusher.subscribe('magasinier-channel');
      
          channel.bind('nouveau-paiment', (data) => {
            // Recevoir et traiter les données de la nouvelle commande
            setNotifications((prevNotifications) => {
              if (!prevNotifications.some(notif => notif.message === data.message)) {
                notificationSoundCom.play();
                return [...prevNotifications, data.message];
              }
              return prevNotifications;
            });
      
          });
          
      
          // Nettoyer la connexion à Pusher lorsque le composant est démonté
          return () => {
            pusher.unsubscribe('magasinier-channel');
          };
        }, []);

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
            setIsLoggingOut(true); // 🔥 Active le loading
            setTimeout(() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }, 2000); // Simule un délai de 2 secondes
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
       
              
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/profilm">{email}</a>
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
      {isLoggingOut && (
  <div className="logout-overlay">
    <div className="loading-spinner"></div>
    <p>Déconnexion en cours...</p>
  </div>
)}
    </header>
  );
}

export default Header;

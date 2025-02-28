import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { useNavigate } from 'react-router-dom'; 
import "../Styles/Notification.css"; // N'oublie pas d'ajouter les nouveaux styles ici

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();  

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await axios.get('/api/notif/notifications'); 
        setNotifications(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications', error);
      }
    };

    loadNotifications();
  }, []);  

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notif/notif/mark-as-read/${notificationId}`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, lue: true } : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification', error);
    }
  };
  const handleNotificationClick = (notification) => {
    // Vérifier le type de la notification pour la redirection
    if (notification.type === 'transfert-en-attente') {
      navigate(`/transfertAdmin`); // Rediriger vers la page de transfert admin
    } else if (notification.type === 'remise') {
      // Stocker l'`idClient` dans le localStorage
      localStorage.setItem('idClient', notification.idClient);
  
      // Rediriger vers la page Client
      navigate(`/Client`);
    } else {
      navigate(`/default-page`); // Une page par défaut au cas où
    }
  };
  
  

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="notifications-page">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <p>Aucune notification.</p>
            ) : (
              <ul>
              {notifications.map((notification) => (
  <li
    key={notification._id}
    className={`notification-item ${notification.lue ? "lue" : "non-lue"}`}
    onClick={() => {
      markAsRead(notification._id);
      handleNotificationClick(notification);
    }}
    style={{ cursor: 'pointer' }}
  >
    <div className="notification-content">
      <div className="notification-message">
        {/* Diviser le message et styliser le nom du client */}
        {notification.message.split("client").map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="client-name">{notification.clientNom}</span>}
            {part}
          </React.Fragment>
        ))}
      </div>
      {!notification.lue && <span className="badge">Non lue</span>}
    </div>
  </li>
))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default NotificationsPage;

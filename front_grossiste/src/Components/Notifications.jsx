import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { useNavigate } from 'react-router-dom';
import "../Styles/Notification.css"; // N'oublie pas d'ajouter les nouveaux styles ici
import Swal from "sweetalert2";
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [dureeLimite, setDureeLimite] = useState("");
  const handleDureeChange = (e) => {
    setDureeLimite(e.target.value); // Assure-toi de bien récupérer la durée
  };
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await axios.get('/api/notif/notifications');

        // Trier les notifications par date de création (du plus récent au plus ancien)
        const sortedNotifications = response.data.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(sortedNotifications);
        console.log("Notifications triées :", sortedNotifications);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications', error);
      }
    };

    loadNotifications();
  }, []);
  const extractReferenceFacture = (message) => {
    // Utilisation d'une expression régulière pour extraire la référence de facture
    const regex = /Facture:\s*([A-Za-z0-9\-]+)/;
    const match = message.match(regex);
    return match ? match[1] : null;  // Retourne la référence de facture ou null si non trouvée
  };
  


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

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notif/supprimer/${notificationId}`);  // Envoi de la requête pour supprimer la notification
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)  // Retirer la notification supprimée de l'état
      );
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification', error);
    }
  };

  const handleNotificationClick = (notification) => {
    const referenceFacture = extractReferenceFacture(notification.message);

    if (notification.type === 'transfert-en-attente') {
      navigate(`/transfertAdmin`); // Rediriger vers la page de transfert admin
    } else if (notification.type === 'remise') {
      // Stocker l'`idClient` dans le localStorage
      if (referenceFacture) {
    // Stocker la référence dans le localStorage
    localStorage.setItem('referenceFacture', referenceFacture);
// Vérifier que la référence est bien stockée dans localStorage
console.log("Référence Facture stockée dans localStorage : ", localStorage.getItem('referenceFacture'));

      // Rediriger vers la page Client
      navigate(`/modifcmd`);}
    }

    else if (notification.type === 'rupture_stock') {

      // Rediriger vers la page Client
      navigate(`/achat`);
    }
    else if (notification.type === 'besoin-transfert') {

      // Rediriger vers la page Client
      navigate(`/transfertAdmin`);
    }
    else if (notification.type === 'credit') {
      // Récupérer le message complet de la notification
      const message = notification.message; // message contient déjà le nom du client
    
      // Extraire le nom du client du message
      const clientNom = message.match(/Le client (.*?) demande/); // Cela extrait le nom du client
    
      if (clientNom && clientNom[1]) {
        // Si un nom est trouvé dans le message
        Swal.fire({
          title: 'Valider la demande de crédit',
          html: `
            <p>Voulez-vous valider cette demande de paiement à crédit pour ${clientNom ? clientNom[1] : 'Nom introuvable'} ?</p>
            <label for="creditDate">Date limite du crédit:</label>
            <input type="date" id="creditDate" class="swal2-input" />
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oui, valider',
          cancelButtonText: 'Annuler'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const creditDate = document.getElementById('creditDate').value; // Récupère la date entrée par l'admin
            
            if (!creditDate) {
              Swal.fire({
                title: 'Erreur',
                text: 'Veuillez entrer une date limite valide.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
              return;
            }
            
            try {
              console.log("Client ID:", notification.idClient);
              console.log("Date limite:", creditDate);
        
              // Appel à la route API pour modifier 'creerPar' à 'admin' et envoyer la date limite
              const response = await axios.post('/api/client/modifier-credit', {
                clientId: notification.idClient, // Assure-toi que notification contient clientId
                creditDate: creditDate // Envoie la date limite
              });
        
              if (response.status === 200) {
                Swal.fire({
                  title: 'Succès!',
                  text: 'Demande de crédit validée, le statut du client a été mis à jour et la notification envoyée au caissier.',
                  icon: 'success',
                  confirmButtonText: 'OK'
                });
                navigate(`/admin`);
              }
            } catch (error) {
              console.error('Erreur lors de la validation de la demande de crédit', error);
              Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue. Veuillez réessayer.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          }
        });
        
        
      } else {
        // Si le nom du client n'est pas trouvé dans le message
        Swal.fire({
          title: 'Erreur',
          text: 'Le nom du client n\'a pas pu être extrait.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
    
    

    else {
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
                className={`notification-item mt-3 ${notification.lue ? "lue" : "non-lue"
                  }`}
                onClick={() => {
                  markAsRead(notification._id);
                  handleNotificationClick(notification);
                }}
                style={{ cursor: "pointer" }}
              >
                    <div className="notification-content">
                    <div className="notification-message p-3">
                        {/* Diviser le message et styliser le nom du client */}
                        {notification.message.split("reference").map((part, index) => (
                          <React.Fragment key={index}>
                            {index > 0 && <span className="client-name">{notification.clientNom}</span>}
                            {part}
                          </React.Fragment>
                        ))}
                      </div>
                      {!notification.lue && <span className="badge">Non lue</span>}
                      {/* Ajout de la croix pour supprimer la notification */}
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();  // Empêcher la propagation de l'événement de clic sur le li
                          deleteNotification(notification._id);
                        }}
                      >
                        &#10005;
                      </button>
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

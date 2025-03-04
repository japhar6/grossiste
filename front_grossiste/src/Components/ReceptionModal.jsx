import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
const ReceptionModal = ({ show, handleClose, transfertId,entrepotSource, quantiteEnvoyee, produit, refreshHistorique }) => {

  const [quantiteReçue, setQuantiteReçue] = useState('');
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleSubmit = () => {
    // Afficher un SweetAlert pour confirmer l'action avant l'envoi de la requête
    Swal.fire({
      title: 'Le transfert est terminé ?',
      text: 'Acceptez vous la transfert ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, acceptez',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      setLoadingAction(true);
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, envoyer la requête
        axios.put(`/api/transfert/terminer/${transfertId}`, { quantiteReçue })
          .then(response => {
            setLoadingAction(false);
            Swal.fire({
              title: 'Succès !',
              text: response.data.message || 'Transfert reçu avec succès.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              refreshHistorique();
              handleClose();
              
            });
          })
          .catch(error => {
            setLoadingAction(false);
            console.error('Erreur lors de la réception du transfert:', error.response);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la réception du transfert.';
            Swal.fire({
              title: 'Erreur',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          });
      }
    });
  };

  return (
   
    
    <Modal show={show} onHide={handleClose} className="reception-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Réception de Transfert</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="modal-content">
          <p><strong>Produit :</strong> {produit?.nom || "N/A"}</p>
          <p><strong>Quantité envoyée :</strong> {quantiteEnvoyee}</p>
          <p><strong>Entrepôt source :</strong> {entrepotSource?.nom || "N/A"}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <button className="btn btn-primary" disabled={loadingAction} onClick={handleSubmit}>{loadingAction ? (
                <>
                  <span className="spinner-border " style={{ width: '2rem', height: '2rem' }}></span> Chargement...
                </>
              ) : (
                "Confirmer"
              )}</button>
        <button className="btn btn-secondary" onClick={handleClose}>Annuler</button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceptionModal;

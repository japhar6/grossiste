import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const ReceptionModal = ({ show, handleClose, transfertId, quantiteEnvoyee, refreshHistorique }) => {
  const [quantiteReçue, setQuantiteReçue] = useState(0);

  const handleSubmit = () => {
    if (quantiteReçue <= 0 || isNaN(quantiteReçue)) {
      toast.error("Veuillez entrer une quantité valide.");
      return;
    }

    axios.put(`/api/transfert/terminer/${transfertId}`, { quantiteReçue })
      .then(response => {
        toast.success('Transfert reçu avec succès.');
        refreshHistorique();
        handleClose();
      })
      .catch(error => {
        toast.error('Erreur lors de la réception du transfert.');
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Réception du Transfert</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Quantité envoyée : {quantiteEnvoyee}</p>
        <div>
          <label htmlFor="quantiteReçue">Quantité reçue :</label>
          <input
            type="number"
            id="quantiteReçue"
            value={quantiteReçue}
            onChange={(e) => setQuantiteReçue(parseFloat(e.target.value))}
            min="1"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-primary" onClick={handleSubmit}>Confirmer</button>
        <button className="btn btn-secondary" onClick={handleClose}>Annuler</button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceptionModal;

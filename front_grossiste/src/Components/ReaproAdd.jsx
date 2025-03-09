import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from '../api/axios';
import Swal from 'sweetalert2'; // Ensure you import SweetAlert2

const ReapproAddModal = ({ show, handleClose, handleSave }) => {
  const [montant, setMontant] = useState('');
  const [raison, setRaison] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!montant || !raison) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // Correcting axios post call
    axios.post('/api/reapro/add', { montant, raison })
      .then((response) => {
        // Displaying a success alert after the request
        Swal.fire({
          title: 'Succès',
          text: 'Réapprovisionnement ajouté avec succès',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        const newReappro = { montant, raison };
        handleSave(newReappro); // Handle the new reappro data
        setMontant('');
        setRaison('');
        handleClose();
      })
      .catch((error) => {
        // Handling errors if the API request fails
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue, veuillez réessayer',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un réapprovisionnement</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Montant</Form.Label>
            <Form.Control
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Entrez le montant"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Raison</Form.Label>
            <Form.Control
              type="text"
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              placeholder="Entrez la raison"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Enregistrer
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReapproAddModal;

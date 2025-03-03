import React, { useState } from 'react';
import { Modal as BootstrapModal, Button, Form,Spinner  } from 'react-bootstrap';

const AddCommissionModal = ({ isOpen, onClose, onAddCommission, commercialId }) => {
  const [commissionData, setCommissionData] = useState({
    commercialId: commercialId || '',
    typeCommission: '',
    montant: '',
    periode: '',
  });
  const [isLoading, setIsLoading] = useState(false); 

  const handleAddCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionData((prev) => ({ ...prev, [name]: value }));
  };

   const handleAddCommissionSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true); // Déclenche le chargement
    onAddCommission(commissionData)
      .then(() => {
        setIsLoading(false); // Termine le chargement après la soumission
        onClose(); // Ferme la modal
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de la commission:', error);
        setIsLoading(false); // Termine le chargement en cas d'erreur
      });
  };

  if (!isOpen) return null;

  return (
    <BootstrapModal show={isOpen} onHide={onClose} centered>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Ajouter une Commission</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Form onSubmit={handleAddCommissionSubmit}>
        <Form.Group controlId="formTypeCommission">
            <Form.Label>Type de Commission</Form.Label>
            <Form.Control
              as="select"
              name="typeCommission"
              value={commissionData.typeCommission}
              onChange={handleAddCommissionChange}
              required
            >
              <option value="">Sélectionnez un type</option>
              <option value="montantFixe">Montant Fixe</option>
              <option value="pourcentage">Pourcentage</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formMontant">
            <Form.Label>Montant</Form.Label>
            <Form.Control
              type="number"
              name="montant"
              placeholder="Montant"
              value={commissionData.montant}
              onChange={handleAddCommissionChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPeriode">
            <Form.Label>Période</Form.Label>
            <Form.Control
              as="select"
              name="periode"
              value={commissionData.periode}
              onChange={handleAddCommissionChange}
              required
            >
              <option value="">Sélectionnez une période</option>
              <option value="mensuel">Mensuel</option>
              <option value="hebdomadaire">Hebdomadaire</option>
            </Form.Control>
          </Form.Group>
          <Button 
            variant="primary" 
            type="submit" 
            style={{ padding: '5px 10px', fontSize: '14px' }}
            disabled={isLoading} // Désactive le bouton pendant le chargement
          >
            {isLoading ? (
              <Spinner animation="border" size="sm" /> // Affiche un spinner pendant le chargement
            ) : (
              'Ajouter Commission'
            )}
          </Button>
        </Form>
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button 
          variant="secondary" 
          onClick={onClose} 
          style={{ padding: '5px 10px', fontSize: '14px' }} // Style pour mobile
        >
          Fermer
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default AddCommissionModal;

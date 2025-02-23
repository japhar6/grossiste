import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../Styles/Modal.css';

const AddCommissionModal = ({ isOpen, onClose, onAddCommission, commercialId }) => {
  const [commissionData, setCommissionData] = useState({
    commercialId: commercialId || '', // Utiliser commercialId passé en props
    typeCommission: '',
    montant: '',
    periode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleAddCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCommissionSubmit = async (e) => {
    e.preventDefault();
    if (commissionData.montant <= 0) {
      Swal.fire('Erreur', 'Le montant doit être un nombre positif.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/commission/commissions/calculer', commissionData);
      Swal.fire('Succès', 'Commission ajoutée avec succès.', 'success');
      onAddCommission(commissionData); // Passer les données de commission à la fonction parent
      setCommissionData({
        commercialId: commercialId || '', // Réinitialiser commercialId
        typeCommission: '',
        montant: '',
        periode: '',
      });
      onClose(); // Fermer le modal après l'ajout
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commission:', error);
      Swal.fire('Erreur', 'Erreur lors de l\'ajout de la commission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ajouter une Commission</h2>
        <form onSubmit={handleAddCommissionSubmit}>
          <input
            type="text"
            name="typeCommission"
            placeholder="Type de Commission"
            value={commissionData.typeCommission}
            onChange={handleAddCommissionChange}
            required
          />
          <input
            type="number"
            name="montant"
            placeholder="Montant"
            value={commissionData.montant}
            onChange={handleAddCommissionChange}
            required
          />
          <input
            type="text"
            name="periode"
            placeholder="Période"
            value={commissionData.periode}
            onChange={handleAddCommissionChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Chargement...' : 'Ajouter Commission'}
          </button>
        </form>
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default AddCommissionModal;

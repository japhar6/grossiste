import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../Styles/Modal.css';

const Modal = ({ isOpen, onClose, ventes, commercialNom, commissions }) => {
  const [showAddCommissionModal, setShowAddCommissionModal] = useState(false);
  const [commissionData, setCommissionData] = useState({
    commercialId: '', // Fill with the commercial's ID
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
      setCommissionData({
        commercialId: '',
        typeCommission: '',
        montant: '',
        periode: '',
      });
      setShowAddCommissionModal(false);
      // Refresh data or update commissions state here if necessary
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
        <h2>Détails des Ventes de {commercialNom}</h2>

        {ventes.length > 0 ? (
          <table className="ventes-table">
            <thead>
              <tr>
                <th>Date de Vente</th>
                <th>Montant Total</th>
                <th>Produits Vendus</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((vente) => (
                <tr key={vente._id}>
                  <td>{new Date(vente.dateVente).toLocaleString()}</td>
                  <td>{vente.montantTotal} Ariary</td>
                  <td>
                    <ul>
                      {vente.produitsVendus.map((produit) => (
                        <li key={produit._id}>
                          {produit.quantite} x {produit.produitId.nom}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune vente trouvée pour ce commercial.</p>
        )}

        <h3>Commissions de {commercialNom}</h3>
        {commissions && commissions.length > 0 ? (
          <table className="commissions-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => (
                <tr key={commission._id}>
                  <td>{commission.periode}</td>
                  <td>{commission.typeCommission}</td>
                  <td>{commission.montant} Ariary</td>
                  <td>{commission.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune commission trouvée pour ce commercial.</p>
        )}

        <button onClick={() => setShowAddCommissionModal(true)}>Ajouter Commission</button>

        {showAddCommissionModal && (
          <div className="modal-overlay" onClick={() => setShowAddCommissionModal(false)}>
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
                  {loading ? 'Ajout en cours...' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => setShowAddCommissionModal(false)}>Fermer</button>
              </form>
            </div>
          </div>
        )}

        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;

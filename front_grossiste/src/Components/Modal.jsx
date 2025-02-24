import React, { useState } from 'react';
import '../Styles/Modal.css';
import AddCommissionModal from './AddcomModal';

const Modal = ({ isOpen, onClose, ventes, commercialNom, commissions, onAddCommission }) => {
  const [isAddCommissionOpen, setAddCommissionOpen] = useState(false);

  const handleAddCommission = (commissionData) => {
    onAddCommission(commissionData);
    setAddCommissionOpen(false); 
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Détails des Ventes de {commercialNom}</h2>

        {/* Afficher les ventes */}
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

        {/* Afficher les commissions */}
        <h3>Commissions de {commercialNom}</h3>
        {commissions && commissions.length > 0 ? (
  <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
    <table className="ventes-table">
      <thead>
        <tr>
          <th>Période</th>
          <th>Type</th>
          <th>Date</th>
          <th>Montant</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {commissions.map((commission) => (
          <tr key={commission._id}>
            <td>{commission.periode}</td>
            <td>{commission.typeCommission}</td>
            <td>{commission.dateCreation}</td>
            <td>{commission.montant} Ariary</td>
            <td>{commission.statut}</td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* Calcul du total des commissions */}
    <div className="total-commissions">
      <strong>Total des Commissions : </strong>
      {commissions.reduce((total, commission) => total + parseFloat(commission.montant), 0)} Ariary
    </div>
  </div>
) : (
  <p>Aucune commission trouvée pour ce commercial.</p>
)}


<div className="modal-footer">
  <button className="btn btn-primary" onClick={() => setAddCommissionOpen(true)}>Ajouter Commission</button>
  <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
</div>

        {/* Modal d'ajout de commission */}
        <AddCommissionModal 
          isOpen={isAddCommissionOpen} 
          onClose={() => setAddCommissionOpen(false)} 
          onAddCommission={handleAddCommission} 
          commercialId={ventes[0]?.commercialId} // Assurez-vous que commercialId est passé correctement
        />
      </div>
    </div>
  );
};

export default Modal;

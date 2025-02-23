import React, { useState } from 'react';
import '../Styles/Modal.css'; // Assure-toi d'avoir ce fichier pour les styles
import AddCommissionModal from './AddcomModal'; // Importer le modal d'ajout de commission

const Modal = ({ isOpen, onClose, ventes, commercialNom, commissions, onAddCommission }) => {
  const [isAddCommissionOpen, setAddCommissionOpen] = useState(false);

  const handleAddCommission = (commissionData) => {
    // Appeler la fonction pour ajouter la commission ici
    onAddCommission(commissionData);
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

        {/* Bouton pour ouvrir le modal d'ajout de commission */}
        <button onClick={() => setAddCommissionOpen(true)}>Ajouter Commission</button>

        <button onClick={onClose}>Fermer</button>

        {/* Modal d'ajout de commission */}
        <AddCommissionModal 
          isOpen={isAddCommissionOpen} 
          onClose={() => setAddCommissionOpen(false)} 
          onAddCommission={handleAddCommission} 
        />
      </div>
    </div>
  );
};

export default Modal;

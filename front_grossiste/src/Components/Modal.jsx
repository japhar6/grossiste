import React from 'react';
import '../Styles/Modal.css'; // Assure-toi d'avoir ce fichier pour les styles

const Modal = ({ isOpen, onClose, ventes,commercialNom  }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2>Détails des Ventes de {commercialNom}</h2> {/* Afficher le nom du commercial */}
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
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;

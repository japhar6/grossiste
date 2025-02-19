import React from 'react';
import '../Styles/Modal.css'; // Crée un fichier CSS pour le style du modal

const Modal = ({ isOpen, onClose, ventes }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Détails des Ventes</h2>
        {ventes.map((vente) => (
          <div key={vente._id}>
            <h4>Commande ID: {vente.commandeId}</h4>
            <p>Montant Total: {vente.montantTotal}</p>
            <p>Date de Vente: {new Date(vente.dateVente).toLocaleString()}</p>
            <h5>Produits Vendus:</h5>
            <ul>
              {vente.produitsVendus.map((produit) => (
                <li key={produit._id}>
                  {produit.quantite} x {produit.produitId.nom}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;

import React from 'react';
import Modal from 'react-modal';

const EditCommandeModal = ({ isOpen, onClose, updatedCommande, handlePriceChange, handleSaveChanges }) => {
  if (!updatedCommande) return null; // Empêche l'affichage si la commande n'est pas disponible

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Modifier Commande">
      <h2 className="fw-bold">Modifier la commande {updatedCommande.referenceFacture}</h2>
      <h4 className="text-primary">{updatedCommande.clientId?.nom}</h4>

      <form>
        {updatedCommande.produits && updatedCommande.produits.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nom du produit</th>
                <th>Unité</th>
                <th>Quantité</th>
                <th>Prix de vente</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {updatedCommande.produits.map((product, index) => (
                <tr key={index}>
                  <td>{product.produit.nom}</td>
                  <td>{product.unite.nom}</td>
                  <td>{product.quantite}</td>
                  <td>
                    <input
                      type="number"
                      value={product.prixdevente || ''} // S'assurer qu'il y a une valeur par défaut
                      className="form-control"
                      onChange={(e) => handlePriceChange(product.produit._id, product.unite._id, e.target.value)} // Passe l'id du produit et de l'unité
                    />
                  </td>
                  <td>{product.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucun produit trouvé dans la commande.</p>
        )}

        <button className="btn btn-secondary m-2 w-25 p-3" onClick={onClose}>
          Annuler
        </button>
        <button type="button" onClick={handleSaveChanges} className="btn btn-primary w-25 m-2 p-3">
          Enregistrer
        </button>
      </form>
    </Modal>
  );
};

export default EditCommandeModal;

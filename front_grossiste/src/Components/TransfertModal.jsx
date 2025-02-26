import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const TransfertModal = ({ show, handleClose, refreshHistorique, entrepotSource }) => {
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [entrepotDestination, setEntrepotDestination] = useState('');
  const [produit, setProduit] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');

  useEffect(() => {
    axios.get('/api/entrepot')
      .then(response => setEntrepots(response.data))
      .catch(() => toast.error("Erreur lors du chargement des entrepôts."));
  }, []);

  useEffect(() => {
    if (!entrepotSource) return;
    axios.get(`/api/stocks/stocks/${entrepotSource._id}`)
      .then(response => setStocks(response.data))
      .catch(() => toast.error("Erreur lors du chargement des stocks."));
  }, [entrepotSource]);

  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    setProduit(produitId);
    const selectedStock = stocks.find(stock => stock.produit._id === produitId);
    setPrixUnitaire(selectedStock ? selectedStock.prixUnitaire : '');
  };

  const handleQuantiteChange = (e) => {
    const value = e.target.value;
    if (value === '' || value < 0) {
      setQuantite(''); // Réinitialiser si la valeur est vide ou négative
    } else {
      setQuantite(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantiteNumber = parseInt(quantite, 10); // Convertir en nombre entier

    if (isNaN(quantiteNumber) || quantiteNumber <= 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'La quantité doit être un nombre valide supérieur à zéro.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    axios.post('/api/transfert/transfert', {
      entrepotSource: entrepotSource._id,
      entrepotDestination,
      produit,
      quantité: quantiteNumber, // Utiliser la quantité convertie
      prixUnitaire,
      statut: 'En attente',
    }).then(response => {
      toast.success(response.data.message);
      refreshHistorique();
      handleClose();
    }).catch((error) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors du transfert.';
      Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
  };

  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nouveau Transfert</h5>
            <button type="button" className="close" onClick={handleClose}>&times;</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Entrepôt Destination</label>
                <select className="form-control" value={entrepotDestination} onChange={(e) => setEntrepotDestination(e.target.value)}>
                  <option value="">Sélectionner</option>
                  {entrepots.filter(e => e._id !== entrepotSource?._id).map((e) => (
                    <option key={e._id} value={e._id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Produit</label>
                <select className="form-control" value={produit} onChange={handleProduitChange}>
                  <option value="">Sélectionner</option>
                  {stocks.map((s) => (
                    <option key={s.produit._id} value={s.produit._id}>{s.produit.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantité</label>
                <input
                  type="number"
                  value={quantite}
                  onChange={handleQuantiteChange} // Utiliser la nouvelle fonction ici
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransfertModal;

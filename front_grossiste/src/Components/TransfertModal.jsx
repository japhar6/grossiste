import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const TransfertModal = ({ show, handleClose, refreshHistorique, entrepotSource }) => {
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [entrepotDestination, setEntrepotDestination] = useState('');
  const [produit, setProduit] = useState(null);
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [unite1, setUnite1] = useState('');
  const [unite2, setUnite2] = useState('');
  const [quantiteConvertie, setQuantiteConvertie] = useState(0);

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
    const selectedStock = stocks.find(stock => stock.produit._id === produitId);
    
    if (selectedStock) {
      console.log("Produit sélectionné :", selectedStock.produit); // Vérifie si le produit est bien trouvé
      console.log("Unités disponibles :", selectedStock.produit.unites); // Vérifie les unités
  
      setProduit(selectedStock.produit);
      setPrixUnitaire(selectedStock.prixUnitaire);
      
      if (selectedStock.produit.unites.length > 0) {
        setUnite1(selectedStock.produit.unites[0].nom);
        
        // Trouver l’unité avec la plus grande conversion (plus petite unité)
        const smallestUnite = [...selectedStock.produit.unites].sort((a, b) => b.conversion - a.conversion)[0];
        setUnite2(smallestUnite.nom);
        
        performConversion(quantite, selectedStock.produit.unites[0].nom, smallestUnite.nom, selectedStock.produit.unites);
      } else {
        console.log("Aucune unité trouvée pour ce produit !");
        setUnite1('');
        setUnite2('');
      }
    }
  };
  

  const performConversion = (qte, u1, u2, unitesDisponibles) => {
    const conversionU1 = unitesDisponibles.find(u => u.nom === u1)?.conversion;
    const conversionU2 = unitesDisponibles.find(u => u.nom === u2)?.conversion;

    if (!conversionU1 || !conversionU2) return;

    const resultat = (qte * conversionU2) / conversionU1;
    setQuantiteConvertie(resultat);
  };

  const handleQuantiteChange = (e) => {
    const newQuantite = parseFloat(e.target.value) || 0;
    setQuantite(newQuantite);
    if (produit) {
      performConversion(newQuantite, unite1, unite2, produit.unites);
    }
  };

  const handleUnite1Change = (e) => {
    const newUnite1 = e.target.value;
    setUnite1(newUnite1);
    if (produit) {
      performConversion(quantite, newUnite1, unite2, produit.unites);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const quantiteNumber = parseFloat(quantiteConvertie); // S'assurer que c'est bien un nombre
  
    if (isNaN(quantiteNumber) || quantiteNumber <= 0) {
      Swal.fire({
        title: 'Erreur',
        text: 'La quantité doit être un nombre valide supérieur à zéro.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    // Log des données envoyées
    console.log("📤 Envoi des données :", {
      entrepotSource: entrepotSource._id,
      entrepotDestination,
      produit,
      quantité: quantiteNumber,
      prixUnitaire,
      statut: 'En attente'
    });
  
    axios.post('/api/transfert/transfert', {
      entrepotSource: entrepotSource._id,
      entrepotDestination,
      produit,
      quantité: quantiteNumber, // Utiliser la quantité convertie
      prixUnitaire,
      statut: 'En attente',
    }).then(response => {
      console.log("✅ Réponse du serveur :", response.data); // Log de la réponse du serveur
      toast.success(response.data.message);
  
      Swal.fire({
        title: 'Succès',
        text: 'Transfert effectué avec succès !',
        icon: 'success',
        confirmButtonText: 'OK'
      });
  
      refreshHistorique();
      handleClose();
    }).catch((error) => {
      console.error("❌ Erreur lors du transfert :", error.response?.data || error.message);
  
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
    <>
       <style>
        {`
       .convertisseur-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.convertisseur {
  display: flex;
  align-items: center;
  font-size: 14px; /* Taille de police par défaut */
  flex-wrap: wrap; /* Permet de revenir à la ligne sur les petits écrans */
}

.convertisseur span {
  margin: 0 5px;
  white-space: nowrap; /* Evite le retour à la ligne des éléments */
}

.quantite,
.quantite-convertie {
  font-weight: bold;
}

.unite {
  font-style: italic;
}

.equals {
  font-weight: bold;
  margin: 0 5px;
}

@media (max-width: 576px) {
  .convertisseur {
    font-size: 12px; /* Réduit la taille du texte pour les petits écrans */
    text-align: center; /* Centrer le texte dans les petits écrans */
  }

  .convertisseur-container {
    padding: 5px;
  }
}

        `}
      </style>
    <div className={`modal ${show ? 'd-block' : 'd-none'}`}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nouveau Transfert</h5>
            <button type="button" className="close" onClick={handleClose}>&times;</button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group">
                <label>Entrepôt Destination</label>
                <select className="form-control" value={entrepotDestination} onChange={(e) => setEntrepotDestination(e.target.value)}>
                  <option value="">Sélectionner</option>
                  {entrepots.filter(e => e._id !== entrepotSource?._id).map(e => (
                    <option key={e._id} value={e._id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Produit à transferer</label>
                <select className="form-control" onChange={handleProduitChange}>
                  <option value="">Sélectionner</option>
                  {stocks.map(s => (
                    <option key={s.produit._id} value={s.produit._id}>{s.produit.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantité à transferer</label>
                <input type="number" value={quantite} onChange={handleQuantiteChange} required />
              </div>

              <div className="form-group">
                <label>Unité Source</label>
                <select className="form-control" value={unite1} onChange={handleUnite1Change}>
                  {produit?.unites.map(u => (
                    <option key={u.nom} value={u.nom}>{u.nom}</option>
                  ))}
                </select>
              </div>

              <div className="convertisseur-container">
  <div className="convertisseur">
    <span className="quantite">{quantite}</span>
    <span className="unite">{unite1}</span>
    <span className="unite">{produit?.nom || "Produit non défini"}</span>

    <span className="equals">=</span>
    <span className="quantite-convertie">{quantiteConvertie}</span>
    <span className="unite">{unite2}</span>
  </div>
</div>


              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Envoyer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TransfertModal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import Sidebar from '../Components/SidebarMagasinier';
import Header from '../Components/NavbarM';
import '../Styles/CreerInventaire.css';
function CreerInventaire() {
  const [entrepot, setEntrepot] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [quantiteInitiale, setQuantiteInitiale] = useState(0);
  const [quantiteFinale, setQuantiteFinale] = useState(0);
  const [raisonAjustement, setRaisonAjustement] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // État pour le produit sélectionné
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");

  useEffect(() => {
    const fetchEntrepotAndStocks = async () => {
      try {
        // Récupérer l'entrepôt
        const entrepotResponse = await axios.get(`http://localhost:5000/api/entrepot/recuperer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepot(entrepotResponse.data);

        // Récupérer les stocks de l'entrepôt
        const stocksResponse = await axios.get(`http://localhost:5000/api/stocks/stocks/${entrepotResponse.data._id}`);
        setStocks(stocksResponse.data);
        setLoading(false); // Fin du chargement
      } catch (error) {
        toast.error('Erreur lors du chargement des données.');
        setError('Erreur lors du chargement des données.');
        setLoading(false); // Fin du chargement
      }
    };

    fetchEntrepotAndStocks();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (quantiteFinale === '') {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Veuillez entrer la quantité finale.',
        });
        return;
    }

    // Calcul des produits perdus ou périmés
    const quantitePerdue = quantiteInitiale - quantiteFinale;

    // Créer l'objet d'inventaire à envoyer au serveur
    const inventaireData = {
        entrepot: entrepot._id,  // Vous envoyez l'ID de l'entrepôt ici
        produit: selectedProduct.produit._id, // Vous envoyez l'ID du produit ici
        quantiteInitiale,
        quantiteFinale,
        quantitePerdue,
        raisonAjustement,
        personneId:userId,
        date: new Date(),
    };

    console.log('Données envoyées:', inventaireData);  // Ajoutez ce log pour vérifier les données

    try {
        const response = await axios.post('http://localhost:5000/api/inventaire/ajouter', inventaireData, {
            headers: { Authorization: `Bearer ${token}` },
        });

  

        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Inventaire enregistré avec succès !',
            }).then(() => {
                window.location.reload();
            });
            
            // Réinitialiser les champs du formulaire
            setQuantiteInitiale(0);
            setQuantiteFinale(0);
            setRaisonAjustement('');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l\'enregistrement de l\'inventaire.',
            });
        }
    } catch (error) {
        // Log de l'erreur détaillée
        console.error('Erreur lors de la communication avec le serveur:', error.response ? error.response.data : error.message);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la communication avec le serveur.',
        });
    }
};


  

  return (
    <>
      <ToastContainer />
      <main className='center'>
  <Sidebar />
  <section className='contenue'>
    <Header />
    <div className="p-3 content center">
    <div className="mini-stat p-3 bg-light shadow rounded">
      <h5 className='alert alert-success'>
        <i className='fa fa-line-chart'></i> Effectuer un Inventaire
      </h5>


        <div>
          <h6>Entrepôt : {entrepot ? entrepot.nom : "Aucun entrepôt"}</h6>
        </div>
        {error && <p className="text-danger">{error}</p>}
        {loading ? (
          <p>Chargement des stocks...</p>
        ) : (
            <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Unité</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => (
                  <tr key={stock._id}>
                    <td>{stock.produit.codeProduit}</td>
                    <td>{stock.produit.nom}</td>
                    <td>{stock.quantité}</td>
                    <td>{stock.produit.unite}</td>
                    <td>
                    <button 
    className="btnay btn-primary btn-lg btn-sm d-block d-md-inline" // 'btn-lg' pour les grands écrans et 'btn-sm' pour les petits écrans
    onClick={() => {
        setQuantiteInitiale(stock.quantité);
        setSelectedProduct(stock); // Mettez à jour le produit sélectionné
    }}>
    Sélectionner
</button>


                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        )}
      </div>
         <div className="ajoutPersonnel ">
        <form onSubmit={handleSubmit} className="mt-4">
<div className="d-flex mb-4">
  <div className="flex-fill me-2">
    <label className="form-label">Quantité Initiale</label>
    <input
      type="number"
      className="form-control"
      value={quantiteInitiale}
      readOnly
    />
  </div>
  <div className="flex-fill me-2">
    <label className="form-label">Quantité Finale</label>
    <input
      type="number"
      className="form-control"
      value={quantiteFinale}
      onChange={(e) => setQuantiteFinale(e.target.value)}
    />
  </div>
  <div className="flex-fill">
    <label className="form-label">Raison d'Ajustement</label>
    <textarea
      className="form-control"
      value={raisonAjustement}
      onChange={(e) => setRaisonAjustement(e.target.value)}
    />
  </div>
</div>

 

          <button type="submit" className="btn15 btn-success">Enregistrer l'Inventaire</button>
        </form>  
        </div>
      </div>
  </section>
</main>

    </>
  );
}

export default CreerInventaire;

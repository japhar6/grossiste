import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from 'sweetalert2';  
import { Spinner } from 'react-bootstrap'; 
import { useNavigate } from 'react-router-dom';

const CommandeDetails = ({ closeModal }) => {
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produitsToUpdate, setProduitsToUpdate] = useState([]);
  const [typeRemise, setTypeRemise] = useState(null);
  const [valeurRemise, setValeurRemise] = useState(0);
  const [referenceFacture, setReferenceFacture] = useState(null);  


  const navigate = useNavigate(); 

  useEffect(() => {
    const reference = localStorage.getItem('referenceFacture');
    if (reference) {
      setReferenceFacture(reference);

      axios.get(`http://localhost:5000/api/commandes/reference/${reference}`)
        .then((response) => {
          setSelectedCommande(response.data);
          setProduitsToUpdate(response.data.produits);
          setLoading(false);
          setTypeRemise(response.data.typeRemise);
          setValeurRemise(response.data.valeurRemise);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des données', err);
          setError('Erreur lors du chargement des données');
          setLoading(false);
        });
    } else {
      console.error('Aucune référence de commande trouvée dans le stockage local');
      setError('Aucune référence de commande trouvée dans le stockage local');
      setLoading(false);
      // Si la référence est manquante ou invalide, rediriger vers le Dashboard
      navigate('/admin');  // Redirection vers le Dashboard
    }
  }, [navigate]);
  
  const handlePrixChange = (index, newPrix) => {
    const updatedProduits = [...produitsToUpdate];
    updatedProduits[index] = {
      ...updatedProduits[index],
      prixdevente: newPrix,
      total: newPrix * updatedProduits[index].quantite,  // Recalculer le total
    };
  
    // Ici, nous utilisons produitsData, mais il n'est pas défini dans la fonction, donc
    // nous allons l'utiliser comme updatedProduits à la place
    const produitsData = updatedProduits;  // Assurez-vous que produitsData est défini
  
    console.log(produitsData);  // Afficher les produits mis à jour
    setProduitsToUpdate(updatedProduits);  // Mettre à jour l'état
  };
  

  const handleRemiseTypeChange = (e) => {
    setTypeRemise(e.target.value);
  };

  const handleValeurRemiseChange = (e) => {
    setValeurRemise(e.target.value);
  };

  const handleSubmit = async () => {
    if (!referenceFacture) {
      console.error('La référence de facture est manquante.');
      return;
    }
  
 // Transformation des produits pour correspondre à la structure attendue par le backend
const produitsData = produitsToUpdate.map(produit => ({
   
    produitId :produit.produit._id
,    prixdevente: produit.prixdevente,  // Nouveau prix de vente
    quantite: produit.quantite,        // Quantité du produit
    uniteChoisie: produit.uniteChoisie // Unité choisie pour le produit
  }));
  
 
  
  // Créer le corps de la requête
  const requestBody = {
    produitsToUpdate: produitsData,  // Données des produits mises à jour
    typeRemise: typeRemise,          // Type de remise, comme 'parProduit'
    valeurRemise: valeurRemise       // Valeur de la remise (fixe ou autre)
  };
  
  // Effectuer la requête API avec `requestBody`
  
    try {
      const response = await axios.put(`/api/commandes/update-prix/${referenceFacture}`, requestBody);
      console.log('Réponse après soumission:', response.data);
      if (response.data.msg === 'Prix des produits mis à jour et remise appliquée') {
        setProduitsToUpdate(response.data.commande.produits);

        Swal.fire({
            title: 'Succès!',
            text: 'La commande a été mise à jour avec succès.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            localStorage.removeItem('referenceFacture');
            window.location.reload();
        });
        
      } else {
        console.error('Erreur lors de la mise à jour de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Swal.fire({
        title: 'Erreur!',
        text: 'Une erreur s\'est produite lors de la mise à jour de la commande.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };
  

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <Spinner animation="border" variant="primary" /> {/* Spinner Bootstrap */}
  </div>
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3 shadow-lg rounded">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Modifier Commande
            </h6>
            <div className="bg-light p-4 rounded shadow-sm">
              <h2 className="mb-4">Détails de la Commande</h2>
              <p><strong>Référence :</strong> {selectedCommande.referenceFacture}</p>
              <p><strong>Date :</strong> {new Date(selectedCommande.createdAt).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}</p>

              <h4>Produits</h4>
              <table className="table table-striped table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix de Vente</th>
                    <th>Prix total</th>
                  </tr>
                </thead>
                <tbody>
                  {produitsToUpdate.map((produit, index) => (
                    <tr key={index}>
                      <td>{produit.produit?.nom || "Inconnu"}</td>
                      <td>{produit.quantite}</td>
                      <td>
                        {typeRemise === 'parProduit' ? (
                          <input
                            type="number"
                            value={produit.prixdevente}
                            onChange={(e) => handlePrixChange(index, e.target.value)}
                            className="form-control"
                          />
                        ) : (
                          `${produit.prixdevente} ariary`
                        )}
                      </td>
                      <td>{produit.total} ariary</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mb-3">
                <label htmlFor="typeRemise" className="form-label">Type de Remise</label>
                <select 
                  id="typeRemise" 
                  value={typeRemise} 
                  onChange={handleRemiseTypeChange}
                  className="form-select"
                >
                  <option value="">Sélectionner type remise</option>
                  <option value="parProduit">Par Produit</option>
                  <option value="pourcentage">Générale</option>
                  <option value="montantFixe">Fixe</option>
                </select>
              </div>

              {typeRemise !== 'parProduit' && (
                <div className="mb-3">
                  <label htmlFor="valeurRemise" className="form-label">Valeur de la Remise</label>
                  <input
                    type="number"
                    id="valeurRemise"
                    value={valeurRemise}
                    onChange={handleValeurRemiseChange}
                    className="form-control"
                  />
                </div>
              )}

              <p><strong>Montant total :</strong> 
                {
                  typeRemise === 'pourcentage' ? 
                  produitsToUpdate.reduce((acc, produit) => acc + produit.total, 0) * (1 - (valeurRemise / 100)) :
                  typeRemise === 'montantFixe' ? 
                  produitsToUpdate.reduce((acc, produit) => acc + produit.total, 0) - valeurRemise :
                  produitsToUpdate.reduce((acc, produit) => acc + produit.total, 0)
                } ariary
              </p>

              <div className="d-flex justify-content-between gap-3">
  <button 
    onClick={handleSubmit} 
    className="btn btn-success btn-lg" 
    style={{ width: '140px', padding: '10px 0' }} // Ajustement de la largeur à 60px
  >
    Mettre à jour
  </button>
  <button 
  onClick={() => {
    localStorage.removeItem('referenceFacture'); // Supprime l'élément 'referenceFacture' du localStorage
    navigate('/admin'); // Redirection vers le dashboard
  }}
  className="btn btn-danger btn-lg" 
  style={{ width: '150px', padding: '10px 0', marginRight: '1100px', fontSize: '0.9em' }} // Ajustement de la largeur à 150px
>
  Fermer
</button>

</div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CommandeDetails;

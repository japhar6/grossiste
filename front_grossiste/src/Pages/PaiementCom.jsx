import React, { useState, useEffect } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Commade.css";

function PaiementCom() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [produitsRetournes, setProduitsRetournes] = useState({});
  const [produitsVendus, setProduitsVendus] = useState([]);

  // Recherche de la commande en fonction de la référence
  const handleSearch = async () => {
    if (!referenceFacture) return; // Validation si la référence est vide
    try {
      const response = await fetch(`http://10.152.183.99/api/commandes/reference/${referenceFacture}`);
      if (!response.ok) throw new Error("Commande non trouvée");
      const data = await response.json();

      // Détermine le type de client (Commercial ou Non)
      if (data.typeClient === "Commercial") {
        setCommercial(data.commercialId);
        setClient(null);
      } else {
        setClient(data.clientId);
        setCommercial(null);
      }

      // Mise à jour de l'état des commandes et des produits
      setCommande(data);
      setProduitsRetournes({});
      setProduitsVendus([]);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la recherche de la commande");
      setCommande(null);
      setClient(null);
      setCommercial(null);
    }
  };

  const handleQuantiteChange = (produitId, e) => {
    const quantite = parseInt(e.target.value) || 0;
    if (quantite > 0 && produitId) {
      setProduitsVendus((prev) => {
        const updatedProduits = [...prev];
        const index = updatedProduits.findIndex(p => p.produitId === produitId);
        if (index >= 0) {
          updatedProduits[index].quantite = quantite;
        } else {
          updatedProduits.push({ produitId, quantite });
        }
        return updatedProduits;
      });
    } else {
      alert("Quantité invalide ou produit sans ID.");
    }
  };

  // Calcul du total après retour de produits
  const calculerTotalApresRetour = () => {
    if (!commande) return 0;

    return commande.produits.reduce((total, produit) => {
      const quantiteRetournee = parseInt(produitsRetournes[produit.produit.id] || 0);
      const nouvelleQuantite = Math.max(produit.quantite - quantiteRetournee, 0);
      return total + nouvelleQuantite * produit.prixUnitaire;
    }, 0);
  };

  // Validation de la commande et mise à jour de la vente
  const handleValidation = async () => {
    const produitsInvalides = produitsVendus.filter(p => !p.produitId || p.quantite <= 0);
    if (produitsInvalides.length > 0) {
      alert("Certains produits sont invalides, assurez-vous que chaque produit a un ID valide et une quantité positive.");
      return;
    }

    try {
      // Prépare les données à envoyer
      const produitsVendusToSend = produitsVendus.map(produit => ({
        produitId: produit.produitId,
        quantite: produit.quantite,
      }));

      const response = await fetch(`http://10.152.183.99/api/paiementCom/mettre-ajour/${referenceFacture}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produitsVendus: produitsVendusToSend,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Paiement et vente mis à jour avec succès");
      } else {
        throw new Error("Erreur lors de la mise à jour du paiement");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur s'est produite lors de la mise à jour du paiement");
    }
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Caisse
            </h6>

            <div className="commande-container d-flex justify-content-between">
              <div className="client-info w-50 p-3">
                <h6><i className="fa fa-user"></i> Référence de la commande du commercial</h6>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={(e) => setReferenceFacture(e.target.value)}
                  />
                  <button className="btn btn-primary ms-2" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
              </div>

              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>{commande ? (commande.typeClient === "Commercial" ? "Commercial" : "Client") : "Client"}</th>
                      <th>Contact</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{commande?.typeClient === "Commercial" ? commercial?.nom : client?.nom}</td>
                      <td>{commande?.typeClient === "Commercial" ? commercial?.telephone : client?.telephone}</td>
                      <td>{commande?.modePaiement || ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {commande && (
              <div className="commande mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <table className="table table-bordered mt-2 text-center">
                  <thead>
                    <tr>
                      <th>Nom du produit</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Produit vendu</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.produits.map((produit, index) => {
                      const produitId = produit.produit._id;  // Accès correct à l'ID du produit
                      return (
                        <tr key={index}>
                          <td>{produit.produit.nom}</td>
                          <td>{produit.quantite}</td>
                          <td>{produit.prixUnitaire} Ariary</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={produitsVendus.find(p => p.produitId === produitId)?.quantite}
                              onChange={(e) => handleQuantiteChange(produitId, e)}
                            />
                          </td>
                          <td>
                            <button className="btn btn-info" onClick={handleValidation}>Valider</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <h6 className="total">Montant restant:  Ariary</h6>
                <h6 className="total">Total à payer: {calculerTotalApresRetour()} Ariary</h6>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaiementCom;

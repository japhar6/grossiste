import React, { useState } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Caisse.css";
import Swal from 'sweetalert2';
function Caisse() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);

  const [typeRemise, setTypeRemise] = useState("aucune");
  const [valeurRemise, setValeurRemise] = useState(0);
  const [totalApresRemise, setTotalApresRemise] = useState(0);
  const idCaissier = localStorage.getItem("userid"); 
  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/commandes/reference/${referenceFacture}`);
      if (!response.ok) {
        throw new Error("Commande non trouvée");
      }
      const data = await response.json();

      if (data.typeClient === "Client") {
        setClient(data.clientId);
        setCommercial(null);
      } else if (data.typeClient === "Commercial") {
        setCommercial(data.commercialId);
        setClient(null);
      }

      setCommande(data);
      setTotalApresRemise(data.totalGeneral);
    } catch (error) {
      console.error(error);
      setCommande(null);
      setClient(null);
      setCommercial(null);
    }
  };

  const calculerRemise = () => {
    if (!commande) return;

    let totalFinal = commande.totalGeneral;

    if (typeRemise === "total" && valeurRemise > 0) {
      totalFinal -= totalFinal * (valeurRemise / 100);
    } else if (typeRemise === "fixe" && valeurRemise > 0) {
      totalFinal -= valeurRemise;
    } else if (typeRemise === "produit") {
      totalFinal = commande.produits.reduce((total, produit) => {
        const remiseProduit = (produit.prixUnitaire * (valeurRemise / 100)) * produit.quantite;
        return total + (produit.total - remiseProduit);
      }, 0);
    }

    setTotalApresRemise(Math.max(totalFinal, 0));
  };

  const validerPaiement = async () => {
    if (!commande) return;
  
    console.log("Statut de la commande:", commande.statut); // Vérification du statut
  
    if (commande.statut !== "en attente") {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Le paiement ne peut pas être validé car  la commande est deja terminée.',
      });
      return; // Arrête la fonction si le statut n'est pas "en attente"
    }
    const data = {
      statut: "complet",
      remiseGlobale: typeRemise === "total" ? valeurRemise : 0,
      remiseFixe: typeRemise === "fixe" ? valeurRemise : 0,
      remiseParProduit:
        typeRemise === "produit"
          ? commande.produits.map((produit) => ({
              produitId: produit.produit._id,
              remise: valeurRemise,
            }))
          : [],
      totalPaye: totalApresRemise,
      idCaissier
    };
  
    console.log("Données de paiement à envoyer:", data); // Vérification des données
  
    try {
      let url = `http://localhost:5000/api/paiement/ajouter/${commande._id}`;
      if (commande.typeClient === "Commercial") {
        url = `http://localhost:5000/api/paiementCom/commercial/${commande._id}`;
      }
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Échec du paiement");
      }
  
      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: result.message,

      })
      setReferenceFacture("");
      setCommande(null);
      setClient(null);
      setCommercial(null);
      setTypeRemise("aucune");
      setValeurRemise(0);
      setTotalApresRemise(0);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors du paiement',
      });
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
              <div className="refcli ">
                <h6><i className="fa fa-user"></i> Référence de la commande</h6>
                  <div className="form-group ">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Entrer la référence"
                      value={referenceFacture}
                      onChange={(e) => setReferenceFacture(e.target.value)}
                    />
                    <button className="btno btn-primary " onClick={handleSearch}>
                      Rechercher
                    </button>
                  </div>
              </div>

              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
           
                <table className="tableCS mt-2">
                  <thead>
                    <tr>
                      <th>{commande ? (commande.typeClient === "Commercial" ? "Commercial" : "Client") : "Client"}</th>
                      <th>Contact</th>
                      <th>Remise</th>
                      <th>Valeur</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{commande?.typeClient === "Commercial" ? commercial?.nom : client?.nom}</td>
                      <td>{commande?.typeClient === "Commercial" ? commercial?.telephone : client?.telephone}</td>
                      <td>
                        <select className="form-control" value={typeRemise} onChange={(e) => setTypeRemise(e.target.value)}>
                          <option value="aucune">Aucune</option>
                          <option value="produit">Par produit (%)</option>
                          <option value="total">Total (%)</option>
                          <option value="fixe">Fixe</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={valeurRemise}
                          onChange={(e) => setValeurRemise(parseFloat(e.target.value))}
                        />
                      </td>
                      <td>{commande ? commande.modePaiement : ""}</td>
                    </tr>
                  </tbody>
                </table>
                </div>
                <button className="btna btn-secondary mt-2" onClick={calculerRemise}>
                  Appliquer Remise
                </button>
              </div>
            </div>

            {commande && (
              <div className="commandeX mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <table className="tableCS table-bordered mt-2 text-center">
                  <thead>
                    <tr>
                      <th>Nom du produit</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.produits.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.produit.nom}</td>
                        <td>{produit.quantite}</td>
                        <td>{produit.prixUnitaire} Ariary</td>
                        <td>{produit.total} Ariary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h6 className="total">Total avant remise: {commande.totalGeneral} Ariary</h6>
                <h6 className="total">Total après remise: {totalApresRemise} Ariary</h6>

                <button className="btnVA btn-success mt-3" onClick={validerPaiement}>
                  Valider le paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Caisse;

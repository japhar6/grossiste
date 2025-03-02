import React, { useState, useEffect } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import Swal from "sweetalert2";
import axios from "../api/axios";
//import "../Styles/PayerCaisse.css";

function Caisse() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [paiements, setPaiements] = useState([]);
  const [filteredPaiements, setFilteredPaiements] = useState([]);
  const [paiement, setPaiement] = useState(null);
  const [commande, setCommande] = useState(null);
  const [modePaiement, setModePaiement] = useState("");
  const [referencePaiement, setReferencePaiement] = useState("");

  // Charger tous les paiements à crédit au démarrage
  useEffect(() => {
    axios.get("/api/paiement/credit")
      .then(response => setPaiements(response.data))
      .catch(error => console.error("Erreur lors du chargement des paiements :", error));
  }, []);

  // Filtrer les paiements selon la référence
  useEffect(() => {
    if (referenceFacture) {
      setFilteredPaiements(
        paiements.filter(p =>
          p.referenceFacture.toLowerCase().includes(referenceFacture.toLowerCase())
        )
      );
    } else {
      setFilteredPaiements([]);
    }
  }, [referenceFacture, paiements]);

  // Sélectionner un paiement
  const handleSelectPaiement = (selectedPaiement) => {
    setPaiement(selectedPaiement);
    setCommande(selectedPaiement.commandeId);
    setReferenceFacture(selectedPaiement.referenceFacture);
    setFilteredPaiements([]);
  };

  // Valider le paiement
  const validerPaiement = async () => {
    if (!modePaiement) {
      Swal.fire("Erreur", "Veuillez sélectionner un mode de paiement", "error");
      return;
    }

    try {
      await axios.put(`/api/paiement/payer/${referenceFacture}`, {
        modePaiement: modePaiement,
        referencePaiement: referencePaiement || null,
      });

      Swal.fire("Succès", "Le paiement a été validé avec succès", "success");
      setPaiement(null);
      setCommande(null);
      setReferenceFacture("");
      setModePaiement("");
      setReferencePaiement("");
    } catch (error) {
      Swal.fire("Erreur", "Impossible de valider le paiement", "error");
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

            {/* Saisie de la référence de commande */}
            <div className="commande-container d-flex justify-content-between">
              <div className="refcli">
                <h6><i className="fa fa-user"></i> Référence de la commande</h6>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence de facture"
                    value={referenceFacture}
                    onChange={(e) => setReferenceFacture(e.target.value)}
                  />
                  
                  {/* Affichage des suggestions */}
                  {filteredPaiements.length > 0 && (
                    <ul className="list-group">
                      {filteredPaiements.map(p => (
                        <li key={p._id} className="list-group-item" onClick={() => handleSelectPaiement(p)}>
                          {p.referenceFacture}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Affichage des détails de la commande */}
            {paiement && commande && (
              <div className="details mt-4">
                <h6><i className="fa fa-box"></i> Détails du paiement</h6>
                <p>Mode de paiement: {paiement.modePaiement}</p>
                <p>Total à payer: {paiement.totalPaiement} Ariary</p>
                <p>Statut: {paiement.statut}</p>

                {/* Affichage du nom du client ou du commercial */}
                <h6><i className="fa fa-user"></i> Client / Commercial</h6>
                <p>{commande.clientId?.nom || commande.commercialId?.nom || "N/A"}</p>

                {/* Détails des produits */}
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
                    {commande.produits.map((item, index) => (
                      <tr key={index}>
                        <td>{item.produit?.nom}</td>
                        <td>{item.quantite}</td>
                        <td>{item.prixdevente}</td>
                        <td>{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sélection du mode de paiement */}
                <select
                  className="form-control mt-2"
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                >
                  <option value="">Sélectionner le mode de paiement</option>
                  <option value="espèce">Espèce</option>
                  <option value="mobile money">Mobile Money</option>
                  <option value="a credit">A Crédit</option>
                  <option value="virement bancaire">Virement bancaire</option>
                </select>

                {/* Référence du paiement si nécessaire */}
                {(modePaiement === "mobile money" || modePaiement === "virement bancaire") && (
                  <div className="form-group mt-3">
                    <label htmlFor="referencePaiement">
                      {modePaiement === "mobile money" ? "Référence de la transaction" : "Référence du bordereau"}
                    </label>
                    <input
                      type="text"
                      id="referencePaiement"
                      className="form-control"
                      placeholder="Entrez la référence"
                      value={referencePaiement}
                      onChange={(e) => setReferencePaiement(e.target.value)}
                    />
                  </div>
                )}

                <h6 className="total">Total: {commande.totalGeneral} Ariary</h6>
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

import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import "../Styles/Commade.css";

function Caisse() {
  const [client, setClient] = useState({ nom: "Jean Dupont", telephone: "0123456789", adresse: "123 Rue Principale" });
  const [commande, setCommande] = useState([
    { id: 1, nom: "Ordinateur Portable", quantite: 1, prix: 1500000, remise: 0 },
    { id: 2, nom: "Smartphone", quantite: 2, prix: 800000, remise: 0 },
  ]);
  const [typeRemise, setTypeRemise] = useState("aucune");
  const [valeurRemise, setValeurRemise] = useState(0);

  // Calculer le total avant remise
  const totalAvantRemise = commande.reduce((acc, item) => acc + item.quantite * item.prix, 0);

  // Calculer la remise et le total après remise
  const calculerRemise = () => {
    let total = totalAvantRemise;
    let remiseTotale = 0;

    if (typeRemise === "produit") {
      commande.forEach((item) => {
        const remiseProduit = (item.prix * item.remise) / 100;
        remiseTotale += remiseProduit * item.quantite;
      });
      total -= remiseTotale;
    } else if (typeRemise === "total") {
      remiseTotale = (totalAvantRemise * valeurRemise) / 100;
      total -= remiseTotale;
    } else if (typeRemise === "fixe") {
      remiseTotale = valeurRemise;
      total -= remiseTotale;
    }

    return { total, remiseTotale };
  };

  // Mise à jour de la remise par produit
  const handleRemiseChange = (e, productId) => {
    let newRemise = parseFloat(e.target.value);
    if (isNaN(newRemise)) newRemise = 0;
    if (newRemise < 0) newRemise = 0;
    if (newRemise > 80) newRemise = 80;

    setCommande(commande.map(item => item.id === productId ? { ...item, remise: newRemise } : item));
  };

  const validerCommande = () => {
    if (!client.nom || !client.telephone || commande.length === 0) {
      Swal.fire("Erreur", "Veuillez remplir toutes les informations", "error");
      return;
    }
    Swal.fire("Commande validée", "Votre commande a été enregistrée", "success");
    setCommande([]);
    setClient({ nom: "", telephone: "", adresse: "" });
  };

  const { total, remiseTotale } = calculerRemise();

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
                <h6><i className="fa fa-user"></i> Référence de la facture</h6>
                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    value="FACT-2025001"
                    onChange={(e) => setClient({ ...client, reference: e.target.value })}
                  />
                </div>
              </div>

              <div className="produits w-50 p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Adresse</th>
                      <th>Remise</th>
                      <th>Valeur</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{client.nom}</td>
                      <td>{client.adresse}</td>
                      <td>
                        <select
                          className="form-control"
                          value={typeRemise}
                          onChange={(e) => setTypeRemise(e.target.value)}
                        >
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
                          onChange={(e) => setValeurRemise(e.target.value)}
                          disabled={typeRemise === "aucune" || typeRemise === "produit"}
                        />
                      </td>
                      <td>
                        <select className="form-control">
                          <option value="cash">Cash</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="credit">Crédit</option>
                          <option value="virement">Virement bancaire</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="commande mt-4">
              <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
              <table className="table table-bordered mt-2 text-center">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Remise par produit (%)</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nom}</td>
                      <td>{item.quantite}</td>
                      <td>
                        {typeRemise === "produit" ? (
                          <input
                            type="number"
                            value={item.remise}
                            onChange={(e) => handleRemiseChange(e, item.id)}
                            max="80"
                            min="0"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{item.prix} Ariary</td>
                      <td>{(item.quantite * item.prix) - ((item.prix * item.remise) / 100) * item.quantite} Ariary</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h6 className="total">
                Total avant remise: {totalAvantRemise} Ariary
              </h6>

              {remiseTotale > 0 && (
                <>
                  <h6 className="remise">
                    Remise appliquée: {remiseTotale} Ariary
                  </h6>
                  <h6 className="total">
                    Total après remise: {total} Ariary
                  </h6>
                </>
              )}

              <button className="btn btn-success mt-3" onClick={validerCommande}>
                Valider le paiement
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Caisse;

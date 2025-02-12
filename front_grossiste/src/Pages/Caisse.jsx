import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import "../Styles/Caisse.css";

function Caisse() {
  const [searchRef, setSearchRef] = useState("");
  const [commandes, setCommandes] = useState([
    { id: 1, reference: "CMD001", client: "Jean Dupont", total: 450000, statut: "En cours" },
    { id: 2, reference: "CMD002", client: "Marie Curie", total: 230000, statut: "En cours" },
    { id: 3, reference: "CMD003", client: "Albert Einstein", total: 120000, statut: "Payé" },
  ]);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [modePaiement, setModePaiement] = useState("");

  const handleSelectCommande = (commande) => {
    setSelectedCommande(commande);
  };

  const validerPaiement = () => {
    if (!selectedCommande || !modePaiement) {
      Swal.fire("Erreur", "Sélectionnez une commande et un mode de paiement", "error");
      return;
    }

    const updatedCommandes = commandes.map((cmd) =>
      cmd.id === selectedCommande.id ? { ...cmd, statut: "Payé" } : cmd
    );

    setCommandes(updatedCommandes);
    setSelectedCommande(null);
    setModePaiement("");

    Swal.fire("Succès", "Le paiement a été validé avec succès", "success");
  };

  const commandesFiltrees = commandes.filter((cmd) =>
    cmd.reference.toLowerCase().includes(searchRef.toLowerCase())
  );

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue2">
        <Header />
        <div className="p-3 caisse-container">
          <div className="caisse-header">
            <h6 className="alert alert-info">
              <i className="fa fa-cash-register"></i> Caisse - Validation des Paiements
            </h6>
            <input
              type="text"
              className="form-control search-bar"
              placeholder="Rechercher une commande par référence..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
            />
          </div>

          {/* Tableau des commandes en attente */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {commandesFiltrees.map((cmd) => (
                  <tr key={cmd.id}>
                    <td>{cmd.reference}</td>
                    <td>{cmd.client}</td>
                    <td>{cmd.total} FCFA</td>
                    <td>
                      <span className={`badge ${cmd.statut === "Payé" ? "badge-success" : "badge-warning"}`}>
                        {cmd.statut}
                      </span>
                    </td>
                    <td>
                      {cmd.statut === "En cours" && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleSelectCommande(cmd)}>
                          Sélectionner
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section des modes de paiement */}
          {selectedCommande && (
            <div className="payment-section">
              <h6>
                <i className="fa fa-credit-card"></i> Sélectionner un mode de paiement pour la commande :{" "}
                <strong>{selectedCommande.reference}</strong>
              </h6>
              <div className="payment-methods">
                <div
                  className={`payment-method cash ${modePaiement === "Cash" ? "selected" : ""}`}
                  onClick={() => setModePaiement("Cash")}
                >
                  Cash
                </div>
                <div
                  className={`payment-method credit ${modePaiement === "Crédit" ? "selected" : ""}`}
                  onClick={() => setModePaiement("Crédit")}
                >
                  Crédit
                </div>
                <div
                  className={`payment-method virement ${modePaiement === "Virement bancaire" ? "selected" : ""}`}
                  onClick={() => setModePaiement("Virement bancaire")}
                >
                  Virement bancaire
                </div>
              </div>

              <button className="validate-button" onClick={validerPaiement}>
                Valider le Paiement
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Caisse;

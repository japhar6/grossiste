import React, { useEffect, useState } from "react";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/HistoC.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import audio from '../assets/mixkit-software-interface-start-2574.wav';
import { Link } from "react-router-dom";
function HistoC() {
  const [paiements, setPaiements] = useState({ clients: [], commerciaux: [] });
  const [filtreNomCaissier, setFiltreNomCaissier] = useState("");
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [filtreNomClientCommercial, setFiltreNomClientCommercial] = useState("");
  const notificationSound = new Audio(audio);
  const [filtreType, setFiltreType] = useState("both");
  const [date, setDate] = useState("");
  const [triMontant, setTriMontant] = useState("desc"); // État pour trier par montant
  const [filtreNomProduit, setFiltreNomProduit] = useState(""); // État pour le nom du produit

  const caissierId = localStorage.getItem("userid");
  const nom = localStorage.getItem('nom');
  const [filtreModePaiement, setFiltreModePaiement] = useState("all");
  const [statutfilter, setstatufilter] = useState("all");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filtrerParDate, setFiltrerParDate] = useState(false);



  useEffect(() => {
    const fetchPaiements = async () => {
      setLoadingEntrepots(true);
      try {
        const response = await axios.get(`/api/paiement`);
        setLoadingEntrepots(false);
        setPaiements(response.data);
      } catch (error) {
        setLoadingEntrepots(true);
        console.error("Erreur lors de la récupération des paiements:", error);
        Swal.fire("Erreur", "Impossible de récupérer les paiements.", "error");
      }
    };

    fetchPaiements();
  }, [caissierId]);


  const getFilteredPaiements = () => {
    const allPaiements = [
      ...paiements.clients.map(client => ({
        ...client,
        type: "client",
      })),
      ...paiements.commerciaux.map(commercial => ({
        ...commercial,
        type: "commercial",
      })),
    ];

    return allPaiements.filter(paiement => {
      const matchesType = filtreType === "both" || paiement.type === filtreType;
      const matchesNomProduit = !filtreNomProduit || paiement.commandeId.produits.some(produit =>
        produit.produit.nom.toLowerCase().includes(filtreNomProduit.toLowerCase())
      );
      const matchesDate = (!dateDebut || new Date(paiement.createdAt) >= new Date(dateDebut)) &&
        (!dateFin || new Date(paiement.createdAt) <= new Date(dateFin));
      const matchesModePaiement = filtreModePaiement === "all" || (paiement.modePaiement == filtreModePaiement);
      const matchStatut = statutfilter === "all" || (paiement.statut === statutfilter);
      const matchesNomCaissier = !filtreNomCaissier || (paiement.idCaissier && paiement.idCaissier.nom.toLowerCase().includes(filtreNomCaissier.toLowerCase()));
      const matchesClientOrCommercial = !filtreNomClientCommercial ||
        (paiement.clientNom && paiement.clientNom.toLowerCase().includes(filtreNomClientCommercial.toLowerCase())) ||
        (paiement.commercialNom && paiement.commercialNom.toLowerCase().includes(filtreNomClientCommercial.toLowerCase()));

      return matchesType && matchesNomProduit && matchesClientOrCommercial && matchesDate && matchesModePaiement && matchStatut && matchesNomCaissier;
    }).sort((a, b) =>
      triMontant === "asc" ? a.montantPaye - b.montantPaye : b.montantPaye - a.montantPaye
    );
  };


  const filteredPaiements = getFilteredPaiements();
  useEffect(() => {
    const paiementsEnRetard = filteredPaiements.filter(paiement =>
      paiement.modePaiement === "a credit" &&
      paiement.dateLimiteCredit &&
      new Date(paiement.dateLimiteCredit) <= new Date()
    );

    if (paiementsEnRetard.length > 0) {
      Swal.fire({
        title: "⚠️ Paiements en retard !",
        text: `Il y a ${paiementsEnRetard.length} paiement(s) à crédit arrivés à échéance.`,
        icon: "warning",
        confirmButtonText: "Ok",
      }); notificationSound.play();
    }
  }, [filteredPaiements]);

  const handleRowClick = async (paiement) => {
    const { value: typeFacture, isDismissed } = await Swal.fire({
      title: "🧾 Sélectionnez le type de facture",
      html: `
        <div style="text-align: left;">
          <label>
            <input type="checkbox" name="typeFacture" value="normal" style="margin-right: 8px;"> 📜 Facture Normale
          </label>
          <br>
          <label>
            <input type="checkbox" name="typeFacture" value="remise" style="margin-right: 8px;"> 📜 Facture de Remise
         </label>
       
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "✅ Valider",
      cancelButtonText: "❌ Annuler",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      preConfirm: () => {
        const selectedTypes = Array.from(document.querySelectorAll('input[name="typeFacture"]:checked')).map(input => input.value);
        if (selectedTypes.length === 0) {
          Swal.showValidationMessage("⚠️ Vous devez sélectionner au moins un type de facture !");
          return false;
        }
        return selectedTypes;
      }
    });

    if (isDismissed || !typeFacture) {
      console.log("Annulation de la génération de facture.");
      return;
    }

    const queryParams = new URLSearchParams();
    if (paiement) queryParams.set("paiement", JSON.stringify(paiement));
    if (paiement.modePaiement) queryParams.set("modePaiement", paiement.modePaiement);
    if (paiement.referencePaiement) queryParams.set("referencePaiement", paiement.referencePaiement);
    if (paiement.dateLimiteCredit) queryParams.set("dateLimiteCredit", paiement.dateLimiteCredit);

    // Utilisation des valeurs paiement.clientNom et paiement.commercialNom
    if (paiement.clientNom) {
      queryParams.set("client", paiement.clientNom);
    } else if (paiement.commercialNom) {
      queryParams.set("commercial", paiement.commercialNom);
    }
    console.log("Données envoyées à la facture :", {
      paiement,
      modePaiement: paiement.modePaiement,
      referencePaiement: paiement.referencePaiement,
      dateLimiteCredit: paiement.dateLimiteCredit,
      client: paiement.clientNom,
      commercial: paiement.commercialNom,
    });


    const openInvoices = () => {
      if (Array.isArray(typeFacture)) {
        if (typeFacture.includes("normal")) {
          const factureUrlNormal = `/factureadmin?${queryParams.toString()}`;
          window.open(factureUrlNormal, "factureNormal");
        }

        if (typeFacture.includes("remise")) {
          const factureUrlRemise = `/factureremisead?${queryParams.toString()}`;
          window.open(factureUrlRemise, "factureRemise");
        }


      }
    };

    openInvoices();
  };
  const handlePrint = () => {
    const printContent = document.getElementById("table-to-print").outerHTML;
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Impression des inventaires</title>');
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #f4f4f4;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Inventaires filtrés</h1>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-info text-start">Historique des Paiements </h6>
              <div className="filter-container mb-3 d-flex flex-wrap justify-content-between gap-2">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="filtrerParDate"
                    checked={filtrerParDate}
                    onChange={e => setFiltrerParDate(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="filtrerParDate">
                    Filtrer par date
                  </label>
                </div>
                <div className="flex-fill">
                  <label className="form-label w-100">
                    <input
                      type="date"
                      className="form-control uniform-size"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      placeholder="Filtrer par date"
                    />
                  </label>
                </div>
                <div className="flex-fill">
                  <label className="form-label w-100">
                    <select className="form-control uniform-size" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
                      <option value="both">Filtrer par type:</option>
                      <option value="client">Paiements Clients</option>
                      <option value="commercial">Paiements Commerciaux</option>
                    </select>
                  </label>
                </div>
                <div className="flex-fill">
                  <label className="form-label w-100">
                    <select className="form-control uniform-size" value={triMontant} onChange={e => setTriMontant(e.target.value)}>
                      <option value="">Trier par montant:</option>
                      <option value="desc">Montant décroissant</option>
                      <option value="asc">Montant croissant</option>
                    </select>
                  </label>
                </div>

                <div className="flex-fill">
                  <label className="form-label w-100">
                    <select className="form-control uniform-size" value={filtreModePaiement} onChange={e => setFiltreModePaiement(e.target.value)}>

                      <option value="all">Tous</option>
                      <option value="espèce">Espèce</option>
                      <option value="virement bancaire">Virement Bancaire</option>
                      <option value="mobile money">Mobile Money</option>
                      <option value="a credit">À Crédit</option>
                    </select>
                  </label>
                </div>
                <div className="col-md-4 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtrer par produit"
                    value={filtreNomProduit}
                    onChange={e => setFiltreNomProduit(e.target.value)}
                  />
                </div>

                <div className="flex-fill">
                  <label className="form-label w-100">
                    <select className="form-control uniform-size" value={statutfilter} onChange={e => setstatufilter(e.target.value)}>
                      <option value="all">Filtrer par statut:</option>
                      <option value="payé complet">Payé Complet</option>
                      <option value="payé partielle">Paiement Partielle</option>
                      <option value="Produits retourner">Produits retourner</option>
                    </select>
                  </label>
                </div>
                <div className="col-md-4 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtrer par nom du client"
                    value={filtreNomClientCommercial}
                    onChange={e => setFiltreNomClientCommercial(e.target.value)}
                  />
                </div>

                <div className="flex-fill">
                  <label className="form-label w-100">
                    <input
                      type="text"
                      className="form-control uniform-size"
                      value={filtreNomCaissier}
                      onChange={e => setFiltreNomCaissier(e.target.value)}
                      placeholder="Filtrer par nom de caissier:"
                    />
                  </label>
                </div>
                {filtrerParDate && (
                  <>
                    <div className="flex-fill">
                      <label className="form-label w-100">
                        <input
                          type="date"
                          className="form-control uniform-size"
                          value={dateDebut}
                          onChange={e => setDateDebut(e.target.value)}
                          placeholder="Filtrer par date début"
                        />
                      </label>
                    </div>

                    <div className="flex-fill">
                      <label className="form-label w-100">
                        <input
                          type="date"
                          className="form-control uniform-size"
                          value={dateFin}
                          onChange={e => setDateFin(e.target.value)}
                          placeholder="Filtrer par date fin"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
              <div>
                <Link to='/histodecaisse' >
                  <button className=" m-2">Historique de decaissement</button>
                </Link>
                <Link to='/annulerFact' >
                  <button className=" m-2">Annuler une Commande</button>
                </Link>
                <button className="btn btn-primary m-2 w-25" onClick={handlePrint}>Imprimer</button>
              </div>
              {filteredPaiements.length === 0 ? (
                <table className="tableZA table-striped" id="table-to-print">
                  <thead className="table-light">
                    <tr>
                      <th>Reference Facture</th>
                      <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
                      <th>Montant Payé</th>
                      <th>Mode de payement</th>
                      <th>Statut</th>
                      <th>Date de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center' }}>Aucun paiement trouvé.</td>
                    </tr>
                  </tbody>
                </table>
              ) : loadingEntrepots ? (
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ marginTop: '150px', marginLeft: '30%' }}
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableZA table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Reference Facture</th>
                        <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>



                        <th>Produits</th>
                        <th>Montant Payé</th>
                        <th>Statut</th>
                        <th>Mode de payement</th>
                        <th>Fait par :</th>
                        <th>Date de paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaiements.map((paiement) => {
                        const estEnRetard = paiement.modePaiement === "a credit" &&
                          paiement.dateLimiteCredit &&
                          new Date(paiement.dateLimiteCredit) <= new Date();

                        return (
                          <tr key={paiement._id} className={estEnRetard ? "clignotant" : ""} onClick={() => handleRowClick(paiement)}>
                            <td>{paiement.commandeId?.referenceFacture}</td>
                            <td>{paiement.type === "commercial" ? paiement.commercialNom : paiement.clientNom}</td>

                            <td className="text-noir" style={{ color: "black" }}>
                              <ul className="produit-list">
                                {paiement.commandeId?.produits?.length > 0 ? (
                                  paiement.commandeId.produits.map((produit) => (
                                    <li key={produit._id}>
                                      {produit.produit?.nom || "Inconnu"} - {produit.quantite} x {produit.prixdevente} ariary
                                    </li>
                                  ))
                                ) : (
                                  <li>Aucun produit</li>
                                )}
                              </ul>
                            </td>

                            <td>{paiement.montantPaye} ariary</td>
                            <td>
                              {paiement.modePaiement ? paiement.modePaiement : "Non spécifié"}
                              {paiement.modePaiement === "a credit" && paiement.dateLimiteCredit && (
                                <span style={{ color: "red", fontWeight: "bold" }}>
                                  📅 Échéance : {new Date(paiement.dateLimiteCredit).toLocaleDateString()}
                                </span>
                              )}
                              {["mobile money", "virement bancaire"].includes(paiement.modePaiement) && paiement.referencePaiement && (
                                <span style={{ color: "blue", fontWeight: "bold" }}>
                                  🔢 Réf : {paiement.referencePaiement}
                                </span>
                              )}
                            </td>
                            <td>{paiement.statut}</td>
                            <td>{paiement.idCaissier && paiement.idCaissier.nom ? paiement.idCaissier.nom : "Non spécifié"}</td>
                            <td>{new Date(paiement.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}</td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoC;

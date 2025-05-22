import React, { useEffect, useState } from "react";
import "../Styles/Facture.css";
import Logo from "../assets/logoo.png";
import axios from "../api/axios";
function Facture() {
  const [paiement, setPaiement] = useState(null);
  const [modePaiement, setModePaiement] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState(null);
  const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
  const [loading, setLoading] = useState(false);
  // Convertir un nombre en toutes lettres (en français)
  function convertirEnLettres(nombre) {
    const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const dizaines = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
    const exceptions = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const grandsNombres = ["", "mille", "million", "milliard"];

    if (nombre === 0) return "zéro";
    if (nombre < 0) return "moins " + convertirEnLettres(-nombre);

    let resultat = "";
    let part = 0;

    while (nombre > 0) {
      let n = nombre % 1000;
      if (n > 0) {
        let segment = convertirCentaines(n);
        if (part === 1 && n === 1) {
          segment = "mille";
        } else if (part > 0) {
          segment += " " + grandsNombres[part];
        }
        resultat = segment + (resultat ? " " + resultat : "");
      }
      nombre = Math.floor(nombre / 1000);
      part++;
    }

    return resultat.trim();
  }

  function convertirCentaines(nombre) {
    const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const dizaines = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "", "quatre-vingts", ""];
    const exceptions = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];

    let resultat = "";

    // Centaines
    if (nombre >= 100) {
      let centaines = Math.floor(nombre / 100);
      if (centaines > 1) {
        resultat += unites[centaines] + " cent";
      } else {
        resultat += "cent";
      }
      if (nombre % 100 === 0) {
        resultat += "s"; // "trois cents"
      }
      nombre %= 100;
      if (nombre > 0) resultat += " ";
    }

    // Exceptions 10-19
    if (nombre >= 10 && nombre < 20) {
      resultat += exceptions[nombre - 10];
      return resultat.trim();
    }

    // 70-79 et 90-99
    if (nombre >= 70 && nombre < 80) {
      resultat += "soixante-" + exceptions[nombre - 70];
      return resultat.trim();
    }
    if (nombre >= 90) {
      resultat += "quatre-vingt-" + exceptions[nombre - 90];
      return resultat.trim();
    }

    // Dizaines normales
    let dizaine = Math.floor(nombre / 10);
    let unite = nombre % 10;
    if (dizaine > 0) {
      resultat += dizaines[dizaine];
      if (unite === 1 && dizaine !== 8) {
        resultat += "-et-";
      } else if (unite > 0) {
        resultat += "-";
      }
    }

    // Unités
    if (unite > 0) {
      resultat += unites[unite];
    }

    return resultat.trim();
  }

  // Récupération des params URL et fetch des données
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paiementId = queryParams.get("paiementId");
    setLoading(true);
    if (!paiementId) {
      console.error("❌ Aucun paiementId trouvé dans l'URL");
      return;
    }

    async function fetchPaiement(id) {
      try {
        let response;
    
        try {
          // Première tentative : /paiement/recuperer/:id
          response = await axios.get(`/api/paiement/recuperer/${id}`);
          console.log("✅ Données récupérées depuis /paiement");
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.warn("🔁 Paiement non trouvé dans /paiement, tentative via /paiementCom...");
            // Deuxième tentative : /paiementCom/recuperer/:id
            response = await axios.get(`/api/paiementCom/recuperer/${id}`);
            console.log("✅ Données récupérées depuis /paiementCom");
          } else {
            throw error; // autre erreur (réseau, 500, etc.)
          }
        }
    
        const data = response.data;
        setLoading(false);
        // MàJ des états avec les données reçues
        setPaiement(data);
        setModePaiement(data.modePaiement || null);
        setReferencePaiement(data.referencePaiement || null);
        setDateLimiteCredit(data.dateLimiteCredit || null);
    
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du paiement :", error);
        setLoading(false);
      }
    }
    
    fetchPaiement(paiementId);
  }, []);

  if (!paiement) return   <div
  className="spinner-border"
  style={{ width: '2rem', height: '2rem', marginLeft: '900px',marginTop: '400px' }}
  role="status"
>
  <span className="visually-hidden">Chargement...</span>
</div>
;

  return (
    <div className="facture-container">
      {/* En-tête facture */}
      <div className="facture-header">
        <img src={Logo} alt="Logo" width={100} />
        <div className="infoCompany">
          <h3 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h3>
          <h5 className="fw-bold">Distribution de Marchandises Générales</h5>
          <h5 className="fw-bold">Tanambao II, TOAMASINA</h5>
          <h5 className="fw-bold">+ 261 34 13 881 72</h5>
        </div>
      </div>

      {/* Infos client / facture */}
      <div className="facture-info p-3" style={{ overflow: "hidden" }}>
        <div style={{ float: "left", marginLeft: "-15px" }}>
          <p>
            <strong>Date :</strong>{" "}
            {new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Client :</strong>{" "}
            {paiement.commercialNom === "Inconnu" && paiement.clientNom !== "Inconnu"
              ? paiement.clientNom
              : paiement.commercialNom === "Inconnu"
              ? paiement.clientNom || "Non spécifié"
              : paiement.commercialNom || "Non spécifié"}
          </p>
          <p>
            <strong>Adresse :</strong>{" "}
            {paiement.clientAdresse
              ? paiement.clientAdresse
              : paiement.ComAdresse
              ? paiement.ComAdresse
              : "..................."}
          </p>
          <p>
            <strong>Mode de paiement :</strong> {modePaiement || "............."}
          </p>
        </div>
        <div style={{ float: "right", marginTop: "-20px" }}>
          <h3 style={{ fontSize: "15px" }}>FACTURE</h3>
          <p>
            <strong>N° :</strong> {paiement.referenceFacture}
          </p>
          <p>
            <strong>Date limite de paiement :</strong>{" "}
            {dateLimiteCredit
              ? new Date(dateLimiteCredit).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "..........."}
          </p>
          <p>
            <strong>Référence :</strong> {referencePaiement || "..........."}
          </p>
        </div>
      </div>

      {/* Détails des produits */}
      <div className="facture-details mt-4">
        <table className="tableZ table-responsive table-bordered">
          <thead>
            <tr>
              <th>Qté</th>
              <th>Unité</th>
              <th>Désignation</th>
              <th>PU</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {paiement.commandeId &&
            paiement.commandeId.produits &&
            paiement.commandeId.produits.length > 0 ? (
              paiement.commandeId.produits.map((produit, index) => (
                <tr key={index}>
                  <td>{produit.quantite}</td>
                  <td>{produit.uniteChoisie || "PCE"}</td>
                  <td>{produit.produit ? produit.produit.nom : "Non spécifié"}</td>
                  <td>{produit.prixdevente} Ariary</td>
                  <td>{produit.total} Ariary</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Aucun produit trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Résumé facture */}
      <div className="facture-summary">
        <p>
          <strong>Total Ariary :</strong> {paiement.totalPaiement} Ariary
        </p>
        <p>
          <strong>Total en FMG :</strong> {paiement.totalPaiement * 5} FMG
        </p>
      </div>

      {/* Pied de page */}
      <div className="facture-footer">
        <p>
          Arrêtée la présente facture à la somme de{" "}
          {convertirEnLettres(paiement.totalPaiement)} Ariary
        </p>
        <p>Misaotra Tompoko</p>
        <div className="signature" style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
          <span>Le Client</span>
          <span>Le Responsable</span>
        </div>
      </div>
    </div>
  );
}

export default Facture;

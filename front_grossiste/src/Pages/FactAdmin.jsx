import React, { useEffect, useState } from "react";
import "../Styles/Facture.css";
import Logo from "../assets/logoo.png";

function Facture() {
  const [paiement, setPaiement] = useState(null);
  const [modePaiement, setModePaiement] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState(null);
  const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [nomEntrepot, setNomEntrepot] = useState(null);

  function convertirEnLettres(nombre) {
    const nombresFr = [
        "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", 
        "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", 
        "dix-sept", "dix-huit", "dix-neuf", "vingt", "trente", "quarante", 
        "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"
    ];
  
    const convertHundreds = (n) => {
        let result = '';
        if (n >= 100) {
            result += nombresFr[Math.floor(n / 100)] + ' cent';
            n %= 100;
        }
        if (n >= 20) {
            result += ' ' + nombresFr[Math.floor(n / 10) + 18];
            n %= 10;
        }
        if (n > 0) {
            result += (result ? '-' : '') + nombresFr[n];
        }
        return result;
    };
  
    if (nombre === 0) return 'zéro';
    if (nombre < 0) return 'moins ' + convertirEnLettres(-nombre);
  
    let result = '';
    let part = 0;
    const units = ['',' mille',' million',' milliard'];
  
    while (nombre > 0) {
        const currentPart = nombre % 1000;
        if (currentPart > 0) {
            let partResult = convertHundreds(currentPart);
            if (part === 1 && currentPart === 1) {
                partResult = 'mille';  // Si c'est exactement 1000, on ne met pas "un"
            } else {
                partResult += units[part];
            }
            result = partResult + (result ? ' ' + result : '');
        }
        nombre = Math.floor(nombre / 1000);
        part++;
    }
    return result.trim();
}
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    try {
      const paiementData = queryParams.get("paiement");
      const clientData = queryParams.get("client");
      const commercialData = queryParams.get("commercial");

      // Vérification et conversion de paiementData
      const paiementObjet = paiementData ? JSON.parse(paiementData) : null;

      console.log("🔍 Données reçues et traitées :", {
        paiementObjet,
        clientData,
        commercialData,
      });

      setPaiement(paiementObjet);
      setModePaiement(queryParams.get("modePaiement"));
      setReferencePaiement(queryParams.get("referencePaiement"));
      setDateLimiteCredit(queryParams.get("dateLimiteCredit"));
      setClient(clientData);
      setCommercial(commercialData);
      console.log(paiement);

    } catch (error) {
      console.error("❌ Erreur lors du traitement des données de l'URL", error);
    }
  }, []);

  useEffect(() => {
    if (paiement) {
      setTimeout(() => {
       
        setTimeout(() => {}, 1000); // 1 seconde après impression
      }, 2000);
    }
  }, [paiement]);

  if (!paiement) {
    return <div>Chargement...</div>;
  }
  

  return (
    <>
      <div className="facture-container">
        <div className="facture-header">
          <img src={Logo} alt="Logo" width={150} />
          <div className="infoCompany">
            <h2 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h2>
            <p>Vente de Marchandises</p>
            <p>Tnambao II, TAMATAVE</p>
            <p>034 13 881 72</p>
          </div>
        </div>
        <h1>-------------------------------</h1>
        <div className="facture-info p-3">
          <div style={{ float: "left" }}>
            <p>
              <strong>Date :</strong> {new Date().toLocaleDateString()}
            </p>
            <p>
            <strong>Client :</strong>
{
  paiement.commercialNom === "Inconnu" && paiement.clientNom !== "Inconnu" 
    ? paiement.clientNom 
    : paiement.commercialNom === "Inconnu" 
    ? paiement.clientNom || "Non spécifié" 
    : paiement.commercialNom || "Non spécifié"
}

            </p>
            <p>
              <strong>Adresse :</strong>  {paiement.clientAdresse ? paiement.clientAdresse : paiement.ComAdresse ? paiement.ComAdresse : "..................."}
             
            </p>
            <p>
              <strong>Mode de paiement :</strong> {modePaiement || "............."}
            </p>
          </div>
          <div style={{ float: "right" }}>
            <h3>FACTURE</h3>
            <p>
              <strong>N° :</strong> {paiement.referenceFacture}
            </p>
            <p>
              <strong>Date limite de paiement :</strong> {dateLimiteCredit || "..........."}
            </p>
            <p>
              <strong>Référence :</strong> {referencePaiement || "..........."}
            </p>
          </div>
        </div>
        <h1>-------------------------------</h1>
        <div className="facture-details mt-4">
          <table className="table table-responsive table-bordered">
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
                    <td>{produit.produit ? produit.produit.nom : "Non spécifié"}</td>    <td>{produit.prixdevente} Ariary</td>
                    <td>{produit.total} Ariary</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">Aucun produit trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
              
        {/* Résumé de la facture */}
        <div className="facture-summary">
          <p>
            <strong>Total Ariary :</strong> {paiement.totalPaiement} Ariary
          </p>
          <p>
            <strong>Total en FMG :</strong> {paiement.totalPaiement * 5} FMG
          </p>
        </div>

        {/* Pied de page de la facture */}
        <div className="facture-footer">
          <p>
            Arrêtée la présente facture à la somme de {convertirEnLettres(paiement.totalPaiement)}  Ariary
          </p>
          <p>Misaotra Tompoko</p>
          <div className="signature">
            <span>Le Client</span>
            <span>Le Fournisseur</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Facture;

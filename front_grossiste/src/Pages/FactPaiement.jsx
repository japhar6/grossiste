import React, { useEffect, useState } from "react";
import "../Styles/Facture.css";
import Logo from "../assets/logoo.png";

function Facture() {
  const [commande, setCommande] = useState(null);
  const [modePaiement, setModePaiement] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState(null);
  const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [nomEntrepot, setNomentrepot] = useState(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    try {
      const commandeData = queryParams.get("commande")
        ? JSON.parse(decodeURIComponent(queryParams.get("commande")))
        : null;
      const clientData = queryParams.get("client")
        ? JSON.parse(decodeURIComponent(queryParams.get("client")))
        : null;
      const commercialData = queryParams.get("commercial")
        ? JSON.parse(decodeURIComponent(queryParams.get("commercial")))
        : null;
      setNomentrepot(queryParams.get("nomEntrepot"));
      setCommande(commandeData);
      setModePaiement(queryParams.get("modePaiement"));
      setReferencePaiement(queryParams.get("referencePaiement"));
      setDateLimiteCredit(queryParams.get("dateLimiteCredit"));
      setClient(clientData);
      setCommercial(commercialData);
    } catch (error) {
      console.error("Erreur lors du traitement des données de l'URL", error);
    }
  }, []);

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
    if (commande) {
      setTimeout(() => {
        window.print(); // Imprime après 2 secondes
        setTimeout(() => {
          window.close(); // Ferme l'onglet après l'impression
        }, 500); // 1 seconde après impression
      }, 900);
    }
  }, [commande]);

  if (!commande) {
    return <div>Chargement...</div>;
  }

  const clientOuCommercial = client || commercial;

  return (
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
            <strong>Commerciale :</strong> {clientOuCommercial?.nom || "Non spécifié"}
          </p>
          <p>
            <strong>Adresse :</strong>{" "}
            {clientOuCommercial?.adresse || "..................."}
          </p>
          <p>
            <strong>Mode de paiement :</strong> {modePaiement || "............."}
          </p>
        </div>
        <div style={{ float: "right" }}>
          <h3>FACTURE</h3>
          <p>
            <strong>N° :</strong> {commande.referenceFacture}
          </p>
          <p>
            <strong>Date limite de paiement :</strong>{" "}
            {dateLimiteCredit || "..........."}
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

              <th>Dépôt</th>
              <th>PU</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {commande.produits.map((produit, index) => (
              <tr key={index}>
                <td>{produit.quantite}</td>
                <td>{produit.uniteChoisie || "PCE"}</td>
                <td>{produit.produit.nom}</td>

                <td>{produit.prixdevente} Ariary</td>
                <td>{produit.total} Ariary</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="facture-summary">
        <p>
          <strong>Total Ariary :</strong> {commande.totalGeneral} Ariary
        </p>
        <p>
          <strong>Total en FMG :</strong> {commande.totalGeneral * 5} FMG
        </p>
      </div>

      <div className="facture-footer">
        <p>
          Arrêtée la présente facture à la somme de {convertirEnLettres(commande.totalGeneral)} Ariary
        </p>
        <p>Misaotra Tompoko</p>
        <div className="signature">
          <span>Le Client</span>
          <span>Le Fournisseur</span>
        </div>
      </div>
    </div>
  );
}

export default Facture;

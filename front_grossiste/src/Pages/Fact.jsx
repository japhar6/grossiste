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
  const [datePositionnementCheque,setdatePositionnementCheque] =useState(null);
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
      const commandeData = queryParams.get("commande")
        ? JSON.parse(decodeURIComponent(queryParams.get("commande")))
        : null;
      const clientData = queryParams.get("client")
        ? JSON.parse(decodeURIComponent(queryParams.get("client")))
        : null;
      const commercialData = queryParams.get("commercial")
        ? JSON.parse(decodeURIComponent(queryParams.get("commercial")))
        : null;

      setCommande(commandeData);
      setModePaiement(queryParams.get("modePaiement"));
      setReferencePaiement(queryParams.get("referencePaiement"));
      setDateLimiteCredit(queryParams.get("dateLimiteCredit"));
      setClient(clientData);
      setCommercial(commercialData);
      setdatePositionnementCheque(queryParams.get("datePositionnementCheque"));
    } catch (error) {
      console.error("Erreur lors du traitement des données de l'URL", error);
    }
  }, []);

  useEffect(() => {
    if (commande) {
      setTimeout(() => {
        window.print(); 
        setTimeout(() => {
          window.close(); // Ferme l'onglet après l'impression
        }, 1000); // 1 seconde après impression
      }, 2000);
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
                    <h3 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h3>
                    <h5 className="fw-bold">Distribution de Marchandises Générales</h5>
                    <h5 className="fw-bold">Tanambao II, TOAMASINA</h5>
                    <h5 className="fw-bold">+ 261 34 13 881 72</h5>
                </div>
      </div>
      <h1>-------------------------------</h1>
      <div className="facture-info p-3">
        <div style={{ float: "left" }}>
          <p>
            <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}
          </p>
          <p>
            <strong>Client :</strong> {clientOuCommercial?.nom || "Non spécifié"}
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
          {modePaiement === "a credit" && (
    <p>
        <strong>Date limite de paiement :</strong>{" "}
        {new Date(dateLimiteCredit).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',}) || "..........."}
    </p>
)}

{modePaiement === "cheque" && (
    <p>
        <strong>Date de positionnement :</strong>{" "}
        {new Date(datePositionnementCheque).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',}) || "..........."}
    </p>
)}
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
              <th>Entrepot</th>
              <th>PU</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
          {commande.produits.map((produit, index) => (
  <tr key={index}>
    <td>{produit.quantite}</td>
    <td>{produit.uniteChoisie || "PCE"}</td>
    <td>{produit.produit ? produit.produit.nom : 'Nom inconnu'}</td> {/* Protection ici */}
    <td>{produit.entrepotId ? produit.entrepotId.nom : 'Entrepôt inconnu'}</td> {/* Protection ici */}
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
          Arrêtée la présente facture à la somme de  {convertirEnLettres(commande.totalGeneral)}   Ariary
        </p>
        <p>Misaotra Tompoko</p>
        <div className="signature">
          <span>Le Client</span>
          <span> Magasin</span>
        </div>
      </div>
    </div>
  );
}

export default Facture;

import React, { useEffect, useState } from "react";
import "../Styles/Fact8.css";
import Logo from "../assets/logoo.png";

function Facture8() {
    const [commande, setCommande] = useState(null);
    const [modePaiement, setModePaiement] = useState(null);
    const [referencePaiement, setReferencePaiement] = useState(null);
    const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
    const [client, setClient] = useState(null);
    const [commercial, setCommercial] = useState(null);
 const [datePositionnementCheque,setdatePositionnementCheque] =useState(null);
 
   
  
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
                segment = "mille"; // Cas particulier de "mille"
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

  // Gestion des centaines
  if (nombre >= 100) {
      let centaines = Math.floor(nombre / 100);
      if (centaines > 1) {
          resultat += unites[centaines] + " cent";
      } else {
          resultat += "cent";
      }
      if (nombre % 100 === 0) {
          resultat += "s"; // Ex : "trois cents"
      }
      nombre %= 100;
      if (nombre > 0) {
          resultat += " ";
      }
  }

  // Gestion des exceptions (10 à 19)
  if (nombre >= 10 && nombre < 20) {
      resultat += exceptions[nombre - 10];
      return resultat.trim();
  }

  // Gestion des dizaines spéciales (70-99)
  if (nombre >= 70 && nombre < 80) {
      resultat += "soixante-" + exceptions[nombre - 70];
      return resultat.trim();
  }
  if (nombre >= 90) {
      resultat += "quatre-vingt-" + exceptions[nombre - 90];
      return resultat.trim();
  }

  // Gestion normale des dizaines
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

  // Ajout des unités
  if (unite > 0) {
      resultat += unites[unite];
  }

  return resultat.trim();
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
        <div className="facture-containe">
            <div className="facture-heade">
                <div className="center">
                    <img src={Logo} alt="Logo" width={100} />
                </div>
                <div className="infoCompany">
                    <h3 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h3>
                    <h5 className="fw-bold">Distribution de Marchandises Générales</h5>
                    <h5 className="fw-bold">Tanambao II, TOAMASINA</h5>
                    <h5 className="fw-bold">+ 261 34 13 881 72</h5>
                </div>
            </div>
            <h1>-------------------------------</h1>
            <div className="facture-infos">
                <div style={{ float: "left" }}>
                    <h5>
                        <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}
                    </h5>
                    <h5>
                        <strong>Client :</strong> {clientOuCommercial?.nom || "Non spécifié"}
                    </h5>
                    <h5>
                        <strong>Adresse :</strong>{" "}
                        {clientOuCommercial?.adresse || "..................."}
                    </h5>
                    <h5>
                        <strong>Mode de paiement :</strong> {modePaiement || "............."}
                    </h5>
                </div>
                <div style={{ float: "right" }}>
                    <h3>FACTURE</h3>
                    <h5>
                        <strong>N° :</strong> {commande.referenceFacture}
                    </h5>
                    <h5>
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
                    </h5>
                    <h5>
                        <strong>Référence :</strong> {referencePaiement || "..........."}
                    </h5>
                </div>
            </div>
            <h1>-------------------------------</h1>
            <div className="facture-detail mt-4">
                <table>
                    <thead>
                        <tr>
                            <th>Qté</th>
                       
                            <th>Désignation</th>
                            <th>PU</th>
                            <th>Sous-Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commande.produits.map((produit, index) => (
                            <tr key={index}>
                                <td className="fw-bold">{produit.quantite}</td>
                               
                                <td>{produit.produit ? produit.produit.nom : 'Nom inconnu'}</td> {/* Protection ici */}
                                <td>{produit.prixdevente} Ariary</td>
                                <td>{produit.quantite * produit.prixdevente }</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            <div className="facture-summaryy mt-3">
                <h5>
                    <strong>Total Ariary :</strong> {commande.totalGeneral} Ariary
                </h5>
                <h5>
                    <strong>Total en FMG :</strong> {commande.totalGeneral * 5} FMG
                </h5>
            </div>

            <div className="facture-footerr">
                <h5>
                    Arrêtée la présente facture à la somme de  {convertirEnLettres(commande.totalGeneral)}   Ariary
                </h5>
                <h5>Misaotra Tompoko</h5>
                <div className="signaturee">
                    <span>Le Client</span>
                    <span>Magasin</span>
                </div>
            </div>
        </div>
    );
}

export default Facture8;

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../Styles/Facture.css";
import Logo from "../assets/logoo.png";
import axios from "../api/axios";
function FactureRem() {
  const [commande, setCommande] = useState(null); // Assurez-vous que commande est bien initialisée
  const [modePaiement, setModePaiement] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState(null);
  const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);
 const [datePositionnementCheque,setdatePositionnementCheque] =useState(null);


 useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  const commandeId = queryParams.get("commandeId");

  if (!commandeId) {
    console.error("❌ Aucun commandeId trouvé dans l'URL");
    return;
  }

  async function fetchPaiement(id) {
    try {
      let response;
  
      try {
        // Première tentative : /paiement/recuperer/:id
        response = await axios.get(`/api/commandes/recuperer/${id}`);
        console.log("✅ Données récupérées depuis /paiement");
      } catch (error) {
        if (error.response && error.response.status === 404) {
         
          console.log("✅ Données récupérées depuis /paiementCom");
        } else {
          throw error; // autre erreur (réseau, 500, etc.)
        }
      }
  
      const data = response.data;
  
      // MàJ des états avec les données reçues
      setCommande(data);
      setModePaiement(queryParams.get("modePaiement"));
          setReferencePaiement(queryParams.get("referencePaiement"));
          setDateLimiteCredit(queryParams.get("dateLimiteCredit"));
          setClient(data.clientId);
          setCommercial(data.commercialId);
          setdatePositionnementCheque(queryParams.get("datePositionnementCheque"));

  
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du paiement :", error);
    }
  }
  
  fetchPaiement(commandeId);
}, []);
  
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
      if (commande) {
        setTimeout(() => {
          window.print(); // Imprime après 2 secondes
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
               <img src={Logo} alt="Logo" width={100} />
               <div className="infoCompany">
                           <h3 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h3>
                           <h5 className="fw-bold">Distribution de Marchandises Générales</h5>
                           <h5 className="fw-bold">Tanambao II, TOAMASINA</h5>
                           <h5 className="fw-bold">+ 261 34 13 881 72</h5>
                       </div>
         
           
       </div>
    
       <div className="facture-info p-3">
         <div style={{ float: "left" }}>
           <p><strong>Date :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', })}</p>
           <p><strong>Client :</strong> {clientOuCommercial?.nom || "Non spécifié"}</p>
           <p>
            <strong>Adresse :</strong>    {clientOuCommercial?.adresse || "..................."}
          </p>
                     <p><strong>Mode de paiement :</strong> {modePaiement || "............."}</p>
           
         </div>
         <div style={{ float: "right" ,marginTop:"-20px"}}>
      
      
           <div className="center">
            <p><strong>N° :</strong> {commande.referenceFacture}</p> 
           
           </div>
           <p><strong>Type de remise :</strong> {
   commande.typeRemise === 'parProduit' 
     ? 'Par Produit' 
     : commande.typeRemise === 'pourcentage' 
       ? `Remise en pourcentage : ${commande.valeurRemise}%` 
       : commande.typeRemise === 'montantFixe' 
         ? `Remise fixe : ${commande.valeurRemise} Ariary` 
         : 'Aucune remise'
 }</p>
     {modePaiement === "a credit" && (
    <p>
         <p><strong>Date limite de paiement :</strong> {new Date(dateLimiteCredit).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', }) || "..........."}</p>

    </p>
)}

{modePaiement === "cheque" && (
    <p>
        <strong>Date de positionnement :</strong>{" "}
        {datePositionnementCheque || "..........."}
    </p>
)}
       
 
       <p><strong>Référence :</strong> {referencePaiement || "..........."}</p>
 
 
         </div>
       </div>
        <div className="facture-details mt-4">
         <table className="tableZ table-responsive table-bordered">
           <thead>
             <tr>
               <th>Qté</th>
               <th>Unite</th>
               <th>Désignation</th>
               <th>PU</th>
               <th>Montant à payé</th>
             </tr>
           </thead>
           <tbody>
             {commande.produits.length > 0 ? (
               commande.produits.map((produit, index) => (
                <tr key={index}>
                   <td>{produit.quantite}</td>
                   <td>{produit.uniteChoisie}</td>
                   <td>{produit.produit.nom}</td>
                   <td>{produit.prixdevente} Ariary</td>
                   <td>{produit.quantite * produit.prixdevente} Ariary</td>
                 </tr>
               ))
             ) : (
               <tr><td colSpan="7">Aucun produit trouvé</td></tr>
             )}
           </tbody>
         </table>
       </div>
 
       <div className="facture-summary">
  <p className="flex justify-around items-center">
    <span style={{ marginRight: '10%' }}>
      <strong>Total avant remise en Ariary :</strong> 
      {(() => {
        if (commande.typeRemise === 'pourcentage') {
          // Calcul avant remise pour le type pourcentage
          return (commande.totalGeneral) / (1 - commande.valeurRemise / 100);
        } else if (commande.typeRemise === 'montantFixe') {
          // Calcul avant remise pour le type montant fixe
          return (commande.totalGeneral) + commande.valeurRemise;
        } else {
          // Pas de remise, retourne le montant normal
          return commande.totalGeneral;
        }
      })()} Ariary
    </span>

    <span style={{ marginRight: '10%' }}>
      <strong>Total Ariary :</strong> {commande.totalGeneral} Ariary
    </span>
  </p>

  <p>
    <span style={{ marginRight: '10%' }}>
      <strong>Total avant remise en FMG :</strong> 
      {(() => {
        if (commande.typeRemise === 'pourcentage') {
          // Si la remise est un pourcentage, on inverse le calcul
          return (commande.totalGeneral / (1 - commande.valeurRemise / 100)) * 5;
        } else if (commande.typeRemise === 'montantFixe') {
          // Si la remise est un montant fixe, on inverse le calcul
          return (commande.totalGeneral * 5) + (commande.valeurRemise * 5);
        } else {
          // Pas de remise, retour du montant normal
          return commande.totalGeneral * 5;
        }
      })()} FMG
    </span>

    <span style={{ marginRight: '10%' }}>
      <strong>Total en FMG :</strong> {commande.totalGeneral * 5} FMG
    </span>
  </p>
</div>

    
 
      <div className="facture-footer">
        <p>
          Arrêtée la présente facture à la somme de   {convertirEnLettres(commande.totalGeneral)}  Ariary
        </p>
        <p>Misaotra Tompoko</p>
        <div className="signature">
          <span>Le Client</span>
          <span>Magasin</span>
        </div>
      </div>
     </div>
   );
}

export default FactureRem;

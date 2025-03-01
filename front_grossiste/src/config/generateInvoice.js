import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

const generateInvoice = (commande, modePaiement, referencePaiement, dateLimiteCredit, client, commercial) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

// Entête de la facture
doc.setFontSize(6);  // Réduire la taille de la police pour l'entête
doc.text("TRANOMBAROTRA LOLO SARLU", 10, 10);
doc.text("Marchandises Générales", 10, 16);  // Ajuster la position verticale pour plus de lisibilité
doc.text("Beryl Rose - TAMATAVE", 10, 22);
doc.text("Tel: 033 85 403 86 - 034 31 394 85", 10, 28);

// Informations de la facture (alignées à droite)
doc.setFontSize(6);  // Réduire la taille de la police pour les informations de facture
doc.text(`Date: ${new Date().toLocaleDateString()}`, 80, 10);
doc.text(`Client: ${commande.typeClient === "Client" ? (client?.nom || "Non spécifié") : (commercial?.nom || "Non spécifié")}`, 80, 20);
doc.text(`Adresse: ${commande.typeClient === "Client" ? (client?.adresse || "Non spécifié") : (commercial?.adresse || "Non spécifié")}`, 80, 30);
doc.setFontSize(15); 
doc.text(`Bon de Livraison`, 90, 40); // Décalage de la position verticale
doc.setFontSize(6); 
doc.text(`N°: ${commande.referenceFacture}`, 100, 50); // Ajustement de la position verticale

// Si cela ne fonctionne toujours pas, il peut être utile de jouer avec les positions verticales et horizontales



  // Détails des produits
  const columns = ["Qté", "Colisage", "Désignation", "Dépôt", "PU", "Montant"];
  const rows = commande.produits.map((prod) => [
    prod.quantite,
    prod.uniteChoisie,
    prod.produit.nom,
    commande.entrepotId ? commande.entrepotId.nom : "Entrepôt non spécifié", 
    prod.prixdevente,
    prod.quantite * prod.prixdevente,
  ]);

  // Utilisation de autoTable avec bordures noires et fond en noir et blanc
  autoTable(doc, {
    startY: 70,
    head: [columns],
    body: rows,
    margin: { top: 10, left: 10, right: 20, bottom: 0 },

    styles: {
      fontSize: 7,  // Réduire la taille de la police encore plus si nécessaire
      cellPadding: 2,  // Augmenter légèrement le padding pour plus de lisibilité
      lineColor: [0, 0, 0],  // Bordures noires
      lineWidth: 0.3,  // Épaisseur des bordures
      fillColor: [255, 255, 255], // Fond des cellules en blanc
    },
    headStyles: {
      fillColor: [220, 220, 220], // Fond de l'entête en gris clair
    },
    columnStyles: {
      0: { cellWidth: 12 },  // Ajustement de la largeur des colonnes
      1: { cellWidth: 18 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
    },
    pageBreak: 'auto',  // Autoriser un retour à la page si le tableau dépasse
    overflow: 'linebreak',  // Autoriser un retour à la ligne pour les colonnes longues
    didDrawPage: (data) => {
      // Gérer la pagination automatique si le tableau dépasse la hauteur de la page
      const pageHeight = doc.internal.pageSize.height;
      const cursorPosition = data.cursor.y;
      if (cursorPosition > pageHeight - 50) {  // Si la position du curseur dépasse la page, ajouter une nouvelle page
        doc.addPage();
      }
    },
  });

  // Totaux
  doc.setFontSize(8);  // Réduire encore la taille pour les informations supplémentaires
  doc.text(`Total Ariary: ${commande.totalGeneral}`, 10, doc.lastAutoTable.finalY + 10);
  doc.text(`Total en FMG: ${commande.totalGeneral * 5}`, 10, doc.lastAutoTable.finalY + 20);

  // Détails du paiement
  doc.text(`Mode de Paiement: ${modePaiement}`, 10, doc.lastAutoTable.finalY + 30);

  if (modePaiement === "a credit") {
    doc.text(`Date limite de crédit: ${dateLimiteCredit || "Non spécifiée"}`, 10, doc.lastAutoTable.finalY + 50);
  } else if (modePaiement === "virement bancaire" || modePaiement === "mobile money") {
    doc.text(`Référence de Paiement: ${referencePaiement || "Non spécifié"}`, 10, doc.lastAutoTable.finalY + 40);
  } else {
    doc.text("Mode de Paiement: Non spécifié", 10, doc.lastAutoTable.finalY + 40);
    doc.text("Référence de Paiement: Non spécifiée", 10, doc.lastAutoTable.finalY + 50);
  }

  // Signature
  doc.text("Le Client: Reçu Conforme", 10, doc.lastAutoTable.finalY + 70);
  doc.text("Le Fournisseur: ___________________", 150, doc.lastAutoTable.finalY + 70);

  // Sauvegarde du PDF
  doc.save(`facture_${commande.referenceFacture}.pdf`);
};

export default generateInvoice;

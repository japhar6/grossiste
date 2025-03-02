import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

const generateDiscountInvoice = (commande, client, modePaiement, referencePaiement, dateLimiteCredit) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  // Entête de la facture
  doc.setFontSize(6);
  doc.text("TRANOMBAROTRA LOLO SARLU", 10, 10);
  doc.text("Marchandises Générales", 10, 16);
  doc.text("Beryl Rose - TAMATAVE", 10, 22);
  doc.text("Tel: 033 85 403 86 - 034 31 394 85", 10, 28);

  // Informations de la facture (alignées à droite)
  doc.setFontSize(6);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 80, 10);
  doc.text(`Client: ${client?.nom || "Non spécifié"}`, 80, 20);
  doc.text(`Adresse: ${client?.adresse || "Non spécifiée"}`, 80, 30);
  doc.setFontSize(15);
  doc.text(`Facture de Remise`, 90, 40);
  doc.setFontSize(6);
  doc.text(`N°: ${commande.referenceFacture}`, 100, 50);

  // Détails des produits avec remise
  const columns = ["Qté", "Colisage", "Désignation", "Type de remise", "PU", "Montant Avant Remise", "Montant Après Remise"];
  const rows = commande.produits.map((prod) => [
    prod.quantite,
    prod.uniteChoisie,
    prod.produit.nom,
    `${prod.typeRemise}: ${prod.valeurRemise}`, // Remise appliquée
    prod.prixdevente,
    prod.quantite * prod.prixdevente, // Montant avant remise
    prod.montantApresRemise, // Montant après remise
  ]);

  // Utilisation de autoTable pour afficher le tableau des produits avec les remises
  autoTable(doc, {
    startY: 70,
    head: [columns],
    body: rows,
    margin: { top: 10, left: 10, right: 20, bottom: 0 },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [220, 220, 220],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 18 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25 },
    },
    pageBreak: 'auto',
    overflow: 'linebreak',
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      const cursorPosition = data.cursor.y;
      if (cursorPosition > pageHeight - 50) {
        doc.addPage();
      }
    },
  });

  // Totaux
  doc.setFontSize(8);
  doc.text(`Total Ariary: ${commande.totalGeneral}`, 10, doc.lastAutoTable.finalY + 10);
  doc.text(`Total en FMG: ${commande.totalGeneral * 5}`, 10, doc.lastAutoTable.finalY + 20);

  // Détails du paiement
  let yOffset = doc.lastAutoTable.finalY + 30; // Initialisation de yOffset à partir de la dernière ligne du tableau
  doc.text(`Mode de Paiement: ${modePaiement || "Non spécifié"}`, 10, yOffset);

  if (modePaiement === "a crédit") {
    yOffset += 10; // Ajout d'un espacement pour la date limite de crédit
    doc.text(`Date limite de crédit: ${dateLimiteCredit || "Non spécifiée"}`, 10, yOffset);
  } else if (modePaiement === "virement bancaire" || modePaiement === "mobile money") {
    yOffset += 10; // Ajout d'un espacement pour la référence de paiement
    doc.text(`Référence de Paiement: ${referencePaiement || "Non spécifiée"}`, 10, yOffset);
  } else {
    yOffset += 10; // Ajout d'un espacement pour espèce
    doc.text("Mode de Paiement: espèce", 10, yOffset);
    doc.text("Référence de Paiement: Non spécifiée", 10, yOffset + 10);
  }

  // Signature
  yOffset += 30; // Mise à jour de yOffset pour l'espacement de la signature
  doc.text("Le Client: Reçu Conforme", 10, yOffset);
  doc.text("Le Fournisseur: ___________________", 150, yOffset);

  // Sauvegarde du PDF
  doc.save(`facture_remise_${commande.referenceFacture}.pdf`);
};

export default generateDiscountInvoice;

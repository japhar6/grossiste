// ExportPDF.jsx
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "../Styles/Achat.css";
const ExportPDF = ({ tableId }) => {
    const exportToPDF = () => {
        const input = document.getElementById(tableId); // Utilise l'ID du tableau passé en prop

        if (!input) {
            console.error('Aucun élément trouvé avec cet ID.');
            return;
        }

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgWidth = 190; // Ajustez la largeur de l'image PDF
            const pageHeight = pdf.internal.pageSize.height;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save('tableau.pdf');
        }).catch((error) => {
            console.error('Erreur lors de la génération du PDF :', error);
        });
    };

    return (
        <button onClick={exportToPDF} className="btn7  ">
            Exporter en PDF
        </button>
    );
};

export default ExportPDF;

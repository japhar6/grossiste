import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

const HistoriqueAchats = () => {
    const [achats, setAchats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchEntrepot, setSearchEntrepot] = useState("");

    useEffect(() => {
        const fetchAchats = async () => {
            try {
                const response = await axios.get("/api/achats/afficher");
                setAchats(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des achats :", error);
            }
        };
        fetchAchats();
    }, []);

    // Fonction pour comparer les dates sans tenir compte de l'heure
    const compareDate = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        // Comparer uniquement l'année, le mois et le jour
        return d1.setHours(0, 0, 0, 0) === d2.setHours(0, 0, 0, 0);
    };

    const filteredAchats = achats.filter(achat =>
        (achat.produit?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (searchDate === "" || compareDate(achat.dateAchat, searchDate)) &&
        (searchCategory === "" || achat.produit?.categorie === searchCategory) &&
        (searchEntrepot === "" || achat.entrepot?.nom === searchEntrepot)



    );

    // Collecte des catégories et entrepôts uniques pour le filtrage
    const categories = [...new Set(achats.map(achat => achat.produit?.categorie))];
    const entrepots = [...new Set(achats
        .map(achat => achat.entrepot)
        .filter(entrepot => entrepot) // Filtrer les valeurs nulles
    )];
    const handlePrint = () => {
        const printContent = document.getElementById("table-to-print").outerHTML;
        const printWindow = window.open('', '', 'height=500,width=800');
        printWindow.document.write('<html><head><title>Impression des achats</title>');
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
        printWindow.document.write('<h1>Historiques des achats filtrés</h1>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      };

    return (
        <div>
            <h2>Historique des Achats</h2>
            <div className="center">
                <input
                    type="text"
                    className="form-control p-2 mt-3 m-2"
                    placeholder="Rechercher fournisseur ou produit"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="date"
                    className="form-control p-2 mt-3 m-2"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                />
                <select
                    className="form-control p-2 mt-3 m-2"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <select
                    className="form-control p-2 mt-3 m-2"
                    value={searchEntrepot}
                    onChange={(e) => setSearchEntrepot(e.target.value)}
                >
                    <option value="">Sélectionner un entrepôt</option>
                    {[
                        ...new Set(
                            entrepots
                                ?.filter((entrepot) => entrepot && entrepot.nom) // Filtrer null et les objets sans nom
                                .map((entrepot) => entrepot.nom)
                        )
                    ].map((nomEntrepot, index) => (
                        <option key={index} value={nomEntrepot}>
                            {nomEntrepot}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary m-2" onClick={handlePrint}>Imprimer</button>
                <Link to="/HistoRistourne"><button className="btn btn-primary m-2 w-100">Ristourne</button></Link>




            </div>
            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <div className="table-responsive table-striped" id="table-to-print">
                    <table className="tableSt mt-3">
                        <thead>
                            <tr>
                                <th>Code produit</th>
                                <th>Produit</th>
                                <th>Catégorie</th>
                                <th>Fournisseur</th>
                                <th>Quantité</th>
                                <th>Entrepôt</th>
                                <th>Prix d'achat</th>
                                <th>Total</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAchats.length > 0 ? (
                                filteredAchats.map((achat) => (
                                    <tr key={achat._id}>
                                        <td>{achat.produit?.codeProduit || "Inconnu"}</td>
                                        <td>{achat.produit?.nom || "Inconnu"}</td>
                                        <td>{achat.produit?.categorie || "Non spécifiée"}</td>
                                        <td>{achat.fournisseur?.nom || "Non spécifié"}</td>
                                        <td>{achat.quantite} {achat.unite}</td>
                                        <td>{achat.entrepot?.nom || "Non spécifié"}</td>
                                        <td>{achat.prixAchat ? achat.prixAchat.toLocaleString() : "0"} Ar</td>
                                        <td>{achat.total ? achat.total.toLocaleString() : "0"} Ar</td>

                                        <td>{new Date(achat.dateAchat).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">Aucun achat trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoriqueAchats;
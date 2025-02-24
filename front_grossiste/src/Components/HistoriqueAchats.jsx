import { useEffect, useState } from "react";
import axios from "axios";

const HistoriqueAchats = () => {
    const [achats, setAchats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchAchats = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/achats/afficher");
                setAchats(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des achats :", error);
            }
        };
        fetchAchats();
    }, []);

    // Vérification de sécurité pour éviter les erreurs
    const filteredAchats = achats.filter(achat => 
        achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>Historique des Achats</h2>
            <input
                type="text"
                placeholder="Rechercher par fournisseur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table border="1">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Fournisseur</th>
                        <th>Quantité</th>
                        <th>Prix</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAchats.length > 0 ? (
                        filteredAchats.map((achat) => (
                            <tr key={achat._id}>
                                <td>{achat.produit?.nom || "Inconnu"}</td>
                                <td>{achat.fournisseur?.nom || "Non spécifié"}</td>
                                <td>{achat.quantite}</td>
                                <td>{achat.prixAchat} Ariary</td>
                                <td>{new Date(achat.dateAchat).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">Aucun achat trouvé</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HistoriqueAchats;

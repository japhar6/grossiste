import { useEffect, useState } from "react";
import axios from "../api/axios";

const HistoriqueAchats = () => {
    const [achats, setAchats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Vérification de sécurité pour éviter les erreurs
    const filteredAchats = achats.filter(achat => 
        achat.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fonction pour obtenir l'unité la plus grande en fonction de la conversion
    const getLargestUnit = (product) => {
        if (!product?.unites || product.unites.length === 0) return "Aucune unité"; // Si aucune unité

        // Trouver l'unité avec la plus grande conversion
        const largestUnit = product.unites.reduce((prev, current) => 
            (prev.conversion < current.conversion ? prev : current) // La plus petite conversion = la plus grande unité
        );

        return largestUnit.nom || "Inconnu";
    };

    return (
        <div>
            <h2>Historique des Achats</h2>
            <input
                type="text"
                className="form-control p-2 mt-3 m-2"
                placeholder="Rechercher par fournisseur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <div className="table-responsive table-striped">
                    <table className="tableSt mt-3">
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
                                        <td>{achat.quantite} {getLargestUnit(achat.produit)}</td>
                                        <td>{achat.prixAchat} Ariary</td>
                                      
                                        <td>{new Date(achat.dateAchat).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">Aucun achat trouvé</td>
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

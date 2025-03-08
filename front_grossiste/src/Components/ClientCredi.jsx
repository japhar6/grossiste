import { useEffect, useState } from "react";
import axios from "../api/axios";
import audio from '../assets/mixkit-software-interface-start-2574.wav';
import Swal from "sweetalert2"; 

const ClientsCredit = () => {
    const [clientsCredit, setClientsCredit] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const notificationSound = new Audio(audio);

    useEffect(() => {
        const fetchClientsCredit = async () => {
            try {
                const response = await axios.get("/api/paiement/acredit");
                setClientsCredit(response.data.clients);
            } catch (error) {
                console.error("Erreur lors de la récupération des clients à crédit :", error);
            }
        };

        fetchClientsCredit();
    }, []);

    // Filtrer les clients en fonction du champ de recherche
    const filteredClients = clientsCredit.filter(client =>
        client.clientNom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Détecter les paiements en retard
    useEffect(() => {
        const paiementsEnRetard = clientsCredit.filter(client => 
            new Date(client.dateLimiteCredit) <= new Date()
        );

        if (paiementsEnRetard.length > 0) {
            Swal.fire({
                title: "⚠️ Paiements en retard !",
                text: `Il y a ${paiementsEnRetard.length} paiement(s) à crédit arrivés à échéance.`,
                icon: "warning",
                confirmButtonText: "Voir la liste",
            });  
            notificationSound.play();
        }
    }, [clientsCredit]); // Dépendance sur `clientsCredit`

    return (
        <div>
            <h2>Clients à Crédit</h2>
            <input
                type="text"
                className="form-control p-2 mt-3 m-2"
                placeholder="Rechercher un client"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="table-container" style={{ overflowX: "auto", overflowY: "auto" }}>
                <div className="table-responsive table-striped">
                    <table className="tableSt mt-3">
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Montant</th>
                                <th>Caissier</th>
                                <th>Date</th>
                                <th>Date d'échéance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client._id}>
                                        <td>{client.clientNom || "Inconnu"}</td>
                                        <td>{client.totalPaiement} Ariary</td>
                                        <td>{client.idCaissier?.nom || "Non spécifié"}</td>
                                        <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{ color: "red", fontWeight: "bold" }}>
                                                📅 {new Date(client.dateLimiteCredit).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">Aucun client à crédit trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientsCredit;

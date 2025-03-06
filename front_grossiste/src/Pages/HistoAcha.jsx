import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/HistoC.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import audio from '../assets/mixkit-software-interface-start-2574.wav';

function HistoAcha() {
    const [paniers, setPaniers] = useState([]);
    const [triMontant, setTriMontant] = useState("desc");
    const [filtreNomProduit, setFiltreNomProduit] = useState("");
    const [filtreFournisseur, setFiltreFournisseur] = useState("");
    const [filtreMontant, setFiltreMontant] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("");
    const [filtreDateLimite, setFiltreDateLimite] = useState("");
    const [loadingEntrepots, setLoadingEntrepots] = useState(false);
    const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);  // Gérer l'état de chargement pour l'action de paiement
    const notificationSound = new Audio(audio);

    const handlePaiement = (panierId) => {
        if (!panierId) {
            console.error("ID du panier manquant.");
            return;
        }

        // Affichage d'une boîte de confirmation avec SweetAlert
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez-vous vraiment marquer ce panier comme payé ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, payer',  // Texte du bouton de confirmation
            cancelButtonText: 'Annuler',
            preConfirm: () => {
                // Lorsque l'utilisateur confirme, on effectue l'appel API
                setLoadingAction(true); // Active le spinner
                Swal.showLoading();  // Affiche un spinner dans la boîte de dialogue
                return axios.put(`/api/paniers/modifier-statut/${panierId}`, {
                    statut: 'payé',  // On change le statut en "Payé"
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Traitement si la requête API réussit
                window.location.reload();  // Rechargement de la page après paiement
                setLoadingAction(false);  // Désactivation du spinner
                setPaniers(paniers.map(item =>
                    item.id === panierId ? { ...item, statut: 'Payé' } : item
                ));

                // Affichage d'une confirmation avec SweetAlert
                Swal.fire(
                    'Payé!',
                    'Le panier a été marqué comme payé.',
                    'success'
                );
            }
        }).catch((error) => {
            console.error("Erreur lors de la modification du statut :", error);
            setLoadingAction(false);  // Désactivation du spinner en cas d'erreur
            // Affichage d'une erreur si l'API échoue
            Swal.fire(
                'Erreur',
                "Une erreur est survenue, veuillez réessayer.",
                'error'
            );
        });
    };


    useEffect(() => {
        setLoadingEntrepots(true);
        const fetchPaniers = async () => {
            try {
                const response = await axios.get(`/api/paniers/tous/crédit`);
                setPaniers(response.data.paniers);
                setLoadingEntrepots(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des paniers:", error);
                setLoadingEntrepots(false);

            }
        };

        fetchPaniers();
    }, []);

    const getFilteredPaniers = () => {
        return paniers
            .filter((panier) =>
                panier.achats.some((achat) => {
                    const matchProduit = !filtreNomProduit || achat.produit.nom.toLowerCase().includes(filtreNomProduit.toLowerCase());
                    const matchFournisseur = !filtreFournisseur || (achat.fournisseur?.nom?.toLowerCase().includes(filtreFournisseur.toLowerCase()));
                    const matchMontant = !filtreMontant || panier.totalGeneral.toString().includes(filtreMontant);
                    const matchStatut = !filtreStatut || panier.statut === filtreStatut;
                    const matchDateLimite = !filtreDateLimite || (
                        panier.dateLimiteCredit &&
                        new Date(panier.dateLimiteCredit).toISOString().split('T')[0] === filtreDateLimite
                    );

                    return matchProduit && matchFournisseur && matchMontant && matchStatut && matchDateLimite;
                })
            )
            .sort((a, b) => (triMontant === "asc" ? a.totalGeneral - b.totalGeneral : b.totalGeneral - a.totalGeneral)); // Tri montant
    };

    const filteredPaniers = getFilteredPaniers();

    return (
        <>
            <header></header>
            <main className="center">
                <Sidebar />
                <section className="contenue">
                    <Header />
                    <div className="p-3 content center">
                        <div className="mini-stat p-3">
                            <h6 className="alert alert-info text-start">Historique des Paniers</h6>
                            <div className="filter-container mb-3 d-flex flex-wrap justify-content-between gap-2">
                                {/* Filters */}
                            </div>

                            {loadingEntrepots ? (
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{ marginTop: '150px', marginLeft: '30%' }}
                                >
                                    <span className="visually-hidden">Chargement...</span>
                                </div>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>

                                    <table className="tableZA table-striped">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date de l'achat</th>
                                                <th>Achat</th>
                                                <th>Statut</th>

                                                <th>Montant Total Général</th>
                                                <th>Date Limite Crédit</th>
                                                <th>Mode de Paiement</th>

                                                <th>Montant Payé</th>
                                                <th>Actions</th> {/* Nouvelle colonne pour l'action "Payer" */}
                                            </tr>
                                        </thead>
                                        <tbody>
    {filteredPaniers.length === 0 ? (
        <tr>
            <td colSpan="8" className="text-center">Aucun achat par crédit trouvé</td>
        </tr>
    ) : (
        filteredPaniers.map((panier) => (
            <tr key={panier._id}>
                <td>{new Date(panier.dateAchat).toLocaleDateString()}</td>
                <td>
                    {panier.achats.map((achat, index) => (
                        <div key={index}>
                            <strong>{achat.produit.nom}</strong> x {achat.quantite} {achat.unite}
                        </div>
                    ))}
                </td>
                <td>{panier.statut}</td>
                <td>{panier.totalGeneral} ariary</td>
                <td>
                    {panier.dateLimiteCredit && (
                        <span className="date-limite" style={{ color: 'black' }}>
                            📅 Échéance: {new Date(panier.dateLimiteCredit).toLocaleDateString()}
                        </span>
                    )}
                </td>
                <td>{panier.modePaiement || "Non renseigné"}</td>
                <td>{panier.totalGeneral || "Non renseigné"}</td>
                <td>
                    {panier.statut === 'non payé' && (
                        <button
                            className="btn btn-success btn-sm w-auto p-2"
                            onClick={() => handlePaiement(panier._id)}
                            disabled={loadingAction}
                        >
                            Payer
                        </button>
                    )}
                </td>
            </tr>
        ))
    )}
</tbody>

                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default HistoAcha;

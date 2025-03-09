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
    const [loadingAction, setLoadingAction] = useState(false);
    const notificationSound = new Audio(audio);


    const handlePaiement = async (panierId, fournisseurInfo, typefournisseur) => {
        if (!panierId) {
            console.error("ID du panier manquant.");
            return;
        }

        const fournisseurType = typefournisseur || "";
        console.log('Type de fournisseur:', fournisseurType);

        if (fournisseurType === "prix_libre") {
            try {
                Swal.fire({
                    title: "Confirmation du paiement",
                    text: "Êtes-vous sûr de vouloir payer ce panier ?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Oui, payer",
                    cancelButtonText: "Annuler",
                    preConfirm: async () => {
                        try {
                            Swal.showLoading();
                            const response = await axios.put(`/api/paniers/modifier-statut/${panierId}`, {
                                statut: "payé",
                          
                            });
    
                            if (response.status !== 200) {
                                throw new Error(response.data.message || "Erreur lors de la validation de l'achat");
                            }
                            return response;
                        } catch (error) {
                            console.error("Erreur lors de la validation de l'achat:", error);
                            Swal.fire({
                                title: "Erreur",
                                text: error.response ? error.response.data.message : "Une erreur est survenue.",
                                icon: "error",
                                confirmButtonText: "OK",
                            });
                            return false;
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload();
                        Swal.fire({
                            title: "Payé!",
                            text: "Le panier a été marqué comme payé.",
                            icon: "success",
                            confirmButtonText: "OK",
                        });
                    }
                });
            } catch (error) {
                console.error("Erreur lors du paiement:", error);
            }
        }
else{
        try {
            const result = await Swal.fire({
                title: "Voulez-vous utiliser la ristourne ?",
                text: "Cela réduira le total du panier.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui",
                cancelButtonText: "Non",
            });

            let appliquerRistourne = result.isConfirmed;
            let ristournesSelectionnees = [];

            if (appliquerRistourne) {
                try {
                    const { data: ristournes } = await axios.get(`/api/fondRistourne/fournisseur/${fournisseurInfo}`);

                    if (!ristournes.length) {
                        await Swal.fire({
                            title: "Aucune ristourne disponible",
                            text: "Il n'y a pas de ristourne pour ce fournisseur.",
                            icon: "info",
                            confirmButtonText: "OK",
                        });
                        appliquerRistourne = false;
                    } else {
                        let totalSelectionne = 0;
                        const selectionHtml = ristournes.map((r, index) => `
                            <div>
                                <input type="checkbox" id="ristourne_${index}" value="${r.montantRistourne}" class="ristourne-checkbox" style="margin-right:5px;">
                                <label for="ristourne_${index}">${r.refact} - ${new Date(r.dateAchat).toLocaleDateString()} - ${r.montantRistourne} Ariary</label>
                            </div>
                        `).join("");

                        const { value: selection } = await Swal.fire({
                            title: "Sélectionnez les ristournes à utiliser",
                            html: `<div id="ristourneList">${selectionHtml}</div>
                                <hr>
                                <div style="font-weight:bold; text-align:right;">Total sélectionné: <span id="totalRistourne">0</span> Ariary</div>`
                            ,
                            showCancelButton: true,
                            confirmButtonText: "Valider",
                            cancelButtonText: "Annuler",
                            didOpen: () => {
                                document.querySelectorAll(".ristourne-checkbox").forEach((checkbox) => {
                                    checkbox.addEventListener("change", () => {
                                        let total = 0;
                                        document.querySelectorAll(".ristourne-checkbox:checked").forEach(cb => {
                                            total += parseFloat(cb.value) || 0;
                                        });
                                        document.getElementById("totalRistourne").textContent = total.toLocaleString();
                                    });
                                });
                            }
                        });

                        if (!selection) {
                            appliquerRistourne = false;
                        } else {
                            ristournesSelectionnees = Array.from(document.querySelectorAll(".ristourne-checkbox:checked"))
                                .map(cb => parseFloat(cb.value));
                        }
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des ristournes:", error);
                    await Swal.fire({
                        title: "Erreur",
                        text: "Impossible de récupérer les ristournes.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                    appliquerRistourne = false;
                }
            }

            Swal.fire({
                title: "Confirmation du paiement",
                text: "Êtes-vous sûr de vouloir payer ce panier ?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, payer",
                cancelButtonText: "Annuler",
                preConfirm: async () => {
                    try {
                        Swal.showLoading();
                        const response = await axios.put(`/api/paniers/modifier-statut/${panierId}`, {
                            statut: "payé",
                            appliquerRistourne,
                            ristournesSelectionnees,
                        });

                        if (response.status !== 200) {
                            throw new Error(response.data.message || "Erreur lors de la validation de l'achat");
                        }
                        return response;
                    } catch (error) {
                        console.error("Erreur lors de la validation de l'achat:", error);
                        Swal.fire({
                            title: "Erreur",
                            text: error.response ? error.response.data.message : "Une erreur est survenue.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                        return false;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                    Swal.fire({
                        title: "Payé!",
                        text: "Le panier a été marqué comme payé.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                }
            });
        } catch (error) {
            console.error("Erreur lors de l'initialisation du paiement:", error);
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue, veuillez réessayer.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }}
    };


    useEffect(() => {
        setLoadingEntrepots(true);
        const fetchPaniers = async () => {
            try {
                const response = await axios.get(`/api/paniers/tous/crédit`);
                setPaniers(response.data.paniers);
                setLoadingEntrepots(false);

                const paniersEnRetard = response.data.paniers.filter(panier => new Date(panier.dateLimiteCredit) < new Date());
                if (paniersEnRetard.length > 0) {
                    notificationSound.play();
                    Swal.fire({
                        title: '⚠️ Alertes Échéances',
                        text: `¨Votre date de paiement est atteint pour l'achat !`,
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                }
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
            .sort((a, b) => (triMontant === "asc" ? a.totalGeneral - b.totalGeneral : b.totalGeneral - a.totalGeneral));
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
                                                <th>Fournisseur</th>
                                                <th>Montant Total Général</th>
                                                <th>Date Limite Crédit</th>
                                                <th>Mode de Paiement</th>

                                                <th>Montant Payé</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPaniers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">Aucun achat par crédit trouvé</td>
                                                </tr>
                                            ) : (
                                                filteredPaniers.map((panier) => (
                                                    <tr key={panier._id} style={new Date(panier.dateLimiteCredit) < new Date() ? { animation: 'clignoter 1s infinite alternate', backgroundColor: 'red' } : {}}>
                                                        <td>{new Date(panier.dateAchat).toLocaleDateString()}</td>
                                                        <td>
                                                            {panier.achats.map((achat, index) => (
                                                                <div key={index}>
                                                                    <strong>{achat.produit.nom}</strong> x {achat.quantite} {achat.unite}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td>{panier.statut}</td>
                                                        <td>{panier.fournisseur.nom}</td>
                                                        <td>{panier.totalGeneral} ariary</td>
                                                        <td>
                                                            {panier.dateLimiteCredit && (
                                                                <span className="date-limite text-danger">
                                                                    📅 Échéance: {new Date(panier.dateLimiteCredit).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{panier.modePaiement || "Non renseigné"}</td>
                                                        <td>{panier.totalGeneral || "Non renseigné"}</td>
                                                        <td>
                                                            {panier.statut === 'non payé' && (
                                                                <button
                                                                    className="btn btn-success btn-sm w-auto p-2"
                                                                    onClick={() => {
                                                                        console.log("Panier fournisseur :", panier.fournisseur);
                                                                        handlePaiement(panier._id, panier.fournisseur?._id, panier.fournisseur.type);
                                                                    }}
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

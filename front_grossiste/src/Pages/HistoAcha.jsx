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

    const notificationSound = new Audio(audio);

    useEffect(() => {
        const fetchPaniers = async () => {
            try {
                const response = await axios.get(`/api/paniers/tous/crédit`);
                setPaniers(response.data.paniers);
            } catch (error) {
                console.error("Erreur lors de la récupération des paniers:", error);
                Swal.fire("Erreur", "Impossible de récupérer les paniers.", "error");
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
                                <div className="flex-fill">
                                    <label className="form-label w-100">
                                        <input
                                            type="text"
                                            className="form-control uniform-size"
                                            value={filtreNomProduit}
                                            onChange={(e) => setFiltreNomProduit(e.target.value)}
                                            placeholder="🔍 Rechercher par produit..."
                                        />
                                    </label>
                                </div>
                                <div className="flex-fill">
                                    <label className="form-label w-100">
                                        <input
                                            type="text"
                                            className="form-control uniform-size"
                                            value={filtreFournisseur}
                                            onChange={(e) => setFiltreFournisseur(e.target.value)}
                                            placeholder="🔍 Rechercher par fournisseur..."
                                        />
                                    </label>
                                </div>
                                <div className="flex-fill">
                                    <label className="form-label w-100">
                                        <select className="form-control uniform-size" value={triMontant} onChange={(e) => setTriMontant(e.target.value)}>
                                            <option value="desc">⬇ Montant décroissant</option>
                                            <option value="asc">⬆ Montant croissant</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="flex-fill">
                                    <label className="form-label w-100">
                                        <select className="form-control uniform-size" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                                            <option value="">🔍 Rechercher par statut...</option>
                                            <option value="payé">✔ Payé</option>
                                            <option value="non payé">❌ Non payé</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="flex-fill">
                                    <label className="form-label w-100">
                                        <input
                                            type="date"
                                            className="form-control uniform-size"
                                            value={filtreDateLimite}
                                            onChange={(e) => setFiltreDateLimite(e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>
                            {filteredPaniers.length === 0 ? (
                                <table className="tableZA table-striped">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Référence Panier</th>
                                            <th>Mode de Paiement</th>
                                            <th>Statut</th>
                                            <th>Date Limite Crédit</th>
                                            <th>Montant Payé</th>
                                            <th>Caissier</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center' }}>Aucun panier trouvé.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                                    <table className="tableZA table-striped">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Produit</th>
                                                <th>Quantité</th>
                                                <th>Unité</th>
                                                <th>PU</th>
                                                <th>Fournisseur</th>
                                                <th>Total</th>
                                                <th>Total Général</th>
                                                <th>Statut</th>
                                                <th>Date d'ajout</th>
                                                <th>Date Limite Crédit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPaniers.map((panier) =>
                                                panier.achats.map((achat) => {
                                                    const dateLimite = new Date(panier.dateLimiteCredit);
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    dateLimite.setHours(0, 0, 0, 0);

                                                    const estEnRetard = panier.statut === "non payé" && dateLimite < today;

                                                    return (
                                                        <tr key={achat._id} className={estEnRetard ? "clignotant" : ""}>
                                                            <td>{achat.produit.nom}</td>
                                                            <td>{achat.quantite}</td>
                                                            <td>{achat.unite}</td>
                                                            <td>{achat.prixAchat} ariary</td>
                                                            <td>{achat.fournisseur?.nom || "Non disponible"}</td>
                                                            <td>{achat.total} ariary</td>
                                                            <td>{panier.totalGeneral} ariary</td>
                                                            <td>{panier.statut}</td>
                                                            <td>{new Date(achat.dateAchat).toLocaleDateString()}</td>
                                                            <td>
                                                                {panier.dateLimiteCredit && (
                                                                    <span className="date-limite">
                                                                        📅 Échéance: {new Date(panier.dateLimiteCredit).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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

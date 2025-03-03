import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/NavbarM";
import '../Styles/ChiffreAffaire.css';
import axios from '../api/axios';

function ChiffreAffaire() {
    // États pour stocker les informations
    const [chiffreAffaire, setChiffreAffaire] = useState({
        totalPaiements: 0,
        totalPaiementsCommercial: 0,
        nombrePaiements: 0,
        nombrePaiementsCommercial: 0,
        nombreClients: 0,
        nombreCommerciaux: 0,
        totalAchats: 0,
        nombreAchats: 0,
        totalCommissions: 0,
        nombreCommissions: 0,
        totalSalaire: 0,
        nombreSalaire: 0
    });

    // État pour la période sélectionnée
    const [periode, setPeriode] = useState("global");

    // Fonction pour récupérer les données en fonction de la période
    const fetchChiffreAffaire = () => {
        axios.get(`/api/paiement/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalPaiements: response.data.totalPaiements,
                    totalPaiementsCommercial: response.data.totalPaiementsCommercial,
                    nombrePaiements: response.data.nombrePaiements,
                    nombrePaiementsCommercial: response.data.nombrePaiementsCommercial,
                    nombreClients: response.data.nombreClients,
                    nombreCommerciaux: response.data.nombreCommerciaux,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des paiements", error);
            });

        axios.get(`/api/achats/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalAchats: response.data.totalAchats,
                    nombreAchats: response.data.nombreAchats,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des achats", error);
            });

        // Fetch the commission data
        axios.get(`/api/commission/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalCommissions: response.data.totalCommissions,
                    nombreCommissions: response.data.nombreCommissions,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des commissions", error);
            });
        axios.get(`/api/personnels/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalSalaire: response.data.totalSalaire,
                    nombreSalaire: response.data.nombreSalaire,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des paiements", error);
            });

    };

    // Utilisation de useEffect pour récupérer les données lorsque la période change
    useEffect(() => {
        fetchChiffreAffaire();
    }, [periode]); // La fonction se lance à chaque fois que la période change

    // Fonction pour gérer le changement de période
    const handlePeriodeChange = (event) => {
        setPeriode(event.target.value);
    };

    // Fonction pour formater les montants avec des virgules
    const formatCurrency = (amount) => {
        return amount.toLocaleString();
    };


    return (
        <main className="center">
            <Sidebar />
            <section className="contenue">
                <Header />
                <div className="p-3 content">
                    <div className="row my-4">
                        <div className="col-md-4 center">
                            <select className="form-control m-3" value={periode} onChange={handlePeriodeChange}>
                                <option value="journalier">Journalier</option>
                                <option value="hebdomadaire">Hebdomadaire</option>
                                <option value="mensuel">Mensuel</option>
                                <option value="annuel">Annuel</option>
                                <option value="global">Global</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💵 Total Paiements</h5>
                                    <p className="display-6 text-success fw-bold">{formatCurrency(chiffreAffaire.totalPaiements)} Ariary</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💸 Total Dépenses</h5>
                                    <p className="display-6 text-danger fw-bold">
                                        {formatCurrency(chiffreAffaire.totalAchats + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire)} Ariary
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">📉 Bénéfice Net</h5>
                                    <p className="display-6 text-primary fw-bold">
                                        {formatCurrency(chiffreAffaire.totalPaiements -
                                            (chiffreAffaire.totalAchats + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire))} Ariary
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">👥 Nombre de Clients</h5>
                                    <p className="display-6 text-success fw-bold">{chiffreAffaire.nombreClients}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">👨‍💼 Nombre de Commerciaux</h5>
                                    <p className="display-6 text-success fw-bold">{chiffreAffaire.nombreCommerciaux}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💳 Nombre de Paiements Effectués</h5>
                                    <p className="display-6 text-success fw-bold">
                                        {chiffreAffaire.nombrePaiements + chiffreAffaire.nombrePaiementsCommercial}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">📦 Nombre d'Achats Effectués</h5>
                                    <p className="display-6 text-danger fw-bold">{chiffreAffaire.nombreAchats}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">🛒 Total Achats</h5>
                                    <p className="display-6 text-danger fw-bold">{formatCurrency(chiffreAffaire.totalAchats)} Ariary</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💵 Nombre de Commissions</h5>
                                    <p className="display-6 text-warning fw-bold">{chiffreAffaire.nombreCommissions}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💰 Total Commissions</h5>
                                    <p className="display-6 text-warning fw-bold">{formatCurrency(chiffreAffaire.totalCommissions)} Ariary</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💸 Nombre de salaires personnels</h5>
                                    <p className="display-6 text-secondary fw-bold">{chiffreAffaire.nombreSalaire}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-3">
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">💵 Total salaire payé</h5>
                                    <p className="display-6 text-secondary fw-bold">{formatCurrency(chiffreAffaire.totalSalaire)} Ariary</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ChiffreAffaire;

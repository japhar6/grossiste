import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/NavbarM";
import '../Styles/ChiffreAffaire.css';
import axios from '../api/axios';
import { Modal, Button, Table } from 'react-bootstrap';
import ReapproListModal from '../Components/ReaproModal';
function ChiffreAffaire() {
    // États pour stocker les informations
    const [showReapproModal, setShowReapproModal] = useState(false);
    const [chiffreAffaire, setChiffreAffaire] = useState({
        totalPaiements: 0,
        totalPaiementsCommercial: 0,
        nombrePaiements: 0,
        nombrePaiementsCommercial: 0,
        nombreClients: 0,
        nombreCommerciaux: 0,
        totalPaniers: 0,
        nombrePaniers: 0,
        totalCommissions: 0,
        nombreCommissions: 0,
        totalSalaire: 0,
        nombreSalaire: 0,
        totalPrixInventaire: 0,
        nombreOperations: 0,
        montantRefact: 0
    });
    const [loading, setLoading] = useState(true);
    // État pour la période sélectionnée
    const [periode, setPeriode] = useState("global");

    // Fonction pour récupérer les données en fonction de la période
    const fetchChiffreAffaire = () => {
        setLoading(true);
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

        axios.get(`/api/paniers/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalPaniers: response.data.totalPaniers,
                    nombrePaniers: response.data.nombrePaniers,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des paniers", error);
            });

            axios.get(`/api/reapro/total/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    montantRefact: response.data.totalMontant
                
                }))
                ;
            
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
        axios.get(`/api/inventaire/totals/${periode}`)
            .then(response => {
                setChiffreAffaire(prevState => ({
                    ...prevState,
                    totalPrixInventaire: response.data.totalPrixInventaire,
                    nombreOperations: response.data.nombreOperations,
                }));
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des inventaires", error);
            }).finally(() => {
                setLoading(false); // On arrête le chargement une fois que toutes les données ont été récupérées
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
                            <Button variant="info" onClick={() => setShowReapproModal(true)}>
        Voir les refacturation
      </Button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : (
                        <div >
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">💵 Total Paiements</h5>
                                            <p className="display-6 text-success fw-bold">{formatCurrency(chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial)} Ariary</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">🏷️ Total Dépenses</h5>
                                            <p className="display-6 text-danger fw-bold">
                                                {formatCurrency(chiffreAffaire.totalPaniers + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire)} Ariary
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            {((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial) -
                                                (chiffreAffaire.totalPaniers + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire + chiffreAffaire.totalPrixInventaire)) < 0 ? (
                                                <>
                                                    <h5 className="card-title">📉 Chiffre d'affaire en Perte</h5>
                                                    <p className="display-6 text-danger fw-bold">
                                                        {formatCurrency(Math.abs((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial+chiffreAffaire.montantRefact) -
                                                            (chiffreAffaire.totalPaniers + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire + chiffreAffaire.totalPrixInventaire)))} Ariary
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h5 className="card-title">📈 Chiffre d'affaire Bénéfice</h5>
                                                    <p className="display-6 text-primary fw-bold">
                                                        {formatCurrency((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial+chiffreAffaire.montantRefact) -
                                                            (chiffreAffaire.totalPaniers + chiffreAffaire.totalCommissions + chiffreAffaire.totalSalaire + chiffreAffaire.totalPrixInventaire))} Ariary
                                                    </p>
                                                </>
                                            )}
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
                                            {((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial) -
                                                (chiffreAffaire.totalPaniers)) < 0 ? (
                                                <>
                                                    <h5 className="card-title">🔴 Perte</h5>
                                                    <p className="display-6 text-danger fw-bold">
                                                        {formatCurrency(Math.abs((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial+chiffreAffaire.montantRefact) -
                                                            (chiffreAffaire.totalPaniers)))} Ariary
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h5 className="card-title">💹 Bénéfice net</h5>
                                                    <p className="display-6 text-primary fw-bold">
                                                        {formatCurrency((chiffreAffaire.totalPaiements + chiffreAffaire.totalPaiementsCommercial+chiffreAffaire.montantRefact) -
                                                            (chiffreAffaire.totalPaniers))} Ariary
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4 mt-3">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">🛍️ Nombre d'Achats Effectués</h5>
                                            <p className="display-6 text-danger fw-bold">{chiffreAffaire.nombrePaniers}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mt-3">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">🛒 Total Achats</h5>
                                            <p className="display-6 text-danger fw-bold">{formatCurrency(chiffreAffaire.totalPaniers)} Ariary</p>
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
                                            <h5 className="card-title">💼 Nombre de salaires personnels</h5>
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
                                <div className="col-md-4 mt-3">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">🗒️ Nombre inventaire</h5>
                                            <p className="display-6 text-dark fw-bold">{formatCurrency(chiffreAffaire.nombreOperations)} </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mt-3">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">💵 Total inventaire</h5>
                                            <p className="display-6 text-dark fw-bold">{formatCurrency(chiffreAffaire.totalPrixInventaire)} </p>
                                        </div>
                                    </div>
                                </div>  <div className="col-md-4 mt-3">
                                    <div className="card text-center shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">💵 Total refacturation</h5>
                                            <p className="display-6 text-dark fw-bold">{formatCurrency(chiffreAffaire.montantRefact)} </p>
                                        </div>
                                    </div>
                                </div> 
                                
                                </div>
                                <ReapproListModal
        show={showReapproModal}
        handleClose={() => setShowReapproModal(false)}
      
      />
                        </div>)}
                </div>
            </section>
        </main>
    );
}

export default ChiffreAffaire;

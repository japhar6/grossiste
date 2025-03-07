import React, { useEffect, useState } from "react";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/Histov.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function HistoComDecom() {
    const [produits, setProduits] = useState([]);
    const [filteredProduits, setFilteredProduits] = useState([]);

    // États pour chaque critère de filtre
    const [filterClient, setFilterClient] = useState('');
    const [filterProduit, setFilterProduit] = useState('');
    const [filterReference, setFilterReference] = useState('');
    const [filterUnite, setFilterUnite] = useState('');
    const [filterQuantite, setFilterQuantite] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        // Effectuer la requête pour récupérer les données des commandes décomposées
        axios.get("/api/commandes/commandeDecomposees")
            .then((response) => {
                // Mettre les produits dans le state
                setProduits(response.data.produits);
                setFilteredProduits(response.data.produits); // Afficher initialement tous les produits
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération des données:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Impossible de récupérer les commandes décomposées.",
                });
            });
    }, []);

    // Fonction pour filtrer les produits
    const handleFilterChange = () => {
        const filteredData = produits.filter((produit) =>
            produit.client.toLowerCase().includes(filterClient.toLowerCase()) &&
            produit.produit.toLowerCase().includes(filterProduit.toLowerCase()) &&
            produit.referenceFacture.toLowerCase().includes(filterReference.toLowerCase()) &&
            produit.unite.toLowerCase().includes(filterUnite.toLowerCase()) &&
            produit.quantite.toString().includes(filterQuantite) &&
            produit.dateCommande.toLowerCase().includes(filterDate.toLowerCase())
        );

        setFilteredProduits(filteredData);
    };

    // Mettre à jour les produits chaque fois qu'un champ change
    useEffect(() => {
        handleFilterChange();
    }, [filterClient, filterProduit, filterReference, filterUnite, filterQuantite, filterDate]);

    const handlePrint = () => {
        const printContent = document.getElementById("table-to-print").outerHTML;
        const printWindow = window.open('', '', 'height=500,width=800');
        printWindow.document.write('<html><head><title>Impression des commandes avancer</title>');
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
        printWindow.document.write('<h1>Recherche de commande avancer</h1>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      };

    return (
        <>
            <main className="center">
                <Sidebar />
                <section className="contenue">
                    <Header />
                    <div className="p-3 content center">
                        <div className="mini-stat p-3">
                            <h6 className='alert alert-success'>Historique des commandes décomposées</h6>
                            <div className="row">
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Référence"
                                        value={filterReference}
                                        onChange={(e) => setFilterReference(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nom Client"
                                        value={filterClient}
                                        onChange={(e) => setFilterClient(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Produit"
                                        value={filterProduit}
                                        onChange={(e) => setFilterProduit(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Unité"
                                        value={filterUnite}
                                        onChange={(e) => setFilterUnite(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Quantité"
                                        value={filterQuantite}
                                        onChange={(e) => setFilterQuantite(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary w-25 m-2"  onClick={handlePrint}>Imprimer</button>
                            </div>

                            <div>
                                <table className="table-striped"  id="table-to-print">
                                    <thead>
                                        <tr>
                                            <th>Référence de Commande</th>
                                            <th>Client</th>
                                            <th>Produit</th>
                                            <th>Unité</th>
                                            <th>Quantité</th>
                                            <th>Date de Commande</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProduits.length > 0 ? (
                                            filteredProduits.map((produit, index) => (
                                                <tr key={index}>
                                                    <td>{produit.referenceFacture}</td>
                                                    <td>{produit.client}</td>
                                                    <td>{produit.produit}</td>
                                                    <td>{produit.unite}</td>
                                                    <td>{produit.quantite}</td>
                                                    <td>{produit.dateCommande}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    Aucune commande décomposée trouvée.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default HistoComDecom;

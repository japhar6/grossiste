import React, { useEffect, useState } from "react";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/Histov.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function HistoRistourne() {
    const [fonds, setFonds] = useState([]);
    const [filters, setFilters] = useState({
        fournisseur: "",
        typeRistourne: "",
        dateAchat: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/fondRistourne/fonds");
                console.log(response.data); // Ajoutez ce log pour vérifier la structure des données
                setFonds(response.data);
            } catch (error) {
                Swal.fire("Erreur", "Échec de récupération des données", "error");
            }
        };
        fetchData();
    }, []);
    

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredFonds = fonds.filter(fond =>
        (filters.fournisseur === "" || fond.fournisseur.nom.toLowerCase().includes(filters.fournisseur.toLowerCase())) &&
        (filters.dateAchat === "" || new Date(fond.dateAchat).toISOString().split('T')[0] === filters.dateAchat)
    );

    const handlePrint = () => {
        const printContent = document.getElementById("table-to-print").outerHTML;
        const printWindow = window.open('', '', 'height=500,width=800');
        printWindow.document.write('<html><head><title>Impression des ristourne</title>');
        printWindow.document.write('<style>body{font-family:Arial,sans-serif;margin:20px;padding:0;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{padding:8px;text-align:left;border:1px solid #ddd;}th{background-color:#f4f4f4;}tr:nth-child(even){background-color:#f9f9f9;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Recherche de commande avancée</h1>');
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
                            <h6 className='alert text-white bg-success'>Historique des bénéfices ristourne</h6>
                            <div className="row">
                                <div className="col-md-2"><input type="text" className="form-control" placeholder="Fournisseur" name="fournisseur" onChange={handleFilterChange} /></div>
                                <div className="col-md-2"><input type="date" className="form-control" name="dateAchat" onChange={handleFilterChange} /></div>
                                <button className="btn btn-primary w-25 m-2" onClick={handlePrint}>Imprimer</button>
                            </div>
                            <div>
                                <table className="table-striped" id="table-to-print">
                                    <thead>
                                        <tr>
                                            <th>Fournisseur</th>
                                            <th>Bénéfice ristourne</th>
                                            <th>Date d'achat</th>
                                      
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFonds.map((fond, index) => (
                                            <tr key={index}>
                                                <td>{fond.fournisseur}</td>
                                                <td>{fond.montantRistourne} Ariary</td>
                                                <td>{new Date(fond.dateAchat).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}</td>
                                               
                                            </tr>
                                        ))}
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

export default HistoRistourne;

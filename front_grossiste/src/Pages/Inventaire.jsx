import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../Styles/Inventaire.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function VisualiserInventaires() {
  const [inventaires, setInventaires] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtreProduit, setFiltreProduit] = useState("");
  const [filtreEntrepot, setFiltreEntrepot] = useState("");
  const [filtreFournisseur, setFIltreFournisseur] = useState("");
  const [filtreRaison, setFiltreRaison] = useState("");
  const [filtreDate, setFiltreDate] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const nom = localStorage.getItem("nom");
  const [fournisseurs, setFournisseurs] = useState([]); 


  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {      
    try {
      const response = await axios.get("/api/fournisseurs/tous");
      setFournisseurs(response.data);
 
 
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs", error);
   
    }
  };



  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get("/api/entrepot");
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setEntrepots(data);
        } else {
        Swal.fire({
    title: "Info",
                                text: "Il n'y a pas encore de entrepot ! Veuillez en ajouter",
                                icon: "info",
                                confirmButtonText: "OK",
                            });
        }
      } catch (error) {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la récupération des entrepôts.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };

    fetchEntrepots();
  }, []);

  useEffect(() => {
    const fetchInventaires = async () => {
      try {
        const response = await axios.get(`/api/inventaire/inventaires`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventaires(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des inventaires.');
        setError('Erreur lors du chargement des inventaires.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventaires();
  }, [token, userId]);

  const filteredInventaires = inventaires.filter(inventaire => {
    const produitMatch = filtreProduit ? inventaire.produit.nom.toLowerCase().includes(filtreProduit.toLowerCase()) : true;
    const entrepotMatch = filtreEntrepot ? inventaire.entrepot.nom === filtreEntrepot : true;
    const fournisseurMatch = filtreFournisseur ? inventaire.produit.fournisseur.nom=== filtreFournisseur : true;
    const raisonMatch = filtreRaison ? inventaire.raisonAjustement.toLowerCase().includes(filtreRaison.toLowerCase()) : true;
    const dateMatch = filtreDate ? new Date(inventaire.dateInventaire).toLocaleDateString() === new Date(filtreDate).toLocaleDateString() : true;

    return produitMatch && entrepotMatch && raisonMatch && dateMatch &&fournisseurMatch;
  });

  const handlePrint = () => {
    const titre = () => {
      let parts = [];
      if (filtreProduit) parts.push(`Produit : ${filtreProduit}`);
      if (filtreEntrepot) parts.push(`Entrepôt : ${filtreEntrepot}`);
      if (filtreFournisseur) parts.push(`Fournisseur : ${filtreFournisseur}`);
      if (filtreRaison) parts.push(`Raison : ${filtreRaison}`);
      if (filtreDate) parts.push(` ${new Date(filtreDate).toLocaleDateString('fr-FR')}`);
      
      return parts.length > 0 ? `Inventaire du (${parts.join(' | ')})` : "Tous les inventaires";
    };
  
    const printContent = document.getElementById("table-to-print").outerHTML;
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Inventaires</title>');
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
    printWindow.document.write(`<h1>${titre()}</h1>`);
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  

  return (
    <>
      <ToastContainer />
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className="mini-stat p-3 content">
            <h5 className='alert alert-success'>
              <i className='fa fa-list'></i> Visualiser les Inventaires effectué par {nom}
            </h5>
            <Link to="/creerinventaire" className="btn btn-primary">
              Effectuer un inventaire
            </Link>
            <div className="filters mb-4 d-flex justify-content-between align-items-center">
              <select className="form-select me-2" value={filtreEntrepot} onChange={e => setFiltreEntrepot(e.target.value)}>
                <option value="">Filtrer par entrepôt</option>
                {entrepots.map(entrepot => (
                  <option key={entrepot._id} value={entrepot.nom}>{entrepot.nom}</option>
                ))}
              </select>
              <select className="form-select me-2" value={filtreFournisseur} onChange={e => setFIltreFournisseur(e.target.value)}>
                <option value="">Filtrer par Fournisseurs</option>
                {fournisseurs.map(entrepot => (
                  <option key={entrepot._id} value={entrepot.nom}>{entrepot.nom}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control me-2"
                value={filtreProduit}
                onChange={e => setFiltreProduit(e.target.value)}
                placeholder="Filtrer par nom de produit"
              />
              <input
                type="text"
                className="form-control me-2"
                value={filtreRaison}
                onChange={e => setFiltreRaison(e.target.value)}
                placeholder="Filtrer par raison d'ajustement"
              />
              <input
                type="date"
                className="form-control me-2"
                value={filtreDate}
                onChange={e => setFiltreDate(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handlePrint}>Imprimer</button>
            </div>

            {loading ? (
              <p>Chargement des inventaires...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table id="table-to-print" className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th className="bg-success">Entrepot</th>
                        <th>Produit</th>
                        <th className="bg-success">Fournisseur</th>
                        <th className="bg-success">Quantité Initiale</th>
                        <th>Quantité Finale</th>
                        <th className="bg-success">Quantité perdu</th>
                        <th>Raison d'Ajustement</th>
                        <th className="bg-success">Date de Création</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventaires.map(inventaire => (
                        <tr key={inventaire._id}>
                          <td>{inventaire.entrepot ? inventaire.entrepot.nom : 'Entrepot non disponible'}</td>
                          <td>{inventaire.produit ? inventaire.produit.nom : 'Produit non disponible'}</td>
                          <td>{inventaire.produit ? inventaire.produit.fournisseur.nom : 'Fournisseur non disponible'}</td>
                          <td>{inventaire.quantitéInitiale}</td>
                          <td>{inventaire.quantitéFinale}</td>
                          <td>{inventaire.quantitéInitiale - inventaire.quantitéFinale}</td>
                          <td>{inventaire.raisonAjustement}</td>
                          <td>{new Date(inventaire.dateInventaire).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default VisualiserInventaires;

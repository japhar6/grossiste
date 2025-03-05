import React, { useState, useEffect } from 'react';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import axios from '../api/axios'; // Import de l'instance axios configurée

const HistoriqueDecaissementPage = () => {
  // État pour stocker les décaissements et les filtres
  const [historique, setHistorique] = useState([]);
  const [filter, setFilter] = useState({
    periode: '',
    mode: '',
    date: '', // Ajout de l'état pour la date de filtre
  });

  // Récupérer les décaissements depuis l'API
  const fetchDecaissements = async () => {
    try {
      const response = await axios.get('/api/decaissement/afficher'); // Utilisation de l'URL relative
      setHistorique(response.data.decaissements); // Assurez-vous que la réponse contient un tableau de décaissements
    } catch (error) {
      console.error("Erreur lors de la récupération des décaissements", error);
    }
  };

  // Filtrer les décaissements selon les critères
  const filteredHistorique = historique.filter((decaissement) => {
    const { periode, mode, date } = filter;

    if (periode && decaissement.periode !== periode) {
      return false;
    }
    if (mode && decaissement.mode !== mode) {
      return false;
    }
    if (date && new Date(decaissement.dateDecaissement).toLocaleDateString() !== new Date(date).toLocaleDateString()) {
      return false;
    }

    return true;
  });

  // Utiliser useEffect pour charger les données au démarrage du composant
  useEffect(() => {
    fetchDecaissements();
  }, []);

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <div className="">
              <h1 className="mb-4">Historique des Décaissements</h1>

              {/* Tableau affichant l'historique des décaissements */}
              <div className="table-responsive">
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Période</th>
                        <th>Mode</th>

                        <th>Référence</th>
                        <th>Fait par</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historique.length > 0 ? (
                        historique.map((decaissement) => (
                          <tr key={decaissement.id}>
                            <td>{new Date(decaissement.date).toLocaleDateString()}</td>
                            <td>{decaissement.montant}€</td>
                            <td>{decaissement.periode}</td>
                            <td>{decaissement.mode}</td>
                            <td>{decaissement.reference || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">Aucun décaissement effectué.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div></div>
      </section>
    </main>
  );
};

export default HistoriqueDecaissementPage;

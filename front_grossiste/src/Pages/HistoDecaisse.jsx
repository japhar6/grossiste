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
            <h1 className="mb-4">Historique des Décaissements</h1>

            {/* Formulaire de filtrage */}
            <div className="filter-form mb-3 center">
              <select
                id="periode"
                className="form-control"
                value={filter.periode}
                onChange={(e) => setFilter({ ...filter, periode: e.target.value })}
              >
                <option value="">Filtrage par période</option>
                <option value="journalier">Jour</option>
                <option value="hebdomadaire">Semaine</option>
                <option value="mensuel">Mois</option>
                <option value="annuel">Année</option>
              </select>

              <select
                id="mode"
                className="form-control"
                value={filter.mode}
                onChange={(e) => setFilter({ ...filter, mode: e.target.value })}
              >
                <option value="">Filtrage par mode de paiement</option>
                <option value="virement bancaire">Virement bancaire</option>
                <option value="espèce">Espèce</option>
                <option value="mobile money">Mobile Money</option>
              </select>

              {/* Champ de recherche par date */}
              <input
                type="date"
                id="date"
                className="form-control"
                value={filter.date}
                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              />
            </div>

            {/* Tableau affichant l'historique des décaissements */}
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Période</th>
                    <th>Mode</th>
                    <th>Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistorique.length > 0 ? (
                    filteredHistorique.map((decaissement) => (
                      <tr key={decaissement._id}>
                        {/* Affichage de la date sous un format lisible */}
                        <td>{new Date(decaissement.dateDecaissement).toLocaleDateString()}</td>
                        <td>{decaissement.montant} Ariary</td>
                        <td>{decaissement.periode}</td>
                        <td>{decaissement.mode}</td>
                        <td>{decaissement.referencePaiement || '-'}</td>
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
      </section>
    </main>
  );
};

export default HistoriqueDecaissementPage;

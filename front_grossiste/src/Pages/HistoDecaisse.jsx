import React from 'react';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

const HistoriqueDecaissementPage = () => {
  // Données fictives pour l'exemple
  const historique = [
    {
      id: 1,
      date: '2025-03-01',
      montant: 500,
      periode: 'Jour',
      mode: 'Retrait en espèces',
      reference: '-',
    },
    {
      id: 2,
      date: '2025-02-20',
      montant: 1000,
      periode: 'Semaine',
      mode: 'Virement bancaire',
      reference: 'REF123456',
    },
    {
      id: 3,
      date: '2025-01-15',
      montant: 250,
      periode: 'Jour',
      mode: 'Retrait en espèces',
      reference: '-',
      nom: '-',
    },
  ];

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue ">
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

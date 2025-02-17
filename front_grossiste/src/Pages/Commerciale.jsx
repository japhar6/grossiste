import React from 'react';
import "../Styles/Commerciale.css";
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';

const tauxCommission = 0.1; // Commission de 10% sur chaque vente

const commerciaux = [
  {
    id: 1,
    nom: 'Jean Dupont',
    statut: 'Actif',
    telephone: '0123456789',
    ventes: [
      { produit: 'Produit A', quantite: 10, montant: 200, date: '2025-02-12' },
      { produit: 'Produit B', quantite: 5, montant: 100, date: '2025-02-13' }
    ],
    retours: [
      { produit: 'Produit A', quantite: 2, raison: 'Défectueux', date: '2025-02-14' }
    ]
  },
  {
    id: 2,
    nom: 'Marie Martin',
    statut: 'Inactif',
    telephone: '0987654321',
    ventes: [
      { produit: 'Produit C', quantite: 15, montant: 300, date: '2025-02-12' }
    ],
    retours: []
  }
];

const calculerCommission = (ventes) => {
  return ventes.reduce((total, vente) => {
    return total + vente.quantite * vente.montant * tauxCommission;
  }, 0);
};

const GestionCommerciaux = () => {
  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h2>Gestion des Commerciaux</h2>

          {/* Tableau des commerciaux */}
          <table className="table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Statut</th>
                <th>Téléphone</th>
                <th>Ventes</th>
                <th>Retours</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              {commerciaux.map((commercial) => (
                <tr key={commercial.id}>
                  <td>{commercial.nom}</td>
                  <td>{commercial.statut}</td>
                  <td>{commercial.telephone}</td>
                  <td>
                    {commercial.ventes.length === 0 ? (
                      <span>Aucune vente</span>
                    ) : (
                      <ul>
                        {commercial.ventes.map((vente, index) => (
                          <li key={index}>
                            {vente.produit} ({vente.quantite} x {vente.montant}€) - {vente.date}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>
                    {commercial.retours.length === 0 ? (
                      <span>Aucun retour</span>
                    ) : (
                      <ul>
                        {commercial.retours.map((retour, index) => (
                          <li key={index}>
                            {retour.produit} ({retour.quantite} retourné) - Raison : {retour.raison} - {retour.date}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>{calculerCommission(commercial.ventes).toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default GestionCommerciaux;
    
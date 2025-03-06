import React, { useState, useEffect } from 'react';
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import axios from '../api/axios';
import Swal from 'sweetalert2';

const DecaissementPage = () => {
  const [periode, setPeriode] = useState('Total');
  const [soldeCaisse, setSoldeCaisse] = useState(0);
  const [nombrePaiements, setNombrePaiements] = useState(0);
  const [montant, setMontant] = useState('');
  const [modePaiement, setModePaiement] = useState('espèce');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [error, setError] = useState(null);

  const fetchTotalPaiements = async (periode) => {
    setError(null);
    try {
      const response = await axios.get(`/api/fondcaisse/totals/${periode}`);
      const { totalFondCaisse, nombrePaiementsFondCaisse } = response.data;
      setSoldeCaisse(totalFondCaisse);
      setNombrePaiements(nombrePaiementsFondCaisse);
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
    }
  };

  useEffect(() => {
    fetchTotalPaiements(periode);
  }, [periode]);

  const handleDecaissement = async () => {
    setError(null);
    if (!montant || montant <= 0) {
      setError('Le montant doit être supérieur à 0.');
      return;
    }

    if (modePaiement !== 'espèce' && !referencePaiement) {
      setError('La référence de paiement est obligatoire pour ce mode de paiement.');
      return;
    }

    try {
      const response = await axios.post('/api/decaissement/ajouter', {
        periode,
        montantDecaisse: Number(montant),
        modePaiement,
        referencePaiement: modePaiement !== 'espèce' ? referencePaiement : undefined
      });

      // Utilisation de SweetAlert pour afficher le message
      Swal.fire({
        title: 'Succès',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK'
      });

      fetchTotalPaiements(periode);
      setMontant('');
      setModePaiement('espèce');
      setReferencePaiement('');
    } catch (error) {
      console.error('Erreur lors du décaissement:', error);
      Swal.fire({
        title: 'Erreur',
        text: error.response?.data?.message || 'Erreur lors du décaissement.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setError(error.response?.data?.message || 'Erreur lors du décaissement.');
    }
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="mini-stat p-4">
          <h1 className="text-center mb-4">Décaissement Caisse</h1>

          <div className="card-body">
            <div className="mb-3">
              <h4>Solde actuel : {`${soldeCaisse} Ariary`}</h4>
              <p>Nombre de paiements effectués : {nombrePaiements}</p>
              <p>Vous pouvez voir le solde de la caisse en fonction de la période sélectionnée.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label htmlFor="periode">Période :</label>
              <select
                id="periode"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="form-select"
              >
                <option value="Total">Total fond de caisse</option>
                <option value="journalier">Jour</option>
                <option value="hebdomadaire">Semaine</option>
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="montant">Montant :</label>
              <input
                type="number"
                id="montant"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="form-control"
                placeholder="Montant du décaissement"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modePaiement">Mode de paiement :</label>
              <select
                id="modePaiement"
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="form-select"
              >
                <option value="espèce">Espèce</option>
                <option value="virement bancaire">Virement bancaire</option>
                <option value="mobile money">Mobile Money</option>
              </select>
            </div>

            {modePaiement !== 'espèce' && (
              <div className="form-group">
                <label htmlFor="referencePaiement">Référence de paiement :</label>
                <input
                  type="text"
                  id="referencePaiement"
                  value={referencePaiement}
                  onChange={(e) => setReferencePaiement(e.target.value)}
                  className="form-control"
                  placeholder="Référence du paiement"
                />
              </div>
            )}

            <button onClick={handleDecaissement} className="btn btn-primary w-100">Effectuer le décaissement</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DecaissementPage;

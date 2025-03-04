import React, { useState } from 'react';
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";

const DecaissementPage = () => {
  const [montantDecaissement, setMontantDecaissement] = useState('');
  const [periode, setPeriode] = useState('jour');
  const [modeDecaissement, setModeDecaissement] = useState('retrait');
  const [reference, setReference] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Solde actuel de la caisse (valeur statique pour l'instant)
  const soldeCaisse = 0;

  // Fonction pour simuler un décaissement
  const handleSubmit = (e) => {
    e.preventDefault();

    if (parseFloat(montantDecaissement) > soldeCaisse) {
      setMessage('Le montant de décaissement dépasse le solde disponible.');
      setMessageType('error');
      return;
    }

    if (modeDecaissement === 'virement' && !reference) {
      setMessage('Veuillez fournir une référence pour le virement bancaire.');
      setMessageType('error');
      return;
    }

    const nouveauSolde = soldeCaisse - parseFloat(montantDecaissement);
    setMessage(`Décaissement effectué avec succès ! Nouveau solde : ${nouveauSolde}€`);
    setMessageType('success');
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="mini-stat p-4">
          <h1 className="title">Décaissement Caisse</h1>

          {/* Affichage du solde de la caisse */}
          <div className="solde-box">
            <h2>Solde actuel : {soldeCaisse}€</h2>
            <p>Vous pouvez effectuer un décaissement selon vos besoins.</p>
          </div>

          {/* Formulaire de décaissement */}
          <form onSubmit={handleSubmit} className="decaissement-form">
            <div className="form-group">
              <label htmlFor="montant">Montant à décaisser :</label>
              <input
                id="montant"
                type="number"
                value={montantDecaissement}
                onChange={(e) => setMontantDecaissement(e.target.value)}
                required
                className="form-input"
                placeholder="Entrez le montant"
              />
            </div>

            <div className="form-group">
              <label htmlFor="periode">Période :</label>
              <select
                id="periode"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="form-select"
              >
                <option value="jour">Jour</option>
                <option value="semaine">Semaine</option>
                <option value="personnalise">Personnalisé</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="mode">Mode de décaissement :</label>
              <select
                id="mode"
                value={modeDecaissement}
                onChange={(e) => setModeDecaissement(e.target.value)}
                className="form-select"
              >
                <option value="retrait">Retrait en espèces</option>
                <option value="virement">Virement bancaire</option>
              </select>
            </div>

            {/* Référence de virement */}
            {modeDecaissement === 'virement' && (
              <div className="form-group">
                <label htmlFor="reference">Référence du virement :</label>
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="form-input"
                  placeholder="Référence du virement"
                />
              </div>
            )}

            {/* Date personnalisée si sélectionnée */}
            {periode === 'personnalise' && (
              <>
                <div className="form-group">
                  <label htmlFor="dateDebut">Date de début :</label>
                  <input
                    id="dateDebut"
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateFin">Date de fin :</label>
                  <input
                    id="dateFin"
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="form-input"
                  />
                </div>
              </>
            )}

            <button type="submit" className="form-button">Effectuer le décaissement</button>
          </form>

          {/* Message de résultat */}
          {message && (
            <div className={`message-box ${messageType}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default DecaissementPage;

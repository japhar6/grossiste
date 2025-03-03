import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/NavbarM";

function ChiffreAffaire() {
  return (
    <main className="d-flex">
      <Sidebar />
      <section className="flex-grow-1">
        <Header />
        <div className="container-fluid mt-4">
          <div className="row">
            <div className="col">
              <h2 className="text-primary">
                <i className="fa fa-chart-bar"></i> Chiffre d'affaire
              </h2>
            </div>
          </div>

          <div className="row my-4">
            <div className="col-md-4 center">
              <select className="form-control m-3">
                <option value="">Journalier</option>
                <option value="">Hebdomadaire</option>
                <option value="">Mensuel</option>
                <option value="">Annuel</option>
                <option value="">Global</option>
              </select>
              <button className="btn btn-primary m-3">Afficher</button>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">💰 Total Paiements</h5>
                  <p className="display-6 text-success">0 FCFA</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">💸 Total Dépenses</h5>
                  <p className="display-6 text-danger">0 FCFA</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card text-center shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">📈 Bénéfice Net</h5>
                  <p className="display-6 text-warning">0 FCFA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ChiffreAffaire;
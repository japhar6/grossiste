import React, { useState } from "react";
import "../Styles/Personnels.css"; 
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function Fournisseur() {
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ristourne, setRistourne] = useState("");
  const [logo, setLogo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFournisseur = {
      nom,
      type,
      contact: {
        telephone,
        email,
        adresse,
      },
      conditions: {
        ristourne: type === "ristourne" ? parseFloat(ristourne) || 0 : 0,
      },
      logo,
    };
    console.log("Fournisseur ajouté :", newFournisseur);
  };

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-info">
                <i className="fa fa-truck"></i> Liste des Fournisseurs
              </h6>
		     <div className="filtrage bg-light p-3 mt-3">
                <h6 className="fw-bold">
                  <i className="fa fa-search"></i> Filtrage
                </h6>
                <form className="center">
                  <input
                    type="text"
                    className="form-control p-2 mt-3  m-2"
                    placeholder="Recherche ..."
                  
                  />
                  <select
                    className="form-control mt-3 m-2 p-2"
              
                  >
                    <option value="">Tout</option>
                    <option value="magasinier">Prix libre</option>
                    <option value="caissier">Ristourne</option>
                
                  </select>
                </form>
              </div>
              <div className="consultation">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Ajouter dynamiquement les fournisseurs ici */}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ajoutPersonnel p-3">
              <h6 className="alert alert-info">
                <i className="fa fa-plus"></i> Ajouter un Fournisseur
              </h6>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="bg-light p-4">
                  <div className="mb-3">
                    <label>Nom du Fournisseur</label>
                    <input type="text" className="form-control" required value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Type</label>
                    <select className="form-control" required value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="">Sélectionner un type</option>
                      <option value="prix_libre">Prix Libre</option>
                      <option value="ristourne">Ristourne</option>
                    </select>
                  </div>
                  {type === "ristourne" && (
                    <div className="mb-3">
                      <label>Ristourne (%)</label>
                      <input type="number" className="form-control" value={ristourne} onChange={(e) => setRistourne(e.target.value)} />
                    </div>
                  )}
                  <div className="mb-3">
                    <label>Téléphone</label>
                    <input type="text" className="form-control" required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Adresse</label>
                    <input type="text" className="form-control" required value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Logo</label>
                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
                  </div>
                  <button className="btn btn-success" type="submit">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Fournisseur;

import React, { useState, useEffect } from "react";
import "../Styles/Produit.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import axios from "axios";

function ListeProduits() {



  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue2">
          <Header />
          <div className="p-3 content center">
        
            <div className="mini-stat p-3">

              <h6 className="alert alert-info">
                <i className="fa fa-box"></i> Liste des Produits
              </h6>
              <div className="filtrage bg-light p-3 mt-3">
                <h6 className="fw-bold">
                  <i className="fa fa-search"></i> Filtrage
                </h6>
                <form className="center">
                  <input
                    type="text"
                    className="form-control p-2 mt-3 m-2"
                    placeholder="Recherche ..."
                 
                  />
                  <select
                    className="form-control mt-3 m-2 p-2"
                 
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="Alimentaire">Alimentaire</option>
                    <option value="Électronique">Électronique</option>
                  </select>
                  <input
                    type="date"
                    className="form-control mt-3 m-2 p-2"
                  
                  />
                </form>
              </div>
              <div className="consultation">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Prix de Vente</th>
                      <th>Prix d'Achat</th>
                      <th>Catégorie</th>
                      <th>Date d'Ajout</th>
                    </tr>
                  </thead>
                  <tbody>
                 
           
                    
            
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

export default ListeProduits;

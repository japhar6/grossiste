import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import "../Styles/SortieStock.css";
import SortieStock from "../Components/SortieStock";

function SortieCommande() {

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-warehouse"></i> Magasinier
            </h6>
            <SortieStock/>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SortieCommande;

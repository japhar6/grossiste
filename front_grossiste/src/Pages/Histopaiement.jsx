// eslint-disable-next-line no-unused-vars
import  React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../Styles/Profile.css";
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";

function HistoC() {
 

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
       
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoC;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/Entrepot.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function Entrepot() {
  const [entrepots, setEntrepots] = useState([]);
  const [magasiniersDisponibles, setMagasiniersDisponibles] = useState([]);
  const [newEntrepot, setNewEntrepot] = useState({
    nom: "",
    localisation: "",
    type: "",
    magasinier: "",
  });
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/api/entrepot", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setEntrepots(response.data);
          const usedMagasiniers = response.data
            .map((entrepot) => entrepot.magasinier)
            .filter((magasinier) => magasinier !== null);

          axios
            .get("http://localhost:5000/api/users/tout", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((userResponse) => {
              const availableMagasiniers = userResponse.data.filter(
                (user) =>
                  user.role === "magasinier" &&
                  !usedMagasiniers.some(
                    (magasinier) => magasinier._id === user._id
                  )
              );
              setMagasiniersDisponibles(availableMagasiniers);
            })
            .catch((error) => {
              console.error("Erreur lors de la récupération des utilisateurs", error);
            });
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des entrepôts", error);
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Impossible de récupérer les entrepôts.",
          });
        });
    }
  }, []);

  const handleAddEntrepot = () => {
    if (!newEntrepot.nom || !newEntrepot.localisation || !newEntrepot.type || !newEntrepot.magasinier) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Veuillez remplir tous les champs." });
      return;
    }

    axios
      .post("http://localhost:5000/api/entrepot", newEntrepot, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEntrepots([...entrepots, response.data]);
        setNewEntrepot({ nom: "", localisation: "", type: "", magasinier: "" });
        Swal.fire({ icon: "success", title: "Entrepôt ajouté!", text: "L'entrepôt a été ajouté avec succès." });
        window.location.reload();
      })
      .catch((error) => {
        Swal.fire({ icon: "error", title: "Erreur", text: "Une erreur est survenue lors de l'ajout de l'entrepôt." });
      });

  };
  
  
  const handleSupprimer = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez Supprimer cette entrepot . Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, Supprimer!',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
       
        await axios.delete(`http://localhost:5000/api/entrepot/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire('Supprimé!', 'L\'entrepot a été supprimé.', 'success').then(window.location.reload());

    
      } catch (error) {
        console.error("Erreur de suppression", error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression.', 'error');
      }
    }
  };


  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="row">
            <div className="col-md-4">
              <div className="ajoutEntrepot p-3 border rounded">
                <h6 className="alert alert-info">
                  <i className="fa fa-plus"></i> Ajouter un Entrepôt
                </h6>
                <input type="text" placeholder="Nom de l'entrepôt" value={newEntrepot.nom} onChange={(e) => setNewEntrepot({ ...newEntrepot, nom: e.target.value })} className="form-control mb-3" />
                <input type="text" placeholder="Localisation" value={newEntrepot.localisation} onChange={(e) => setNewEntrepot({ ...newEntrepot, localisation: e.target.value })} className="form-control mb-3" />
                <select className="form-control mb-3" value={newEntrepot.type} onChange={(e) => setNewEntrepot({ ...newEntrepot, type: e.target.value })}>
                  <option value="">Sélectionnez un type</option>
                  <option value="principal">Principal</option>
                  <option value="secondaire">Secondaire</option>
                </select>
                <select className="form-control mb-3" value={newEntrepot.magasinier} onChange={(e) => setNewEntrepot({ ...newEntrepot, magasinier: e.target.value })}>
                  <option value="">Sélectionnez un magasinier</option>
                  {magasiniersDisponibles.length === 0 ? (
                    <option disabled>Aucun magasinier disponible</option>
                  ) : (
                    magasiniersDisponibles.map((magasinier) => (
                      <option key={magasinier._id} value={magasinier._id}>{magasinier.nom}</option>
                    ))
                  )}
                </select>
                <button className="btn1 btn1-success" onClick={handleAddEntrepot}>Ajouter</button>
              </div>
            </div>
            <div className="col-md-8">
              <div className="mini-stat p-3">
                <h6 className="alert alert-info">
                  <i className="fa fa-warehouse"></i> Liste des Entrepôts
                </h6>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Localisation</th>
                      <th>Type</th>
                      <th>Responsable</th>
                      <th>Date de création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrepots.map((entrepot) => (
                      <tr key={entrepot._id}>
                        <td>{entrepot.nom}</td>
                        <td>{entrepot.localisation}</td>
                        <td>{entrepot.type}</td>
                        <td>{entrepot.magasinier ? entrepot.magasinier.nom : "Aucun magasinier assigné"}</td>
                        <td>{entrepot.dateCreation}</td>
                        <td>
                          <button className="btn btn-warning ms-2">Modifier</button>
                          <button className="btn btn-danger ms-2"  onClick={() => handleSupprimer(entrepot._id)} >Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Entrepot;

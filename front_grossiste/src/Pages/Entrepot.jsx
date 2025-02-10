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
            .catch((error) => console.error("Erreur utilisateurs", error));
        })
        .catch((error) => {
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

        Swal.fire({ icon: "success", title: "Entrepôt ajouté!", text: "Ajout réussi." });
        window.location.reload();
      })
      .catch((error) => {
        Swal.fire({ icon: "error", title: "Erreur", text: "Erreur d'ajout." });
      });
  };

  const handleDeleteEntrepot = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:5000/api/entrepot/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            setEntrepots(entrepots.filter((entrepot) => entrepot._id !== id));
            Swal.fire("Supprimé!", "Entrepôt supprimé.", "success");
            window.location.reload();
          })
          .catch((error) => {
            Swal.fire("Erreur!", "Suppression échouée.", "error");
          });
      }
    });
  };

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="entrepot-container">
              {/* Tableau des entrepôts */}
              <div className="entrepot-table-container">
                <h6 className="alert alert-info">
                  <i className="fa fa-warehouse"></i> Liste des Entrepôts
                </h6>
                <table className="entrepot-table">
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
                        <td>{entrepot.magasinier ? entrepot.magasinier.nom : "Aucun"}</td>
                        <td>{entrepot.dateCreation}</td>
                        <td>
                          <button className="btn btn-warning ms-2">Modifier</button>
                          <button
                            className="btn btn-danger ms-2"
                            onClick={() => handleDeleteEntrepot(entrepot._id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Formulaire d'ajout */}
              <div className="entrepot-form-container">
                <h6 className="alert alert-info">
                  <i className="fa fa-plus"></i> Ajouter un Entrepôt
                </h6>
                <input
                  type="text"
                  placeholder="Nom de l'entrepôt"
                  value={newEntrepot.nom}
                  onChange={(e) => setNewEntrepot({ ...newEntrepot, nom: e.target.value })}
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Localisation"
                  value={newEntrepot.localisation}
                  onChange={(e) => setNewEntrepot({ ...newEntrepot, localisation: e.target.value })}
                  className="form-control"
                />
                <select
                  className="form-control"
                  value={newEntrepot.type}
                  onChange={(e) => setNewEntrepot({ ...newEntrepot, type: e.target.value })}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="principal">Principal</option>
                  <option value="secondaire">Secondaire</option>
                </select>
                <select
                  className="form-control"
                  value={newEntrepot.magasinier}
                  onChange={(e) => setNewEntrepot({ ...newEntrepot, magasinier: e.target.value })}
                >
                  <option value="">Sélectionnez un magasinier</option>
                  {magasiniersDisponibles.length === 0 ? (
                    <option disabled>Aucun magasinier disponible</option>
                  ) : (
                    magasiniersDisponibles.map((magasinier) => (
                      <option key={magasinier._id} value={magasinier._id}>
                        {magasinier.nom}
                      </option>
                    ))
                  )}
                </select>
                <button className="btn btn-success" onClick={handleAddEntrepot}>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Entrepot;

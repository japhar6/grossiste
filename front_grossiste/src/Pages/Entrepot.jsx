import React, { useState, useEffect, useRef } from "react";
import axios from '../api/axios';
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
  const [editingEntrepotId, setEditingEntrepotId] = useState(null);
  const nomInputRef = useRef(null);
  // États de chargement
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {

    if (token) {
      setLoadingEntrepots(true);
      axios
        .get("/api/entrepot", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setEntrepots(response.data);
          setLoadingEntrepots(false);
        })
        .catch((error) => {
          console.error("Erreur chargement entrepôts", error);
          setLoadingEntrepots(false);
        });
      setLoadingMagasiniers(true);
      // Récupérer tous les magasiniers sans filtre
      axios
        .get("/api/users/tout", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((userResponse) => {
          const availableMagasiniers = userResponse.data.filter(
            (user) => user.role === "magasinier"
          );
          setMagasiniersDisponibles(availableMagasiniers);
          setLoadingMagasiniers(false);

        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des utilisateurs", error);
          setLoadingMagasiniers(false);
        });


    }
  }, [token]);

  const handleAddOrUpdateEntrepot = () => {
    if (!newEntrepot.nom || !newEntrepot.localisation || !newEntrepot.type || !newEntrepot.magasinier) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Veuillez remplir tous les champs." });
      return;
    }
    setLoadingAction(true);
    const request = editingEntrepotId
      ? axios.put(`/api/entrepot/${editingEntrepotId}`, newEntrepot, {
        headers: { Authorization: `Bearer ${token}` },
      })
      : axios.post("/api/entrepot", newEntrepot, {
        headers: { Authorization: `Bearer ${token}` },
      });

    request
      .then((response) => {
        setEntrepots((prev) =>
          editingEntrepotId
            ? prev.map((entrepot) => (entrepot._id === editingEntrepotId ? response.data : entrepot))
            : [...prev, response.data]
        );
        setNewEntrepot({ nom: "", localisation: "", type: "", magasinier: "" });
        setEditingEntrepotId(null);
        setLoadingAction(false); // Réinitialiser l'ID d'édition
        Swal.fire({
          icon: "success",
          title: editingEntrepotId ? "Entrepôt modifié!" : "Entrepôt ajouté!",
          text: "L'entrepôt a été " + (editingEntrepotId ? "modifié" : "ajouté") + " avec succès."
        }).then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        setLoadingAction(false);
        Swal.fire({ icon: "error", title: "Erreur", text: "Une erreur est survenue lors de l'ajout ou de la modification de l'entrepôt." });
      });
  };

  const handleEdit = (entrepot) => {
    setNewEntrepot({
      nom: entrepot.nom,
      localisation: entrepot.localisation,
      type: entrepot.type,
      magasinier: entrepot.magasinier ? entrepot.magasinier._id : "",
    });
    setEditingEntrepotId(entrepot._id);
    nomInputRef.current.focus();
  };


  const handleSupprimer = async (entrepot) => {
     console.log("id",entrepot._id);
    const confirmDelete = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action ne peut pas être annulée.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (confirmDelete.isConfirmed) {
      try {
        console.log()
        await axios.delete(`/api/entrepot/${entrepot._id}`);
        Swal.fire("Supprimé!", "L'entrepot a été supprimé avec succès.", "success");
        
      } catch (error) {
        console.error("Erreur lors de la suppression du entrepot", error);
        Swal.fire("Erreur", "Une erreur est survenue lors de la suppression du entrepot.", "error");
      }
    }
  };
  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat">
            <h6 className="alert alert-info">
              <i className="fa fa-warehouse"></i> Liste des Entrepôts
            </h6>
            {loadingEntrepots ? (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : (
              <div className="consultatio">
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
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
                          <td>{new Date(entrepot.dateCreation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</td>
                          <td>
                            <button className="btn1 btn-warning" onClick={() => handleEdit(entrepot)}>

                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button className="btn1 btn-danger ms-2" onClick={() => handleSupprimer(entrepot)}>
                              <i className="fas fa-times"
                              onClick={() => handleSupprimer(entrepot)}
                                  title="Supprimer"
                              ></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="ajoutPersonnel">
            <h6 className="alert alert-info">
              <i className="fa fa-plus"></i> {editingEntrepotId ? "Modifier un Entrepôt" : "Ajouter un Entrepôt"}
            </h6>
            <input
              type="text"
              placeholder="Nom de l'entrepôt"
              value={newEntrepot.nom}
              onChange={(e) => setNewEntrepot({ ...newEntrepot, nom: e.target.value })}
              className="form-control mb-3"
              ref={nomInputRef}
            />
            <input
              type="text"
              placeholder="Localisation"
              value={newEntrepot.localisation}
              onChange={(e) => setNewEntrepot({ ...newEntrepot, localisation: e.target.value })}
              className="form-control mb-3"
            />
            <select
              className="form-control mb-3"
              value={newEntrepot.type}
              onChange={(e) => setNewEntrepot({ ...newEntrepot, type: e.target.value })}>
              <option value="">Sélectionnez un type</option>
              <option value="principal">Principal</option>
              <option value="secondaire">Secondaire</option>
            </select>
            <select
              className="form-control mb-3"
              value={newEntrepot.magasinier}
              onChange={(e) => setNewEntrepot({ ...newEntrepot, magasinier: e.target.value })}>
              <option value="">Sélectionnez un magasinier</option>
              {magasiniersDisponibles.length === 0 ? (
                <option disabled>Aucun magasinier disponible</option>
              ) : (
                magasiniersDisponibles.map((magasinier) => (
                  <option key={magasinier._id} value={magasinier._id}>{magasinier.nom}</option>
                ))
              )}
            </select>
            <button className="btn15 btn1-success" onClick={handleAddOrUpdateEntrepot} disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <span className="spinner-border " style={{ width: '4rem', height: '4rem' }}></span> Chargement...
                </>
              ) : (
                editingEntrepotId ? "Modifier" : "Ajouter"
              )}
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Entrepot;

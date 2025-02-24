import React, { useState, useEffect, useRef } from "react"; // Ajoutez useRef ici
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
  const [editingEntrepotId, setEditingEntrepotId] = useState(null); // État pour l'entrepôt à modifier
  const nomInputRef = useRef(null); // Référence pour le champ de saisie "Nom"

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      axios
        .get("https://api.bazariko.duckdns.org/api/entrepot", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setEntrepots(response.data);
          const usedMagasiniers = response.data
            .map((entrepot) => entrepot.magasinier)
            .filter((magasinier) => magasinier !== null);

          axios
            .get("https://api.bazariko.duckdns.org/api/users/tout", {
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
  }, [token]);

  const handleAddOrUpdateEntrepot = () => {
    if (!newEntrepot.nom || !newEntrepot.localisation || !newEntrepot.type || !newEntrepot.magasinier) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Veuillez remplir tous les champs." });
      return;
    }

    const request = editingEntrepotId
      ? axios.put(`https://api.bazariko.duckdns.org/api/entrepot/${editingEntrepotId}`, newEntrepot, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.post("https://api.bazariko.duckdns.org/api/entrepot", newEntrepot, {
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
        setEditingEntrepotId(null); // Réinitialiser l'ID d'édition
        Swal.fire({
          icon: "success",
          title: editingEntrepotId ? "Entrepôt modifié!" : "Entrepôt ajouté!",
          text: "L'entrepôt a été " + (editingEntrepotId ? "modifié" : "ajouté") + " avec succès."
        }).then(() => {
          window.location.reload(); // Recharger la page après avoir cliqué sur OK
        });
      })
      .catch((error) => {
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
    setEditingEntrepotId(entrepot._id); // Définir l'ID de l'entrepôt à modifier
    nomInputRef.current.focus(); // Mettre le focus sur le champ "Nom"
  };

  const handleSupprimer = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez Supprimer cet entrepôt. Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, Supprimer!',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
       
        await axios.delete(`https://api.bazariko.duckdns.org/api/entrepot/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire('Supprimé!', 'L\'entrepôt a été supprimé.', 'success').then(() => {
          setEntrepots((prev) => prev.filter((entrepot) => entrepot._id !== id)); // Met à jour la liste des entrepôts
        });

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
          <div className="mini-stat ">
            <h6 className="alert alert-info">
              <i className="fa fa-warehouse"></i> Liste des Entrepôts
            </h6>
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
                        <td>{entrepot.dateCreation}</td>
                        <td>
                          <button className="btn btn-warning ms-2" onClick={() => handleEdit(entrepot)}>Modifier</button>
                          <button className="btn btn-danger ms-2" onClick={() => handleSupprimer(entrepot._id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              ref={nomInputRef} // Ajoutez la référence ici
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
            <button className="btn1 btn1-success" onClick={handleAddOrUpdateEntrepot}>
              {editingEntrepotId ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Entrepot;

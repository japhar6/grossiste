import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/Personnels.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { Modal, Button } from "react-bootstrap";

function Personnels() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Modal pour la modification

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Aucun token trouvé !");
          return;
        }
  
        const response = await axios.get("http://localhost:5000/api/users/tout/", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Décodez le token pour obtenir l'ID de l'admin connecté
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = decodedToken.userId;  // Assurez-vous que votre token contient l'ID de l'utilisateur
  
        // Filtrer les utilisateurs pour exclure l'admin connecté
        const filteredUsers = response.data.filter(user => user._id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Erreur de récupération des utilisateurs", error.response?.data || error.message);
      }
    };
  
    fetchUsers();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Les mots de passe ne correspondent pas !",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (photo) formData.append("photo", photo);

      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:5000/api/users/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Utilisateur ajouté avec succès !",
      });

      setUsers([...users, response.data.user]);
      setNom("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setPhoto(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Échec de l'ajout de l'utilisateur !",
      });
    }
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Fonction pour "Licencier" un utilisateur
  const handleLicencier = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez licencier cet utilisateur. Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, licencier!',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        // Appel de l'API pour supprimer l'utilisateur
        await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Mettre à jour la liste des utilisateurs après la suppression
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== selectedUser._id));

        // Notification de succès
        Swal.fire('Licencié!', 'L\'utilisateur a été mis dehors.', 'success');
        setShowModal(false); // Ferme le modal après suppression
      } catch (error) {
        console.error("Erreur de suppression", error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression.', 'error');
      }
    }
  };

  const handleEdit = () => {
    // Initialiser les champs avec les valeurs de l'utilisateur sélectionné
    setNom(selectedUser.nom);
    setEmail(selectedUser.email);
    setRole(selectedUser.role);
    setPhoto(selectedUser.photo);

    setShowEditModal(true);
    setShowModal(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    // Créer un nouvel objet FormData
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('email', email);
    formData.append('role', role);
    if (photo) formData.append('photo', photo);
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      Swal.fire("Succès", "L'utilisateur a été modifié avec succès !", "success")
        .then(() => {
          setUsers(
            users.map((user) =>
              user._id === selectedUser._id ? response.data : user
            )
          );
          setShowEditModal(false);
          window.location.reload(); 
        });
    } catch (error) {
      Swal.fire("Erreur", "Une erreur s'est produite lors de la modification.", "error");
    }
  };
  
  
  const filteredUsers = users.filter((user) =>
    (user.nom && user.nom.toLowerCase().includes(search.toLowerCase()) ||
     user.email && user.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === "" || user.role === roleFilter)
  );
  

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
                <i className="fa fa-line-chart"></i> Mini-statistique de vos personnels
              </h6>

              <div className="consultation">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Poste</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.nom}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button className="btn btn-success btn-sm m-1" onClick={() => handleShowDetails(user)}>
                            <i className="fa fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ajoutPersonnel p-3">
              <h6 className="alert alert-info">
                <i className="fa fa-users"></i> Ajouter un personnel
              </h6>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="bg-light p-4">
                  <div className="mb-3">
                    <label>Nom complet</label>
                    <input type="text" className="form-control" required value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Rôle</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="">Sélectionner un rôle</option>
                      <option value="magasinier">Magasinier</option>
                      <option value="caissier">Caissier</option>
                      <option value="vendeur">Vendeur (Réception)</option>
                      <option value="gestion_prix">Contrôleur de produit</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Mot de passe</label>
                    <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Confirmer le mot de passe</label>
                    <input type="password" className="form-control" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <div className="mb-3">
                  <label>Photo</label>
                    <input type="file" className="form-control" accept="image/*"
                      onChange={(e) => setPhoto(e.target.files[0])} />
                  
                  </div>
                  <button className="btn btn-success" type="submit">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Détails de l'utilisateur */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails de l'utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="user-card">
              <div className="photo-container">
                <img src={`http://localhost:5000${selectedUser.photo}`} alt="Photo de profil" className="user-photo" />
              </div>
              <div className="user-info">
                <p><strong>Nom:</strong> {selectedUser.nom}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Poste:</strong> {selectedUser.role}</p>
                <p><strong>Embauché le:</strong> {selectedUser.createdAt}</p>
                
                 <div className="d-flex justify-content-between w-100">

               <Button variant="warning" onClick={handleEdit} className="mt-3 mr-2">
                           <i className="fa fa-edit"></i> Modifier
                           </Button>

                       {selectedUser.role !== "admin" && (
                <Button variant="danger" onClick={handleLicencier} className="mt-3 ml-2">
                          <i className="fa fa-trash"></i> Licencier
                </Button>
                          )}

                        </div>

              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Modification de l'utilisateur */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)} 
        centered 
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'employer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  {selectedUser && (
    <form onSubmit={handleEditSubmit}>
         <div className="photo-container text-center">
                 <img 
                src={`http://localhost:5000${selectedUser.photo}`} 
                alt="Photo de profil" 
                className="user-photo" 
                />
          </div>
      <div className="mb-3">
        <label>Nom complet</label>
        <input 
          type="text" 
          className="form-control" 
          value={nom} 
          onChange={(e) => setNom(e.target.value)} 
        />
      </div>
      <div className="mb-3">
        <label>Email</label>
        <input 
          type="email" 
          className="form-control" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
     

      <div className="mb-3">
        <label>Photo</label>
        <input 
          type="file" 
          className="form-control" 
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])} 
        />
      </div>
      {selectedUser.role !== "admin" && (
        <div className="mb-3">
          <label>Rôle</label>
          <select 
            className="form-control" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="magasinier">Magasinier</option>
            <option value="caissier">Caissier</option>
            <option value="vendeur">Vendeur</option>
            <option value="gestion_prix">Contrôleur de prix</option>
          </select>
        </div>
      )}
      <button className="btn btn-success" type="submit">Sauvegarder les modifications</button>
    </form>
  )}
</Modal.Body>

      </Modal>
    </>
  );
}

export default Personnels;

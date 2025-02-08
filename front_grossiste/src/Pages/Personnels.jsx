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
  const [numero_cin, setnumero_cin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [photo, setPhoto] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [roleCounts, setRoleCounts] = useState([]);
  const [showLicencies, setShowLicencies] = useState(false);



  useEffect(() => {
    // Fonction pour récupérer le comptage des utilisateurs par rôle
    const fetchRoleCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/count-users-by-role");
        setRoleCounts(response.data); // Stocker les données dans l'état
     
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles :", error);
     
      }
    };

    fetchRoleCounts(); // Appeler la fonction de récupération
  }, []);

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
  
 
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = decodedToken.userId; 
  

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
      formData.append("numero_cin", numero_cin);
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
      setnumero_cin("");
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
       
        await axios.put(`http://localhost:5000/api/users/licencier/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

     
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== selectedUser._id));

      
        Swal.fire('Licencié!', 'L\'utilisateur a été mis dehors.', 'success');
        setShowModal(false);
      } catch (error) {
        console.error("Erreur de suppression", error);
        Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression.', 'error');
      }
    }
  };

  const handleEdit = () => {

    setNom(selectedUser.nom);
    setEmail(selectedUser.email);
    setRole(selectedUser.role);
    setPhoto(selectedUser.photo);
    setnumero_cin(selectedUser.numero_cin);
    setShowEditModal(true);
    setShowModal(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('email', email);
    formData.append('numero_cin', numero_cin);
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
            <h6 className='alert alert-info'><i className='fa fa-line-chart'></i> Mini-statistique de vos personnels</h6>
                   <div className='center bg-light p-3 mini'>
      {roleCounts.map((role, index) => (
        <div key={index} className="perso m-2">
          <div className="role-name font-weight-bold">{role._id}</div>
          <div className="role-count">{role.count} Personnel{role.count > 1 ? "s" : ""}</div>
        </div>
      ))}
    </div>

              <div className="filtrage bg-light p-3 mt-3">
                <h6 className="fw-bold">
                  <i className="fa fa-search"></i> Filtrage générale
                </h6>
                <form className="center">
                  <input
                    type="text"
                    className="form-control p-2 mt-3  m-2"
                    placeholder="Recherche ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="form-control mt-3 m-2 p-2"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">Tout</option>
                    <option value="magasinier">Magasinier</option>
                    <option value="caissier">Caissier</option>
                    <option value="vendeur">Vendeur (Réception)</option>
                    <option value="gestion_prix">Contrôleur de produit</option>
                  </select>
                </form>
              </div>
              <button 
                          className="btn_lic" 
                          onClick={() => setShowLicencies(!showLicencies)}
                        >
                          {showLicencies ? "Afficher les employés actifs" : "Afficher les licenciés"}
                </button>
              <div className="consultation">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Poste</th>
                      <th>Numero CIN</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                        {filteredUsers
                          .filter(user => showLicencies ? user.status === "licencié" : user.status === "actif")
                          .map((user) => (
                            <tr key={user._id}>
                              <td>{user.nom}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>{user.numero_cin}</td>
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
                <div className="form-floating mb-3">
               
                    <input type="text" className="form-control" required value={nom} onChange={(e) => setNom(e.target.value)} />
                    <label htmlFor="floatingInput">Nom complet</label>

                  </div>
                  <div className="form-floating mb-3">
                        <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        <label htmlFor="floatingInput">Email</label>
                  </div>
                  <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={numero_cin}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, ""); 
                            value = value.slice(0, 12); 
                            
                            
                            value = value.replace(/(\d{3})(?=\d)/g, "$1 ");

                            setnumero_cin(value);
                          }}
                          placeholder="xxx xxx xxx xxx"
                        />
                        <label htmlFor="floatingInput">Numero_cin</label>
                      </div>

                  <div className=" mb-3">
                    <label>Postes</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="">Sélectionner un poste</option>
                      <option value="magasinier">Magasinier</option>
                      <option value="caissier">Caissier</option>
                      <option value="vendeur">Vendeur (Réception)</option>
                      <option value="gestion_prix">Contrôleur de produit</option>
                    </select>
                  </div>
                  <div className="form-floating  mb-3">
                    
                    <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label htmlFor="floatingInput">Mot de passe</label>
                  </div>
                  <div className="form-floating  mb-3">
                    <input type="password" className="form-control" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <label htmlFor="floatingInput">Confirmer le mot de passe</label>
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
              <div className="photo-cont">
                <img src={`http://localhost:5000${selectedUser.photo}`} alt="Photo de profil" className="user-photo" />
              </div>
              <div className="user-info">
                <p><strong>Nom:</strong> {selectedUser.nom}</p>
               
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Poste:</strong> {selectedUser.role}</p>       
                 <p><strong>Numero_cin:</strong> {selectedUser.numero_cin}</p>
                <p><strong>Embauché le:</strong> {selectedUser.createdAt}</p>
                
                <div className="d-flex justify-content-between w-100">
                        {selectedUser.status !== "licencié" && (
                          <Button variant="warning" onClick={handleEdit} className="mt-3 mr-2">
                            <i className="fa fa-edit"></i> Modifier
                          </Button>
                        )}

                        {selectedUser.role !== "admin" && selectedUser.status?.trim().toLowerCase() !== "licencié" && (
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
         <div className="photo-conter text-center">
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
        <label>Numero cin</label>
        <input 
          type="number" 
          className="form-control" 
          value={numero_cin} 
          onChange={(e) => setnumero_cin(e.target.value)} 
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

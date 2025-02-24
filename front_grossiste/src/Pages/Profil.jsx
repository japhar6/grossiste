// eslint-disable-next-line no-unused-vars
import  React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../Styles/Profile.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [selectedFile, setSelectedFile] = useState(null); 
  const navigate = useNavigate();
  const usId = localStorage.getItem("userid");


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token non trouvé!");
          return;
        }

        const response = await axios.get(`https://api.bazariko.duckdns.org/api/users/seul/${usId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setUpdatedUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil", error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };


  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé!");
        return;
      }


      const formData = new FormData();
      formData.append("nom", updatedUser.nom);
      formData.append("email", updatedUser.email);
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const response = await axios.put(`https://api.bazariko.duckdns.org/api/users/${usId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setUser(response.data);
      setIsEditing(false);

    
      Swal.fire({
        title: "Succès!",
        text: "Votre profil a été mis à jour.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload(); // Actualiser la page pour voir les changements
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil", error.response?.data || error.message);

      // Affichage SweetAlert2 - Erreur
      Swal.fire({
        title: "Erreur!",
        text: "Une erreur est survenue lors de la mise à jour de votre profil.",
        icon: "error",
        confirmButtonText: "Réessayer",
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
            {user ? (
              <div className="user-profile">
                <h2>Mon Profil</h2>
                <div className="user-info">
                  <div className="photos-container">
                    <img
                      src={`api.magasin-bazariko.duckdns.org${user.photo}`}
                      alt="Photo de profil"
                      className="user-photo"
                    />
                  </div>
                  <div className="info-details">
                    {isEditing ? (
                      <>
                        <div className="form-group">
                          <label>Nom</label>
                          <input
                            type="text"
                            name="nom"
                            value={updatedUser.nom || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={updatedUser.email || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                        <button onClick={handleSave}>Enregistrer</button>
                        <button onClick={() => setIsEditing(false)}>Annuler</button>
                      </>
                    ) : (
                      <>
                        <p><strong>Nom:</strong> {user.nom}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rôle:</strong> {user.role}</p>
                        <p><strong>Embauché le:</strong> {user.createdAt}</p>
                        <button onClick={() => setIsEditing(true)}>Modifier</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p>Aucun profil trouvé.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Profil;

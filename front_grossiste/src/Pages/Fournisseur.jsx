import React, { useState, useEffect,useRef  } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/Fournisseur.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState([]);
  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ristourne, setRistourne] = useState("");
  const [logo, setLogo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const nomRef = useRef(null);
  const [filterNom, setFilterNom] = useState("");  
  const [typeRistourne, setTypeRistourne] = useState(""); // Nouveau champ pour le type de ristourne

  const [filterType, setFilterType] = useState(""); 

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/fournisseurs/tous");
      setFournisseurs(response.data);
      setFilteredFournisseurs(response.data);  
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("type", type);
    formData.append("contact[telephone]", telephone);
    formData.append("contact[email]", email);
    formData.append("contact[adresse]", adresse);
    
    if (type === "ristourne") {
      formData.append("conditions[ristourne]", parseFloat(ristourne) || 0);
      formData.append("conditions[typeRistourne]", typeRistourne); // Corriger ici
    }
    
    if (logo) {
      formData.append("logo", logo);
    }
  
    console.log("FormData à soumettre : ", formData); // Ajoute ceci
  
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/fournisseurs/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Modifié!", "Le fournisseur a été modifié avec succès.", "success");
      } else {
        await axios.post("http://localhost:5000/api/fournisseurs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Ajouté!", "Le fournisseur a été ajouté avec succès.", "success");
      }
      fetchFournisseurs();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du fournisseur", error);
      Swal.fire("Erreur", "Une erreur est survenue lors de l'enregistrement du fournisseur.", "error");
    }
  };
  

  const handleDelete = async (id) => {
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
        await axios.delete(`http://localhost:5000/api/fournisseurs/${id}`);
        Swal.fire("Supprimé!", "Le fournisseur a été supprimé avec succès.", "success");
        fetchFournisseurs();
      } catch (error) {
        console.error("Erreur lors de la suppression du fournisseur", error);
        Swal.fire("Erreur", "Une erreur est survenue lors de la suppression du fournisseur.", "error");
      }
    }
  };

  const handleEdit = (fournisseur) => {
    setEditingId(fournisseur._id);
    setNom(fournisseur.nom);
    setType(fournisseur.type);
    setTelephone(fournisseur.contact.telephone);
    setEmail(fournisseur.contact.email);
    setAdresse(fournisseur.contact.adresse);
    setRistourne(fournisseur.conditions.ristourne);
    if (nomRef.current) {
      nomRef.current.focus(); // Déplace le focus vers le champ
      nomRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); // Fait défiler vers le champ
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNom("");
    setType("");
    setTelephone("");
    setEmail("");
    setAdresse("");
    setRistourne("");
    setLogo(null);
  };

  // Fonction de filtrage des fournisseurs en fonction du nom et du type
  const filterFournisseurs = () => {
    const filtered = fournisseurs.filter((f) => {
      return (
        (f.nom.toLowerCase().includes(filterNom.toLowerCase())) &&
        (f.type.toLowerCase().includes(filterType.toLowerCase()))
      );
    });
    setFilteredFournisseurs(filtered);
  };

  // Effet pour appliquer les filtres dès qu'un champ est modifié
  useEffect(() => {
    filterFournisseurs();
  }, [filterNom, filterType, fournisseurs]);

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-success">
                <i className="fa fa-truck"></i> Liste des Fournisseurs
              </h6>

              {/* Partie filtrage avec un design cohérent */}
              <div className="filtrage bg-light p-3 mt-3">
                <h6 className="fw-bold">
                  <i className="fa fa-search"></i> Filtrage
                </h6>
                <form className="center">
                  <input
                    type="text"
                    className="form-control p-2 mt-3 m-2"
                    placeholder="Filtrer par nom"
                    value={filterNom}
                    onChange={(e) => setFilterNom(e.target.value)}
                  />
                  <select
                    className="form-control mt-3 m-2 p-2"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Filtrer par type</option>
                    <option value="prix_libre">Prix Libre</option>
                    <option value="ristourne">Ristourne</option>
                  </select>
                </form>
              </div>

              <div className="consultationF">
              <div className="table-responsives" style={{ overflowX: 'hidden',overflowY:'auto' }}>

                <table className="tableX table-striped table-hover ">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Téléphone</th>
                      <th>Email</th>
                      <th>Adresse</th>
                      <th>Ristourne</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFournisseurs.map((f) => (
                      <tr key={f._id}>
                        <td>
                          {f.logo ? (
                            <img
                              src={`http://localhost:5000${f.logo}`}
                              alt="Logo fournisseur"
                              width="50"
                              height="50"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <span>Aucun logo</span>
                          )}
                        </td>
                        <td>{f.nom}</td>
                        <td>{f.type}</td>
                        <td>{f.contact.telephone}</td>
                        <td>{f.contact.email}</td>
                        <td>{f.contact.adresse}</td>
                        <td>
                          {f.type === "ristourne" && f.conditions?.ristourne
                            ? `${f.conditions.ristourne}%`
                            : "Aucune"}
                        </td>
                        <td>
                          <button className="btn1 btn-warning" onClick={() => handleEdit(f)}>
                          <i
    className="fas fa-pencil-alt" // Icône alternative pour modifier
    style={{ cursor: "pointer", fontSize: "20px" }}
    onClick={() => handleEdit(f)}
    title="Modifier"
  ></i>
                          </button>
                          <button className="btn1 btn-danger ms-2" onClick={() => handleDelete(f._id)}>
                          <i
    className="fas fa-times" // Icône alternative pour supprimer
    style={{ cursor: "pointer", fontSize: "20px",  }}
    onClick={() => handleDelete(f._id)}
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
            </div>

            {/* Formulaire d'ajout/modification du fournisseur */}
            <div className="ajoutFournisseur p-3">
              <h6 className="alert alert-success">
                <i className="fa fa-plus"></i> {editingId ? "Modifier un fournisseur" : "Ajouter un Fournisseur"}
              </h6>
              <form onSubmit={handleSubmit}>
                <div className="bg-light p-4">
                  <div className="mb-3">
                    <label>Nom</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      ref={nomRef}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Type</label>
                    <select
                      className="form-control"
                      required
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setTypeRistourne("");
                      }}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="prix_libre">Prix Libre</option>
                      <option value="ristourne">Ristourne</option>
                    </select>
                  </div>
                                  {type === "ristourne" && (
                  <div className="mb-3">
                    <label>Type de Ristourne</label>
                    <select
                      className="form-control"
                      required
                      value={typeRistourne}
                      onChange={(e) => setTypeRistourne(e.target.value)}
                    >
                      <option value="">Sélectionner le type de ristourne</option>
                      <option value="générale">Générale</option>
                      <option value="par_produit">Par Produit</option>
                    </select>
                  </div>
                )}
                {type === "ristourne" && typeRistourne === "générale" && (
                  <div className="mb-3">
                    <label>Ristourne (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ristourne}
                      onChange={(e) => setRistourne(e.target.value)}
                    />
                  </div>
                )}

                  <div className="mb-3">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
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
                    <label>Adresse</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Logo</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setLogo(e.target.files[0])}
                    />
                  </div>
                  <button className="btn12 btn1-success" type="submit">
                    {editingId ? "Modifier" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Fournisseur;

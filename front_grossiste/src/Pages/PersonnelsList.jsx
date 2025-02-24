import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { Modal, Button, Form } from "react-bootstrap";
import Swal from "sweetalert2"; // Importation de SweetAlert

function PersonnelList() {
    const [personnels, setPersonnels] = useState([]);
    const [filtreNom, setFiltreNom] = useState("");
    const [filtrePoste, setFiltrePoste] = useState("");
    const [dateEmbauche, setDateEmbauche] = useState("");

    // Pour le modal d'ajout
    const [showModal, setShowModal] = useState(false);
    const [newPersonnel, setNewPersonnel] = useState({
        nom: "",
        poste: "",
        telephone: "",
        adresse: ""
    });

    // Pour le modal de modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPersonnel, setEditPersonnel] = useState({});

    // Charger les personnels depuis le backend
    useEffect(() => {
        const fetchPersonnels = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/personnels/afficher");
                setPersonnels(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des personnels :", error);
            }
        };
        fetchPersonnels();
    }, []);

    const getFilteredPersonnels = () => {
        return personnels.filter(personnel =>
            (!filtreNom || personnel.nom.toLowerCase().includes(filtreNom.toLowerCase())) &&
            (!filtrePoste || personnel.poste.toLowerCase().includes(filtrePoste.toLowerCase())) &&
            (!dateEmbauche || personnel.dateEmbauche === dateEmbauche)
        );
    };

    const filteredPersonnels = getFilteredPersonnels();

    // Ouvrir/fermer les modals
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    // Gérer le formulaire d'ajout
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPersonnel({ ...newPersonnel, [name]: value });
    };

    const handleAddPersonnel = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/personnels/ajouter", newPersonnel);
            setPersonnels([...personnels, response.data]);
            setNewPersonnel({ nom: "", poste: "", telephone: "", adresse: "" });
            handleClose();
            // SweetAlert pour l'ajout
            Swal.fire({
                icon: 'success',
                title: 'Personnel ajouté avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout du personnel :", error);
        }
    };

    // Ouvrir le modal de modification
    const handleShowEdit = (personnel) => {
        setEditPersonnel(personnel);
        setShowEditModal(true);
    };

    const handleCloseEdit = () => setShowEditModal(false);

    // Modifier les données du formulaire
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditPersonnel({ ...editPersonnel, [name]: value });
    };

    // Soumettre les modifications
    const handleEditPersonnel = async () => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/personnels/modifier/${editPersonnel._id}`,
                editPersonnel
            );
            const updatedPersonnels = personnels.map(p =>
                p._id === editPersonnel._id ? response.data : p
            );
            setPersonnels(updatedPersonnels);
            handleCloseEdit();
            // SweetAlert pour la modification
            Swal.fire({
                icon: 'success',
                title: 'Personnel modifié avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Erreur lors de la modification du personnel :", error);
        }
    };

    // Supprimer un personnel
    const handleDelete = async (id) => {
        // SweetAlert pour confirmation avant suppression
        Swal.fire({
            title: 'Êtes-vous sûr?',
            text: "Cette action est irréversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/personnels/supprimer/${id}`);
                    setPersonnels(personnels.filter(p => p.id !== id));
                    Swal.fire(
                        'Supprimé!',
                        'Le personnel a été supprimé.',
                        'success'
                    ).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error("Erreur lors de la suppression du personnel :", error);
                }
            }
        });
    };

    return (
        <>
            <header></header>
            <main className="center">
                <Sidebar />
                <section className="contenue">
                    <Header />
                    <div className="p-3 content center">
                        <div className="mini-stat p-3">
                            <h6 className="alert alert-info text-start">Liste des Personnels</h6>

                            <div className="filter-container mb-3 d-flex flex-wrap justify-content-between">
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par nom :
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={filtreNom}
                                            onChange={e => setFiltreNom(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par poste :
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={filtrePoste}
                                            onChange={e => setFiltrePoste(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par date d'embauche :
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateEmbauche}
                                            onChange={e => setDateEmbauche(e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={handleShow}>
                                Ajouter un personnel
                            </button>

                            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                                <table className="tableZA table-striped">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Poste</th>
                                            <th>Téléphone</th>
                                            <th>Adresse</th>
                                            <th>Date d'embauche</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPersonnels.map(personnel => (
                                            <tr key={personnel.id}>
                                                <td>{personnel.nom}</td>
                                                <td>{personnel.poste}</td>
                                                <td>{personnel.telephone}</td>
                                                <td>{personnel.adresse}</td>
                                                <td>{personnel.dateEmbauche}</td>
                                                <td>
                                                    <button className="btn btn-warning m-1" onClick={() => handleShowEdit(personnel)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-danger m-1" onClick={() => handleDelete(personnel._id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal d'ajout */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un personnel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control type="text" name="nom" value={newPersonnel.nom} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Poste</Form.Label>
                            <Form.Control type="text" name="poste" value={newPersonnel.poste} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control type="text" name="telephone" value={newPersonnel.telephone} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control type="text" name="adresse" value={newPersonnel.adresse} onChange={handleChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Annuler</Button>
                    <Button variant="primary" onClick={handleAddPersonnel}>Ajouter</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de modification */}
            <Modal show={showEditModal} onHide={handleCloseEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier le Personnel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={editPersonnel.nom || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Poste</Form.Label>
                            <Form.Control
                                type="text"
                                name="poste"
                                value={editPersonnel.poste || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                                type="text"
                                name="telephone"
                                value={editPersonnel.telephone || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Statut</Form.Label>
                            <Form.Control
                                type="text"
                                name="statut"
                                value={editPersonnel.statut || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control
                                type="text"
                                name="adresse"
                                value={editPersonnel.adresse || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEdit}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleEditPersonnel}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default PersonnelList;

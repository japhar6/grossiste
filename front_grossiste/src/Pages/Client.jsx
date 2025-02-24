import React, { useState, useEffect } from "react";
import axios from "axios"; // Assurez-vous d'avoir installé axios
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from "sweetalert2"; // Importation de SweetAlert

function ClientsList() {
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newClient, setNewClient] = useState({
        nom: '',
        telephone: '',
        adresse: '',
        typeRemise: 'remiseFixe',
        remiseValeur: 0
    });
    const [currentClient, setCurrentClient] = useState({});

    useEffect(() => {
        // Récupérer les clients depuis l'API
        axios.get("http://localhost:5000/api/client/afficher")
            .then(response => {
                setClients(response.data);
            })
            .catch(error => {
                console.error("Il y a eu une erreur lors de la récupération des clients : ", error);
            });
    }, []);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const handleEditShow = (client) => {
        setCurrentClient({
            ...client,
            typeRemise: client.remises.remiseFixe ? 'remiseFixe' : client.remises.remiseParProduit ? 'remiseParProduit' : 'remiseGlobale',
            remiseValeur: client.remises.remiseFixe || client.remises.remiseParProduit || client.remises.remiseGlobale
        });
        setShowEditModal(true);
    };
    const handleEditClose = () => setShowEditModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setCurrentClient({ ...currentClient, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const remises = {
            remiseFixe: newClient.typeRemise === 'remiseFixe' ? Number(newClient.remiseValeur) : 0,
            remiseParProduit: newClient.typeRemise === 'remiseParProduit' ? Number(newClient.remiseValeur) : 0,
            remiseGlobale: newClient.typeRemise === 'remiseGlobale' ? Number(newClient.remiseValeur) : 0
        };

        try {
            const response = await axios.post("http://localhost:5000/api/client/ajouter", {
                nom: newClient.nom,
                telephone: newClient.telephone,
                adresse: newClient.adresse,
                remises
            });
            setClients([...clients, response.data]);
            handleClose();
            Swal.fire({
                icon: 'success',
                title: 'Client ajouté avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout du client :", error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const remises = {
            remiseFixe: currentClient.typeRemise === 'remiseFixe' ? Number(currentClient.remiseValeur) : 0,
            remiseParProduit: currentClient.typeRemise === 'remiseParProduit' ? Number(currentClient.remiseValeur) : 0,
            remiseGlobale: currentClient.typeRemise === 'remiseGlobale' ? Number(currentClient.remiseValeur) : 0
        };

        try {
            const response = await axios.put(`http://localhost:5000/api/client/modifier/${currentClient._id}`, {
                nom: currentClient.nom,
                telephone: currentClient.telephone,
                adresse: currentClient.adresse,
                remises
            });
            setClients(clients.map(client => client._id === currentClient._id ? response.data.client : client));
            handleEditClose();
            Swal.fire({
                icon: 'success',
                title: 'Client modifié avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Erreur lors de la modification du client :", error);
        }
    };

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
                    await axios.delete(`http://localhost:5000/api/client/supprimer/${id}`);
                    setClients(clients.filter(p => p.id !== id));
                    Swal.fire(
                        'Supprimé!',
                        'Le client a été supprimé.',
                        'success'
                    ).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    console.error("Erreur lors de la suppression du client :", error);
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
                            <h6 className="alert alert-info text-start">Liste des clients</h6>

                            <div className="filter-container mb-3 d-flex flex-wrap justify-content-between">
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par nom :
                                        <input type="text" className="form-control" />
                                    </label>
                                </div>
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par type de client :
                                        <select className="form-control">
                                            <option value="">Tous les clients</option>
                                            <option value="">Client particulier</option>
                                            <option value="">Client simple</option>
                                        </select>
                                    </label>
                                </div>
                                <div className="flex-fill mb-2">
                                    <label className="form-label">
                                        Filtrer par date d'ajout :
                                        <input type="date" className="form-control" />
                                    </label>
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={handleShow}>
                                Ajouter un client
                            </button>

                            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                                <table className="tableZA table-striped">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Téléphone</th>
                                            <th>Adresse</th>
                                            <th>Date d'ajout</th>
                                            <th>Remise fixe</th>
                                            <th>Remise par produit</th>
                                            <th>Remise prix global</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map(client => (
                                            <tr key={client._id}>
                                                <td>{client.nom}</td>
                                                <td>{client.telephone}</td>
                                                <td>{client.adresse}</td>
                                                <td>{new Date(client.dateInscription).toLocaleDateString()}</td>
                                                <td>{client.remises ? client.remises.remiseFixe : 'Pas de remise'}</td>
                                                <td>{client.remises ? client.remises.remiseParProduit : 'Pas de remise'}</td>
                                                <td>{client.remises ? client.remises.remiseGlobale : 'Pas de remise'}</td>
                                                <td>
                                                    <button className="btn btn-warning m-1"  onClick={() => handleEditShow(client)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-danger m-1" onClick={() => handleDelete(client._id)}>
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

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un nouveau client</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control type="text" name="nom" value={newClient.nom} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control type="text" name="telephone" value={newClient.telephone} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control type="text" name="adresse" value={newClient.adresse} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Type de remise</Form.Label>
                            <Form.Control as="select" name="typeRemise" value={newClient.typeRemise} onChange={handleChange}>
                                <option value="remiseFixe">Remise fixe</option>
                                <option value="remiseParProduit">Remise par produit</option>
                                <option value="remiseGlobale">Remise globale</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Valeur de la remise</Form.Label>
                            <Form.Control type="number" name="remiseValeur" value={newClient.remiseValeur} onChange={handleChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Ajouter
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={handleEditClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier le client</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control type="text" name="nom" value={currentClient.nom} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control type="text" name="telephone" value={currentClient.telephone} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control type="text" name="adresse" value={currentClient.adresse} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Type de remise</Form.Label>
                            <Form.Control as="select" name="typeRemise" value={currentClient.typeRemise} onChange={handleEditChange}>
                                <option value="remiseFixe">Remise fixe</option>
                                <option value="remiseParProduit">Remise par produit</option>
                                <option value="remiseGlobale">Remise globale</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Valeur de la remise</Form.Label>
                            <Form.Control type="number" name="remiseValeur" value={currentClient.remiseValeur} onChange={handleEditChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Modifier
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ClientsList;

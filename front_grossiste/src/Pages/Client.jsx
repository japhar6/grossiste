import React, { useState, useEffect } from "react";
import axios from '../api/axios';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Swal from "sweetalert2"; // Importation de SweetAlert

function ClientsList() {
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalila, setShowModalila] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newClient, setNewClient] = useState({
        nom: '',
        telephone: '',
        adresse: '',
        typeRemise: 'remiseFixe',
        remiseValeur: 0,
        nif: '',
        stat: '',
        nifStatImage: null
    });
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentClient, setCurrentClient] = useState({});
    const [filteredClients, setFilteredClients] = useState([]);
    const [filters, setFilters] = useState({ name: '', type: '', date: '' });
    const [selectedClient, setSelectedClient] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
     const [loadingAction, setLoadingAction] = useState(false);
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const handleSort = () => {
        const sortedClients = [...clients].sort((a, b) => {
            return sortOrder === "asc" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom);
        });
        setClients(sortedClients);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    
    useEffect(() => {
        setLoadingList(true);
        axios.get("/api/client/")
            .then(response => {
                setClients(response.data);
                setLoadingList(false); // <-- Ici, il faut mettre à false
            })
            .catch(error => { 
                console.error("Il y a eu une erreur lors de la récupération des clients : ", error);
                setLoadingList(false); // <-- Ici aussi en cas d'erreur
            });
    }, []);
    const handleRowClick = (client) => {
        setSelectedClient(client);
        setShowModalila(true);
    };
    
    const handleCloseModalila = () => {
        setShowModalila(false);
        setSelectedClient(null);
    };

    useEffect(() => {
        const idClient = localStorage.getItem('idClient');
        if (idClient) {
            // Récupérer les informations du client depuis l'API
            axios.get(`/api/client/recuperer/${idClient}`)
                .then(response => {
                    const clientData = response.data;
                    // Pré-remplir les informations dans le modal d'édition
                    setCurrentClient({
                        ...clientData,
                        typeRemise: clientData.remises.remiseFixe ? 'remiseFixe' : clientData.remises.remiseParProduit ? 'remiseParProduit' : 'remiseGlobale',
                        remiseValeur: clientData.remises.remiseFixe || clientData.remises.remiseParProduit || clientData.remises.remiseGlobale
                    });
                    setShowEditModal(true); // Ouvrir le modal d'édition
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération du client :", error);
                });
        }
    }, []);
    
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const handleEditShow = (client) => {
        setCurrentClient(client);
        setShowEditModal(true);
    };
    const handleEditClose = () => setShowEditModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };
    const handleFileChange = (e) => {
        setNewClient({ ...newClient, nifStatImage: e.target.files[0] });
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
        };  setLoading(true);

        try {  
            const response = await axios.post("/api/client/ajouter", {
                nom: newClient.nom,
                telephone: newClient.telephone,
                adresse: newClient.adresse,
                remises
            });
            setClients([...clients, response.data]);
            handleClose();  setLoading(false);
            Swal.fire({
                icon: 'success',
                title: 'Client ajouté avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout du client :", error);  setLoading(false);
        }
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const remises = {
            remiseFixe: currentClient.typeRemise === 'remiseFixe' ? Number(currentClient.remiseValeur) : 0,
            remiseParProduit: currentClient.typeRemise === 'remiseParProduit' ? Number(currentClient.remiseValeur) : 0,
            remiseGlobale: currentClient.typeRemise === 'remiseGlobale' ? Number(currentClient.remiseValeur) : 0
        };
    
        try {
            const response = await axios.put(`/api/client/modifier/${currentClient._id}`, {
                nom: currentClient.nom,
                telephone: currentClient.telephone,
                adresse: currentClient.adresse,
                remises
            });
    
            setClients(clients.map(client => client._id === currentClient._id ? response.data.client : client));
            handleEditClose();
            localStorage.removeItem('idClient');
            
            Swal.fire({
                icon: 'success',
                title: 'Client modifié avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
    
            setLoading(false); // Correct
        } catch (error) {
            console.error("Erreur lors de la modification du client :", error);
            setLoading(false); // Ajouté pour éviter que `loading` reste `true`
        }
    };
    

    useEffect(() => {
        let filtered = clients;
    
        // Filtrage par nom
        if (filters.name) {
            filtered = filtered.filter(client => 
                client.nom.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
    
        // Filtrage par adresse (avec une correspondance partielle)
        if (filters.adresse) {
            filtered = filtered.filter(client => 
                client.adresse.toLowerCase().includes(filters.adresse.toLowerCase())
            );
        }
    
        // Filtrage par date (en s'assurant que la date est au bon format)
        if (filters.date) {
            filtered = filtered.filter(client => 
                new Date(client.dateInscription).toISOString().split('T')[0] === filters.date
            );
        }
    
        setFilteredClients(filtered); // Mise à jour des clients filtrés
    }, [filters, clients]);
    

    const handleDelete = async (id) => {
        // SweetAlert pour confirmation avant suppression
        setLoading(true);
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
                    await axios.delete(`/api/client/supprimer/${id}`);
                    setClients(clients.filter(p => p.id !== id));
                    Swal.fire(
                        'Supprimé!',
                        'Le client a été supprimé.',
                        'success'
                    ).then(() => {
                        window.location.reload();    setLoading(false);
                    });
                } catch (error) {
                    console.error("Erreur lors de la suppression du client :", error);    setLoading(false);
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
                            {loading && <Spinner animation="border" />}
                            <div className="filter-container mb-3 d-flex flex-wrap justify-content-between">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Filtrer par nom" 
                            className="form-control mb-2"
                            value={filters.name} 
                            onChange={handleFilterChange} 
                        />
                     <input 
                            type="text" 
                            name="adresse" 
                            className="form-control mb-2"
                            value={filters.adresse} 
                            onChange={handleFilterChange} 
                        />
                
                        <input 
                            type="date" 
                            name="date" 
                            className="form-control mb-2"
                            value={filters.date} 
                            onChange={handleFilterChange} 
                        />
                    </div>

                    <button 
    className="btn btn-primary w-100 d-block mx-auto" 
    onClick={handleShow} 
    disabled={loading}
>
    {loading ? <Spinner as="span" animation="border" size="sm" /> : "Ajouter un client"}
</button>

                            {loadingList ? (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : (
                            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                                <table className="tableZA table-striped">
                                    <thead className="table-light">
                                        <tr>
                                        <th onClick={handleSort} style={{ cursor: 'pointer' }}>Nom {sortOrder === "asc" ? "▲" : "▼"}</th>
                                            <th>Téléphone</th>
                                            <th>Adresse</th>
                                            <th>Date d'ajout</th>
                                            <th>Remise fixe</th>
                                            <th>Remise par produit</th>
                                            <th>Remise prix global</th>
                                            <th>Nif</th>
                                            <th>Stat</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClients.map(client => (
                                          <tr key={client._id} onClick={() => handleRowClick(client)} style={{ cursor: "pointer" }}>
               
                                                <td>{client.nom}</td>
                                                <td>{client.telephone}</td>
                                                <td>{client.adresse}</td>
                                                <td>{new Date(client.dateInscription).toLocaleDateString()}</td>
                                                <td>{client.remises ? client.remises.remiseFixe : 'Pas de remise'}</td>
                                                <td>{client.remises ? client.remises.remiseParProduit : 'Pas de remise'}%</td>
                                                <td>{client.remises ? client.remises.remiseGlobale : 'Pas de remise'}Ariary</td>
                                                <td>{client.nif }</td>
                                                <td>{client.star}</td>
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
                            </div>  )}
                        </div>
                    </div>
                </section>
            </main>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title className="gradient-text">Ajouter un nouveau client</Modal.Title>
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
                        <Form.Group>
                            <Form.Label>NIF</Form.Label>
                            <Form.Control type="text" name="nif" value={newClient.nif} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>STAT</Form.Label>
                            <Form.Control type="text" name="stat" value={newClient.stat} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
    <Form.Label>Image (NIF/STAT)</Form.Label>
    <Form.Control 
        type="file" 
        name="nifStatImage" 
        accept="image/*" 
        onChange={handleFileChange} 
    />
</Form.Group>

                        <Button variant="primary" type="submit" className="mt-3">
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Ajouter"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={handleEditClose}>
    <Modal.Header closeButton>
    <Modal.Title className="gradient-text">Modifier le client</Modal.Title>
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
            <Form.Group>
                            <Form.Label>NIF</Form.Label>
                            <Form.Control type="text" name="nif" value={newClient.nif} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>STAT</Form.Label>
                            <Form.Control type="text" name="stat" value={newClient.stat} onChange={handleChange} />
                        </Form.Group>
                        
            <Button 
    variant="primary" 
    type="submit" 
    className="mt-3 px-4 py-2 rounded-pill shadow-lg" 
    style={{ backgroundColor: '#007bff', border: 'none' }}
>
{loading ? <Spinner as="span" animation="border" size="sm" /> : "Modifier"}
</Button>
<Button 
    variant="secondary" 
    className="mt-3 ml-2 px-4 py-2 rounded-pill shadow-lg" 
    style={{ backgroundColor: '#6c757d', border: 'none' }} 
    onClick={() => {
        localStorage.removeItem('idClient'); // Supprime l'élément 'idClient' du localStorage
        handleEditClose(); // Ferme le modal
    }}
>
    Annuler
</Button>

        </Form>
    </Modal.Body>
</Modal>
<Modal 
    show={showModalila} 
    onHide={handleCloseModalila} 
    centered 
    size="lg" 
    // Ajuste la taille (tu peux mettre "xl" si besoin)
>
    <Modal.Header closeButton>
        <Modal.Title>Image du NIF/STAT</Modal.Title>
    </Modal.Header>
    <Modal.Body 
        className="d-flex justify-content-center align-items-center" 
        style={{ height: "70vh" }} // Ajuste la hauteur de la modale
    >
        {selectedClient && (
            <img
                src={`https://api.bazariko.com${selectedClient.nifStatImage}`}
                alt="Possede pas de nif/stat"
                style={{
                    maxWidth: "100%", // L'image prend toute la largeur possible
                    maxHeight: "75vh", // Empêche l'image de dépasser l'écran
                    objectFit: "contain" // Ajuste l'image sans la déformer
                }}
            />
        )}
    </Modal.Body>
    <Modal.Footer className="d-flex justify-content-center">
        <Button variant="secondary" onClick={handleCloseModalila}>
            Fermer
        </Button>
    </Modal.Footer>
</Modal>




        </>
    );
}

export default ClientsList;

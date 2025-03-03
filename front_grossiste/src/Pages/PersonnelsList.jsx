import React, { useEffect, useState } from "react";
import axios from '../api/axios';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2"; // Importation de SweetAlert


function PersonnelList() {
    const [personnels, setPersonnels] = useState([]);
    const [filtreNom, setFiltreNom] = useState("");
    const [filtrePoste, setFiltrePoste] = useState("");
    const [dateEmbauche, setDateEmbauche] = useState("");
    const [loadingEntrepots, setLoadingEntrepots] = useState(false);
    const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    // Pour le modal d'ajout
    const [showModal, setShowModal] = useState(false);
    const [newPersonnel, setNewPersonnel] = useState({
        nom: "",
        poste: "",
        telephone: "",
        adresse: "",
        salaireBrut: "",
        modePaiement: ""
    });

    const [selectedPersonnelId, setSelectedPersonnelId] = useState(null);
    const [showPaiementModal, setShowPaiementModal] = useState(false);
    const [personnelSelectionne, setPersonnelSelectionne] = useState(null);
    const [periodePaiement, setMoisPaiement] = useState("");
    const [montantPaiement, setMontantPaiement] = useState("");
    const [historiquePaiements, setHistoriquePaiements] = useState([]);

    const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
    const handleRowClick = (personnel) => {
        setPersonnelSelectionne(personnel);  // Sélectionne le personnel à partir de la ligne
        setShowPaiementModal(true);  // Ouvre le modal de paiement
    };
    const handleVoirHistorique = async (personnelId) => {
        try {
          console.log(`📡 Envoi de la requête pour l'historique du personnel avec ID: ${personnelId}`);
          
          setSelectedPersonnelId(personnelId); // Sauvegarde l'ID du personnel sélectionné
      
          // Effectuer la requête pour récupérer l'historique des paiements
          const response = await axios.get(`/api/personnels/recuppay/${personnelId}`);
          
          console.log("📥 Réponse reçue de l'API:", response.data);
      
          // Si la réponse est un tableau, on met directement à jour l'état historiquePaiements
          if (Array.isArray(response.data) && response.data.length > 0) {
            setHistoriquePaiements(response.data); // Met à jour l'état avec les paiements récupérés
          } else {
            setHistoriquePaiements([]); // Si aucune donnée n'est reçue, initialiser avec un tableau vide
          }
      
          setShowHistoriqueModal(true); // Ouvre le modal pour afficher l'historique
        } catch (error) {
          console.error("🚨 Erreur lors de la récupération de l'historique des paiements", error);
        }
      };
      
    
    // Fonction pour fermer le modal
const handleCloseModal = () => {
    setShowHistoriqueModal(false);
};
    useEffect(() => {
        if (personnelSelectionne) {
            setMontantPaiement(personnelSelectionne.salaireBrut || ""); 
        }
    }, [personnelSelectionne]);
    
    const handleEnregistrerPaiement = async () => {
       
        try {
            console.log("Données envoyées au backend :", {
                periode: periodePaiement,
                montant: montantPaiement
            });
    
            const response = await axios.post(
                `/api/personnels/faire/${personnelSelectionne._id}/paiements`,
                {  montant: montantPaiement }
            );
    
            console.log("Réponse du backend :", response.data);
    
            setPersonnels(personnels.map(p =>
                p._id === personnelSelectionne._id ? response.data : p
            ));
    
            setShowPaiementModal(false);
      
    
            setMoisPaiement("");
            setMontantPaiement("");
            Swal.fire('Paiement effectué', 'Le paiement a été enregistré avec succès', 'success')
            .then(() => {
              window.location.reload(); // Recharge la page après la fermeture de l'alerte
            });
          
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du paiement :", error);
            if (error.response) {
                console.error("Erreur réponse API :", error.response.data);
            }
            Swal.fire('Erreur', 'Impossible d\'enregistrer le paiement', 'error');
        }
    };
    

    // Pour le modal de modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPersonnel, setEditPersonnel] = useState({});

    // Charger les personnels depuis le backend
    useEffect(() => {
        setLoadingEntrepots(true);
        const fetchPersonnels = async () => {
            try {
                const response = await axios.get("/api/personnels/afficher");
                setPersonnels(response.data); setLoadingEntrepots(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des personnels :", error); setLoadingEntrepots(false);
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
        // Validation des champs avant l'envoi de la requête
        if (!newPersonnel.nom || !newPersonnel.poste || !newPersonnel.salaireBrut || !newPersonnel.modePaiement) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Tous les champs obligatoires doivent être remplis !',
            });
            return; // Empêche l'envoi de la requête si les champs ne sont pas valides
        }
    
        if (isNaN(newPersonnel.salaireBrut) || newPersonnel.salaireBrut <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Le salaire brut doit être un nombre positif !',
            });
            return; // Empêche l'envoi de la requête si le salaire n'est pas valide
        }
    
        console.log("Données envoyées au backend :", newPersonnel); // Log des données avant l'envoi
    
        setLoadingAction(true);
    
        try {
            const response = await axios.post("/api/personnels/ajouter", newPersonnel);
    
            // Mise à jour de la liste des personnels
            setPersonnels(prevPersonnels => [...prevPersonnels, response.data]);
            setNewPersonnel({ nom: "", poste: "", telephone: "", adresse: "", salaireBrut: "", modePaiement: "" });
            handleClose();
            
            // SweetAlert pour l'ajout
            Swal.fire({
                icon: 'success',
                title: 'Personnel ajouté avec succès!',
                showConfirmButton: false,
                timer: 1500
            });
            setLoadingAction(false);
        } catch (error) {
            console.error("Erreur lors de l'ajout du personnel :", error);
            if (error.response) {
                // Affichage de l'erreur reçue du backend
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.response.data.message || 'Erreur inconnue lors de l\'ajout du personnel.',
                });
            }
            setLoadingAction(false);
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
        setLoadingAction(true);
        try {
            const response = await axios.put(
                `/api/personnels/modifier/${editPersonnel._id}`,
                editPersonnel
            );
            const updatedPersonnels = personnels.map(p =>
                p._id === editPersonnel._id ? response.data : p
            ); setLoadingAction(false);
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
            console.error("Erreur lors de la modification du personnel :", error); setLoadingAction(false);
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
                    await axios.delete(`/api/personnels/supprimer/${id}`);
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
                            {loadingEntrepots ? (
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
                                                <th>Nom</th>
                                                <th>Poste</th>
                                                <th>Téléphone</th>
                                                <th>Adresse</th>
                                                <th>Salaire</th>
                                                <th>Mode de paiement</th>
                                                <th>Date d'embauche</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPersonnels.map(personnel => (
                                                <tr key={personnel._id} onClick={() => handleRowClick(personnel)}>
                                                    <td>{personnel.nom}</td>
                                                    <td>{personnel.poste}</td>
                                                    <td>{personnel.telephone}</td>
                                                    <td>{personnel.adresse}</td>
                                                    <td>{personnel.salaireBrut}</td>
                                                    <td>{personnel.modePaiement}</td>
                                                    
                                                    <td>{personnel.dateEmbauche}</td>
                                                    <td>
                                                        <button className="btn btn-warning m-1" onClick={(e) =>{  e.stopPropagation(); handleShowEdit(personnel)}}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-danger m-1" onClick={(e) =>{  e.stopPropagation();handleDelete(personnel._id)}}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <button
  onClick={(e) => {
    e.stopPropagation(); // Empêche le déclenchement du clic sur la ligne
    handleVoirHistorique(personnel._id);
  }}
>
  Voir l'historique
</button>

                                                                                                </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>)}
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
                            <Form.Group>
                                <Form.Label>Salaire Brut</Form.Label>
                                <Form.Control type="number" name="salaireBrut" value={newPersonnel.salaireBrut} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Mode de Paiement</Form.Label>
                                <Form.Control as="select" name="modePaiement" value={newPersonnel.modePaiement} onChange={handleChange}>
                                    <option value="">Sélectionner le mode de paiement</option>
                                    <option value="journalier">Journalier</option>
                                    <option value="hebdomadaire">Hebdomadaire</option>
                                    <option value="mensuel">Mensuel</option>
                                </Form.Control>
                            </Form.Group>
                        </Form>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Annuler</Button>
                    <Button
                        variant="primary"
                        onClick={handleAddPersonnel}
                        disabled={loadingAction} // Désactive le bouton pendant le chargement
                    >
                        {loadingAction ? (
                            // Afficher un spinner si l'action est en cours
                            <Spinner animation="border" size="sm" />
                        ) : (
                            "Ajouter" // Sinon, afficher le texte "Ajouter"
                        )}
                    </Button>

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
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control
                                type="text"
                                name="adresse"
                                value={editPersonnel.adresse || ""}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Salaire Brut</Form.Label>
                            <Form.Control type="number" name="salaireBrut" value={editPersonnel.salaireBrut} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Mode de Paiement</Form.Label>
                            <Form.Control as="select" name="modePaiement" value={editPersonnel.modePaiement} onChange={handleEditChange}>
                                <option value="">Sélectionner le mode de paiement</option>
                                <option value="journalier">Journalier</option>
                                <option value="hebdomadaire">Hebdomadaire</option>
                                <option value="mensuel">Mensuel</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEdit}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEditPersonnel}
                        disabled={loadingAction} 
                    >
                        {loadingAction ? (
                            // Afficher un spinner si l'action est en cours
                            <Spinner animation="border" size="sm" />
                        ) : (
                            "  Enregistrer" // Sinon, afficher le texte "Ajouter"
                        )}
                    </Button>


                </Modal.Footer>
            </Modal>
            {/* Modal de paiement */}
            <Modal show={showPaiementModal} onHide={() => setShowPaiementModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Enregistrer le paiement de salaire</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            <Form.Group>
                <Form.Label>Nom du Personnel</Form.Label>
                <Form.Control type="text" value={personnelSelectionne?.nom || ""} disabled />
            </Form.Group>
            <Form.Group>
                <Form.Label>Poste du Personnel</Form.Label>
                <Form.Control type="text" value={personnelSelectionne?.poste || ""} disabled />
            </Form.Group>
            <Form.Group>
                <Form.Label>Montant</Form.Label>
                <Form.Control
                    type="number"
                    name="montant"
                    value={montantPaiement || personnelSelectionne?.salaireBrut || ""} // Pré-remplissage du salaire
                  
                    placeholder="Montant à payer"
                    readOnly
                />
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPaiementModal(false)}>
            Annuler
        </Button>
        <Button
            variant="primary"
            onClick={handleEnregistrerPaiement}
            disabled={loadingAction} 
        >
        {loadingAction ? (
                            // Afficher un spinner si l'action est en cours
                            <Spinner animation="border" size="sm" />
                        ) : (
                            "  Payer" 
                        )}
        </Button>
    </Modal.Footer>
</Modal>
<Modal show={showHistoriqueModal} onHide={handleCloseModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Historique des paiements </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {historiquePaiements && historiquePaiements.length === 0 ? (
      <p>Aucun paiement enregistré pour ce personnel.</p>
    ) : (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Période</th>
              <th>Montant</th>
              <th>Date du paiement</th>
            </tr>
          </thead>
          <tbody>
          
            {historiquePaiements.map((paiement, index) => (
              <tr key={paiement._id || index}> {/* Utiliser _id pour la clé */}
                <td>{paiement.periode}</td>
                <td>{paiement.montant} Ariary</td>
                <td>{new Date(paiement.datePaiement).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseModal}>Fermer</Button>
  </Modal.Footer>
</Modal>


        </>
    );
}

export default PersonnelList;

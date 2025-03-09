import React, { useState, useEffect } from 'react';
import axios from '../api/axios'; // Assurez-vous d'importer votre instance axios
import '../Styles/modalRefacturation.css';
import ReapproModal from '../Components/ReaproAdd';

const ReapproListModal = ({ show, handleClose }) => {
    const [reapprovisionnements, setReapprovisionnements] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Récupérer les refacturations quand le modal est affiché
    useEffect(() => {
        if (show) {
            axios
                .get('/api/reapro/getAll') // Assurez-vous que cela correspond à votre route backend
                .then((response) => {
                    setReapprovisionnements(response.data.refacturations);
                })
                .catch((error) => {
                    console.error('Erreur lors de la récupération des refacturations:', error);
                });
        }
    }, [show]);

    const handleAdd = (newReappro) => {
        console.log('Nouveau réapprovisionnement ajouté :', newReappro);
        setReapprovisionnements((prev) => [...prev, newReappro]);
        setShowAddModal(false);
    };

    return (
        <>
            {/* Modal personnalisé */}
            {show && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header">
                            <h2>Liste des Refacturations</h2>
                            <button className="close-btn" onClick={handleClose}>X</button>
                        </div>
                        <div className="modal-body">
                            {reapprovisionnements.length === 0 ? (
                                <p>Aucune refacturation disponible.</p>
                            ) : (
                                <div className="table-container" style={{ overflowX: 'auto' }}>
                                    <table className="reappro-table">
                                        <thead>
                                            <tr>
                                                <th >Montant</th>
                                                <th>Raison</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reapprovisionnements.map((reappro, index) => (
                                                <tr key={index}>
                                                    <td>{reappro.montant}</td>
                                                    <td>{reappro.raison}</td>
                                                    <td>{new Date(reappro.date).toLocaleDateString()}</td> {/* Format de la date */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-add" onClick={() => setShowAddModal(true)}>Ajouter une refacturation</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'ajout */}
            {showAddModal && (
                <ReapproModal
                    show={showAddModal}
                    handleClose={() => setShowAddModal(false)}
                    handleSave={handleAdd}
                />
            )}
        </>
    );
};

export default ReapproListModal;

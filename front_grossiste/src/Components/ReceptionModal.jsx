import React, { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";

const ReceptionModal = ({ show, handleClose, transfertId, quantiteEnvoyee, refreshHistorique }) => {
  if (!show) return null;

  // États pour les quantités et le commentaire
  const [quantiteReçue, setQuantiteReçue] = useState(0);
  const [quantitePerdue, setQuantitePerdue] = useState(0);
  const [quantiteEndommagee, setQuantiteEndommagee] = useState(0);
  const [commentaire, setCommentaire] = useState("");

  const handleReception = async () => {
    const total = quantiteReçue + quantitePerdue + quantiteEndommagee;
  
    if (total !== quantiteEnvoyee) {
      toast.error(`La somme des quantités (${total}) doit être égale à ${quantiteEnvoyee}.`);
      return;
    }
  
    try {
      const response = await axios.put(`/api/transfert/reception/${transfertId}`, {
        quantitéReçue: quantiteReçue,
        quantitéPerdue: quantitePerdue,
        quantitéEndommagée: quantiteEndommagee,
        commentaire: commentaire,
      });
  
      console.log("Réponse API :", response.data);
      toast.success("Transfert reçu avec succès !");
      refreshHistorique();
      handleClose();
    } catch (error) {
      console.error("Erreur API :", error.response?.data || error.message);
      toast.error(`Erreur lors de la réception : ${error.response?.data?.message || error.message}`);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="text-center">Réception du Transfert</h3>
        <p>Quantité envoyée : <strong>{quantiteEnvoyee}</strong></p>

        <label>Quantité Reçue :</label>
        <input type="number" value={quantiteReçue} onChange={(e) => setQuantiteReçue(Number(e.target.value))} />

        <label>Quantité Perdue :</label>
        <input type="number" value={quantitePerdue} onChange={(e) => setQuantitePerdue(Number(e.target.value))} />

        <label>Quantité Endommagée :</label>
        <input type="number" value={quantiteEndommagee} onChange={(e) => setQuantiteEndommagee(Number(e.target.value))} />

        <label>Commentaire :</label>
        <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />

        <div className="modal-actions">
          <button className="btn btn-success" onClick={handleReception}>Confirmer</button>
          <button className="btn btn-secondary" onClick={handleClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionModal;

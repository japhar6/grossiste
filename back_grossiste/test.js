function convertirUnite(quantite, uniteAchat, unitesDisponibles) {
    // Trouver l'unité de départ
    const uniteSource = unitesDisponibles.find(u => u.nom === uniteAchat);

    if (!uniteSource) {
        console.error("❌ Erreur: Unité source introuvable !");
        return { quantite, unite: uniteAchat };
    }

    // Trier les unités par ordre croissant de conversion (plus petite unité a une conversion plus grande)
    const unitesTriees = [...unitesDisponibles].sort((a, b) => b.conversion - a.conversion);

    // Trouver la plus petite unité
    const uniteCible = unitesTriees[0]; // La première unité dans la liste triée est la plus petite

    // Conversion
    const nouvelleQuantite = quantite * (uniteCible.conversion / uniteSource.conversion);
    return { quantite: nouvelleQuantite, unite: uniteCible.nom };
}
// Exemple de test
const unites = [
    { nom: "carton", conversion: 1 },   // 1 carton
    { nom: "cartouche", conversion: 50 } ,
    { nom: "paquet", conversion: 500 }// 1 carton = 10 cartouches
];

const result = convertirUnite(1, "carton", unites);
console.log(`Conversion:  1 carton ➡ ${result.quantite} ${result.unite}`);

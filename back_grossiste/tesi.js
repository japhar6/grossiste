function convertirQuantite(quantite, uniteDepart, unites) {
    // Créer un objet de conversions à partir du tableau d'unités
    const conversions = {};
    unites.forEach(u => {
        conversions[u.nom] = u.conversion;
    });

    // Vérifier si l'unité de départ existe dans les conversions
    if (!conversions[uniteDepart]) {
        console.error(`❌ Erreur: L'unité "${uniteDepart}" n'est pas définie dans les conversions.`);
        return null;
    }

    // Récupérer le facteur de conversion pour l'unité de départ
    const facteurDepart = conversions[uniteDepart];

    // Convertir la quantité en unité de référence (par exemple, utiliser "carton" comme référence)
    const uniteReference = 'carton'; // Vous pouvez définir l'unité de référence ici
    if (!conversions[uniteReference]) {
        console.error(`❌ Erreur: L'unité de référence "${uniteReference}" n'est pas définie.`);
        return null;
    }
    
    const quantiteEnReference = quantite / facteurDepart;

    // Créer un objet pour stocker les quantités converties
    const quantitesConverties = {};

    // Convertir la quantité dans toutes les unités disponibles
    for (const [unite, facteur] of Object.entries(conversions)) {
        quantitesConverties[unite] = quantiteEnReference * facteur;
    }

    return quantitesConverties;
}

// Définition des conversions (exemple)
const unites = [
    { nom: "carton", conversion: 1 },    // 1 carton
    { nom: "cartouche", conversion: 50 }, // 1 carton = 50 cartouches
    { nom: "paquet", conversion: 500 }    // 1 carton = 500 paquets
];

// Test de la fonction
const uniteDepart = 'carton'; // Unité de départ
const quantite = 5; // Quantité à convertir

const resultats = convertirQuantite(quantite, uniteDepart, unites);
console.log(`Conversions de ${quantite} ${uniteDepart}:`, resultats);

let planningActif = localStorage.getItem("dojo-planning-actif") || "fitness";
let configActive = PLANNING_CONFIGS[planningActif] || PLANNING_CONFIGS.fitness;
let STORAGE_KEY = configActive.storageKey;
let SETTINGS_KEY = configActive.settingsKey;

SALLES = configActive.salles;
ACTIVITES = configActive.activites;
PLANNING_DEFAUT = configActive.planningDefaut;

let cours = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(PLANNING_DEFAUT);
let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
let jourOuvert = "Lundi";
let carteOuverte = null;

const INTERVENANTS = [
  "Guillaume",
  "Ludivine",
  "Cassandra",
  "Fabienne",
  "Christophe",
  "Benjamin",
  "Amélie",
  "Thomas"
];

function normaliserIntervenants(valeur) {
  if (Array.isArray(valeur)) return valeur.filter(nom => INTERVENANTS.includes(nom));
  if (typeof valeur === "string" && valeur.trim()) {
    return valeur.split(",").map(nom => nom.trim()).filter(nom => INTERVENANTS.includes(nom));
  }
  return [];
}

function texteIntervenants(coursItem) {
  return normaliserIntervenants(coursItem?.intervenants).join(" • ");
}

function modifierIntervenant(index, nom, coche) {
  if (!cours[index]) return;
  const liste = new Set(normaliserIntervenants(cours[index].intervenants));
  if (coche) liste.add(nom);
  else liste.delete(nom);
  cours[index].intervenants = INTERVENANTS.filter(personne => liste.has(personne));
  sauvegarder();
  afficherTout();
}



function normaliserCoursPourPlanningActif() {
  const nomsActivites = new Set(ACTIVITES.map(a => a.nom));
  const nomsSalles = new Set(SALLES.map(s => s.nom));
  let modifie = false;

  cours = cours.map(c => {
    const copie = { ...c, intervenants: normaliserIntervenants(c.intervenants) };

    /*
     * Ne jamais remplacer silencieusement un cours enregistré.
     * Une activité absente du catalogue est conservée telle quelle.
     */
    if (!nomsActivites.has(copie.activite)) {
      console.warn("Activité conservée hors catalogue :", copie.activite);
    }

    if (!nomsSalles.has(copie.salle)) {
      copie.salle = SALLES[0].nom;
      modifie = true;
    }

    return copie;
  });

  if (modifie) sauvegarder();
}


/* V45.0 : restauration ciblée du Circuit Training ADO.
   Une seule migration, uniquement sur le créneau accidentellement remplacé. */
(function restaurerCircuitTrainingAdo(){
  const cleMigration = "dojo-migration-circuit-ado-v443";
  if (localStorage.getItem(cleMigration)) return;

  let modifie = false;
  cours = cours.map(c => {
    if (
      planningActif === "fitness" &&
      c.jour === "Mercredi" &&
      c.debut === "14:30" &&
      c.fin === "15:15" &&
      c.activite === "Stretching"
    ) {
      modifie = true;
      return {
        ...c,
        activite: "Circuit Training ADO 12-16 ans",
        intensite: 3,
        salle: "Petit Dojo",
        intervenants: normaliserIntervenants(c.intervenants)
      };
    }
    return c;
  });

  if (modifie) localStorage.setItem(STORAGE_KEY, JSON.stringify(cours));
  localStorage.setItem(cleMigration, "1");
})();


/* V45.4 : restauration des cours supprimés par l'ancien normaliseur. */
(function restaurerCoursV454() {
  const cle = "dojo-restauration-cours-v454";
  if (localStorage.getItem(cle)) return;

  function lire(cleStockage) {
    try {
      const valeur = JSON.parse(localStorage.getItem(cleStockage));
      return Array.isArray(valeur) ? valeur : [];
    } catch (_) {
      return [];
    }
  }

  const fitnessKey = PLANNING_CONFIGS.fitness.storageKey;
  const martialKey = PLANNING_CONFIGS.martial.storageKey;

  let fitness = lire(fitnessKey);
  let martial = lire(martialKey);

  fitness = fitness.map(c => {
    if (
      c.jour === "Mercredi" &&
      c.debut === "10:30" &&
      (c.fin === "11:00" || c.fin === "11:15") &&
      c.activite === "Stretching"
    ) {
      return {
        ...c,
        fin: "11:00",
        activite: "Instant Papote",
        intensite: 1,
        salle: "Espace Convivialité"
      };
    }

    if (
      c.jour === "Vendredi" &&
      c.debut === "17:15" &&
      c.fin === "18:00" &&
      (c.activite === "Yogalate" || c.activite === "Stretching")
    ) {
      return {
        ...c,
        activite: "Yogalates",
        intensite: 2,
        salle: "Petit Dojo"
      };
    }

    return c;
  });

  if (martial.length === 0) {
    martial = structuredClone(PLANNING_CONFIGS.martial.planningDefaut);
  }

  localStorage.setItem(fitnessKey, JSON.stringify(fitness));
  localStorage.setItem(martialKey, JSON.stringify(martial));
  localStorage.setItem(cle, "1");
})();

function chargerPlanning(type) {
  planningActif = type;
  configActive = PLANNING_CONFIGS[type] || PLANNING_CONFIGS.fitness;
  STORAGE_KEY = configActive.storageKey;
  SETTINGS_KEY = configActive.settingsKey;

  SALLES = configActive.salles;
  ACTIVITES = configActive.activites;
  PLANNING_DEFAUT = configActive.planningDefaut;

  cours = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(PLANNING_DEFAUT);
  settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  normaliserCoursPourPlanningActif();
  jourOuvert = "Lundi";
  carteOuverte = null;

  localStorage.setItem("dojo-planning-actif", planningActif);
  mettreAJourIdentitePlanning();
  afficherTout();
}


const FITNESS_COLOR_LEGEND_HTML = `
  <p class="legend-item color-item"><span class="dot blue"></span> Bien-être</p>
  <p class="legend-item color-item"><span class="dot green"></span> Santé / Douceur</p>
  <p class="legend-item color-item"><span class="dot orange"></span> Renfo musculaire</p>
  <p class="legend-item color-item"><span class="dot red"></span> Cardio musculaire</p>
  <p class="legend-item color-item"><span class="dot purple"></span> Tonicité</p>
  <p class="legend-item color-item"><span class="dot yellow"></span> Postural</p>
`;

const MARTIAL_COLOR_LEGEND_HTML = `
  <p class="legend-item color-item"><span class="dot martial-judo"></span> Judo</p>
  <p class="legend-item color-item"><span class="dot martial-karate"></span> Karaté</p>
  <p class="legend-item color-item"><span class="dot martial-full"></span> Full Contact</p>
  <p class="legend-item color-item"><span class="dot martial-ppg"></span> PPG Arts Martiaux</p>
  <p class="legend-item color-item"><span class="dot martial-eveil"></span> Éveil</p>
`;

function mettreAJourIdentitePlanning() {
  const isFitness = planningActif === "fitness";

  document.body.classList.toggle("planning-fitness", isFitness);
  document.body.classList.toggle("planning-martial", !isFitness);

  const colorLegend = document.getElementById("color-legend-grid");
  if (colorLegend) {
    colorLegend.innerHTML = isFitness ? FITNESS_COLOR_LEGEND_HTML : MARTIAL_COLOR_LEGEND_HTML;
  }

  const intensityCard = document.getElementById("legend-intensity-card");
  if (intensityCard) {
    intensityCard.hidden = !isFitness;
  }

  document.getElementById("sidebar-planning-title").textContent = configActive.label;
  document.getElementById("hero-main-title").textContent = configActive.titre;
  document.getElementById("hero-sub-title").textContent = configActive.sousTitre;
  document.title = `Planning ${configActive.label} Dojo - V27`;

  document.getElementById("switch-fitness").classList.toggle("active", isFitness);
  document.getElementById("switch-martial").classList.toggle("active", !isFitness);

  const heading = document.querySelector(".workspace-heading span");
  if (heading) {
    heading.textContent = `${configActive.label} · toutes les informations du planning`;
  }
}

const HORAIRES = [];
for (let h = 8; h <= 21; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 8 && m < 30) continue;
    if (h === 21 && m > 0) continue;
    HORAIRES.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function sauvegarder() {
  const ancienneValeur = localStorage.getItem(STORAGE_KEY);
  if (ancienneValeur) {
    localStorage.setItem(`${STORAGE_KEY}-sauvegarde-auto`, ancienneValeur);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cours));
}

function sauvegarderSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getActivite(nom) {
  return ACTIVITES.find(a => a.nom === nom) || ACTIVITES[0];
}

function getSalle(nom) {
  return SALLES.find(s => s.nom === nom) || SALLES[0];
}

function calculerDuree(debut, fin) {
  const [hd, md] = debut.split(":").map(Number);
  const [hf, mf] = fin.split(":").map(Number);
  return (hf * 60 + mf) - (hd * 60 + md);
}

function appliquerSettings() {
  if (settings.photoLeft) document.getElementById("hero-left").src = settings.photoLeft;
  if (settings.photoRight) document.getElementById("hero-right").src = settings.photoRight;
  if (settings.logo) document.getElementById("club-logo").src = settings.logo;
  document.documentElement.style.setProperty("--bamboo-img", settings.bamboo ? `url("${settings.bamboo}")` : `url("bambou.png")`);
  const poster = document.querySelector(".poster");
  if (poster) poster.classList.toggle("show-print-coaches", Boolean(settings.showPrintCoaches));
  const checkbox = document.getElementById("input-print-coaches");
  if (checkbox) checkbox.checked = Boolean(settings.showPrintCoaches);
}

function lireImage(input, key) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    settings[key] = reader.result;
    sauvegarderSettings();
    appliquerSettings();
  };
  reader.readAsDataURL(file);
}

function ajouterCours() {
  const activiteParDefaut = ACTIVITES[0];
  const salleParDefaut = SALLES[0];

  cours.push({
    jour: jourOuvert || "Lundi",
    debut: "17:00",
    fin: "17:45",
    activite: activiteParDefaut.nom,
    intensite: activiteParDefaut.intensite,
    salle: salleParDefaut.nom
  });

  carteOuverte = cours.length - 1;
  jourOuvert = cours[cours.length - 1].jour;
  sauvegarder();
  afficherTout();
}

function supprimerCours(index) {
  cours.splice(index, 1);
  carteOuverte = null;
  sauvegarder();
  afficherTout();
}

function ouvrirJour(jour) {
  jourOuvert = jourOuvert === jour ? null : jour;
  carteOuverte = null;
  afficherListeCours();
}

function ouvrirCarte(index) {
  carteOuverte = carteOuverte === index ? null : index;
  afficherListeCours();
}

function modifierCours(index, champ, valeur) {
  cours[index][champ] = valeur;
  if (champ === "jour") {
    jourOuvert = valeur;
    carteOuverte = index;
  }
  sauvegarder();
  afficherTout();
}

function modifierActivite(index, nouvelleActivite) {
  const activite = ACTIVITES.find(a => a.nom === nouvelleActivite);
  if (!activite || !cours[index]) return;

  cours[index].activite = activite.nom;
  cours[index].intensite = activite.intensite;
  sauvegarder();
  afficherTout();
}

function afficherListeCours() {
  const zone = document.getElementById("course-list");
  zone.innerHTML = "";

  JOURS.forEach(jour => {
    const coursDuJour = cours
      .map((c, index) => ({ ...c, index }))
      .filter(c => c.jour === jour)
      .sort((a, b) => a.debut.localeCompare(b.debut));

    const group = document.createElement("div");
    group.className = "day-group";
    group.innerHTML = `
      <div class="day-group-header" onclick="ouvrirJour('${jour}')">
        <strong>${jour}</strong>
        <span>${coursDuJour.length} cours ${jourOuvert === jour ? "▲" : "▼"}</span>
      </div>
      <div class="day-group-content" id="group-${jour}"></div>
    `;

    zone.appendChild(group);
    const content = document.getElementById(`group-${jour}`);

    if (jourOuvert !== jour) {
      content.style.display = "none";
      return;
    }

    coursDuJour.forEach(c => {
      const salle = getSalle(c.salle);
      const item = document.createElement("div");
      item.className = "course-item";
      if (carteOuverte === c.index) item.classList.add("open");

      item.innerHTML = `
        <div class="course-summary" onclick="ouvrirCarte(${c.index})">
          <div>
            <strong>${c.debut} · ${c.activite}</strong><br>
            <small>${salle.icone} ${salle.nom}${texteIntervenants(c) ? ` · 👤 ${texteIntervenants(c)}` : ""}</small>
          </div>
          <span>${carteOuverte === c.index ? "▲" : "▼"}</span>
        </div>

        <div class="course-form">
          <label>Jour</label>
          <select onchange="modifierCours(${c.index}, 'jour', this.value)">
            ${JOURS.map(j => `<option value="${j}" ${c.jour === j ? "selected" : ""}>${j}</option>`).join("")}
          </select>

          <label>Activité</label>
          <select onchange="modifierActivite(${c.index}, this.value)">
            ${ACTIVITES.map(a => `<option value="${a.nom}" ${c.activite === a.nom ? "selected" : ""}>${a.nom}</option>`).join("")}
          </select>

          <label>Début</label>
          <select onchange="modifierCours(${c.index}, 'debut', this.value)">
            ${HORAIRES.map(h => `<option value="${h}" ${c.debut === h ? "selected" : ""}>${h}</option>`).join("")}
          </select>

          <label>Fin</label>
          <select onchange="modifierCours(${c.index}, 'fin', this.value)">
            ${HORAIRES.map(h => `<option value="${h}" ${c.fin === h ? "selected" : ""}>${h}</option>`).join("")}
          </select>

          <label>Salle</label>
          <select onchange="modifierCours(${c.index}, 'salle', this.value)">
            ${SALLES.map(s => `<option value="${s.nom}" ${c.salle === s.nom ? "selected" : ""}>${s.icone} ${s.nom}</option>`).join("")}
          </select>

          <label>Intervenant(s)</label>
          <div class="coach-multiselect">
            ${INTERVENANTS.map(nom => `
              <label class="coach-choice">
                <input type="checkbox"
                  ${normaliserIntervenants(c.intervenants).includes(nom) ? "checked" : ""}
                  onchange="modifierIntervenant(${c.index}, '${nom}', this.checked)">
                <span>${nom}</span>
              </label>
            `).join("")}
          </div>

          <label>Intensité</label>
          <select onchange="modifierCours(${c.index}, 'intensite', Number(this.value))">
            <option value="1" ${c.intensite == 1 ? "selected" : ""}>●○○○</option>
            <option value="2" ${c.intensite == 2 ? "selected" : ""}>●●○○</option>
            <option value="3" ${c.intensite == 3 ? "selected" : ""}>●●●○</option>
            <option value="4" ${c.intensite == 4 ? "selected" : ""}>●●●●</option>
          </select>

          <button class="btn delete" onclick="supprimerCours(${c.index})">🗑 Supprimer</button>
        </div>
      `;
      content.appendChild(item);
    });
  });
}

function getDensiteJour(nombreCours) {
  if (nombreCours <= 1) return "count-1";
  if (nombreCours === 2) return "count-2";
  if (nombreCours === 3) return "count-3";
  if (nombreCours === 4) return "count-4";
  if (nombreCours === 5) return "count-5";
  if (nombreCours === 6) return "count-6";
  return "count-7";
}

function getDureeClass(duree) {
  if (duree <= 30) return "short";
  if (duree <= 45) return "medium";
  if (duree <= 60) return "long";
  return "extra-long";
}

function afficherPlanning() {
  const grille = document.getElementById("planning-grid");
  grille.innerHTML = "";

  JOURS.forEach(jour => {
    const colonne = document.createElement("div");
    const coursDuJour = cours
      .filter(c => c.jour === jour)
      .sort((a, b) => a.debut.localeCompare(b.debut));

    colonne.className = `day-column ${getDensiteJour(coursDuJour.length)}`;
    if (jour === "Samedi") colonne.classList.add("weekend-samedi");
    if (jour === "Dimanche") colonne.classList.add("weekend-dimanche");

    colonne.innerHTML = `
      <div class="day-title">${jour.toUpperCase()}</div>
      <div class="course-stack">
        ${coursDuJour.map(c => {
          const activite = getActivite(c.activite);
          const salle = getSalle(c.salle);
          const intensite = c.intensite || activite.intensite;
          const duree = calculerDuree(c.debut, c.fin);
          const texte = activite.couleurTexte || "#111827";
          const dureeClass = getDureeClass(duree);

          const nomLong = c.activite.length > 18 ? "course-name long-name" : "course-name";
          return `
            <div class="course-card" style="background:${activite.couleur}; color:${texte};">
              <div class="course-topline">
                <div class="course-place">
                  <span class="place-icon">${salle.icone}</span>
                  <span class="place-name">${salle.nom}</span>
                </div>

                <div class="course-time">${c.debut} - ${c.fin}</div>

                <div class="course-intensity" aria-label="Intensité ${intensite} sur 4">
                  ${"●".repeat(intensite)}${"○".repeat(4 - intensite)}
                </div>
              </div>

              <div class="${nomLong}">${c.activite}</div>
              ${texteIntervenants(c) ? `<div class="course-coaches">👤 ${texteIntervenants(c)}</div>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;

    grille.appendChild(colonne);
  });

  const samedi = grille.querySelector(".weekend-samedi");
  const dimanche = grille.querySelector(".weekend-dimanche");

  if (samedi && dimanche) {
    const weekend = document.createElement("div");
    weekend.className = "weekend-column";

    const weekendTitle = document.createElement("div");
    weekendTitle.className = "weekend-title";
    weekendTitle.textContent = "WEEK-END";

    weekend.appendChild(weekendTitle);
    weekend.appendChild(samedi);
    weekend.appendChild(dimanche);
    grille.appendChild(weekend);
  }
}


function afficherVueTravail() {
  const espace = document.getElementById("screen-workspace");
  if (!espace) return;

  espace.innerHTML = `
    <div class="workspace-heading">
      <strong>VUE DE TRAVAIL</strong>
      <span>Toutes les informations du planning, sans mise en page d’impression</span>
    </div>
    <div class="workspace-days">
      ${JOURS.map(jour => {
        const coursDuJour = cours
          .filter(c => c.jour === jour)
          .sort((a, b) => a.debut.localeCompare(b.debut));

        return `
          <section class="workspace-day">
            <h2>${jour.toUpperCase()}</h2>
            <div class="workspace-course-list">
              ${coursDuJour.map(c => {
                const activite = getActivite(c.activite);
                const salle = getSalle(c.salle);
                const intensite = c.intensite || activite.intensite;
                const texte = activite.couleurTexte || "#111827";

                return `
                  <article class="workspace-course" style="--course-bg:${activite.couleur};--course-text:${texte}">
                    <div class="workspace-time">${c.debut} – ${c.fin}</div>
                    <div class="workspace-name">${c.activite}</div>
                    <div class="workspace-meta">
                      <span>${salle.icone} ${salle.nom}</span>
                      <span aria-label="Intensité ${intensite} sur 4">${"●".repeat(intensite)}${"○".repeat(4-intensite)}</span>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function afficherTout() {
  afficherListeCours();
  afficherPlanning();
  afficherVueTravail();
  appliquerSettings();
}

document.getElementById("switch-fitness").addEventListener("click", () => chargerPlanning("fitness"));
document.getElementById("switch-martial").addEventListener("click", () => chargerPlanning("martial"));

document.getElementById("btn-add").addEventListener("click", ajouterCours);
function nettoyerIdsPourImpression(racine) {
  if (racine.id) racine.removeAttribute("id");
  racine.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
}

function capturerAffichePourImpression(type) {
  chargerPlanning(type);

  const affiche = document.querySelector(".poster").cloneNode(true);
  nettoyerIdsPourImpression(affiche);
  affiche.classList.add("print-poster", `print-poster-${type}`);

  return affiche.outerHTML;
}

function attendreImagesImpression(doc) {
  const images = Array.from(doc.images);
  if (!images.length) return Promise.resolve();

  return Promise.all(images.map(image => {
    if (image.complete) return Promise.resolve();

    return new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}

async function imprimerLesDeuxPlannings() {
  const planningAvantImpression = planningActif;

  const fitnessHtml = capturerAffichePourImpression("fitness");
  const martialHtml = capturerAffichePourImpression("martial");

  chargerPlanning(planningAvantImpression);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const baseUrl = new URL(".", window.location.href).href;

  /*
   * L'affiche est construite en A3 (420 × 297 mm).
   * Chaque SVG possède exactement ce même rapport, mais sa taille physique
   * est celle de la zone imprimable A4. Le navigateur ne voit donc jamais
   * un grand bloc A3 débordant : il imprime uniquement un SVG à la taille A4.
   */
  const svgPage = contenu => `
    <section class="print-sheet">
      <svg
        class="print-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="287mm"
        height="201mm"
        viewBox="0 0 1587.4016 1122.5197"
        preserveAspectRatio="xMidYMid meet"
      >
        <foreignObject x="0" y="0" width="1587.4016" height="1122.5197">
          <div xmlns="http://www.w3.org/1999/xhtml" class="svg-a3-canvas">
            ${contenu}
          </div>
        </foreignObject>
      </svg>
    </section>`;

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <base href="${baseUrl}">
  <title>Planning Dojo recto-verso</title>
  <link rel="stylesheet" href="planning-affiche.css?v=28.36">
  <style>
    @page {
      size: A4 landscape;
      margin: 4mm;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 289mm !important;
      height: auto !important;
      min-width: 0 !important;
      min-height: 0 !important;
      overflow: visible !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-sheet {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 289mm !important;
      height: 201mm !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /*
     * Le saut est placé AVANT la deuxième affiche.
     * Cela évite la page blanche que Chrome pouvait insérer lorsque
     * la première page occupait exactement toute la hauteur disponible.
     */
    .print-sheet + .print-sheet {
      break-before: page !important;
      page-break-before: always !important;
    }

    .print-svg {
      display: block !important;
      width: 287mm !important;
      height: 201mm !important;
      margin: 0 !important;
      overflow: hidden !important;
    }

    .svg-a3-canvas {
      position: relative !important;
      display: block !important;
      width: 420mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: white !important;
    }

    .svg-a3-canvas > .print-poster {
      position: relative !important;
      display: grid !important;
      width: 420mm !important;
      height: 297mm !important;
      min-width: 420mm !important;
      max-width: 420mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: hidden !important;
      transform: none !important;
      zoom: 1 !important;
    }
  </style>
</head>
<body>
  ${svgPage(fitnessHtml)}
  ${svgPage(martialHtml)}
</body>
</html>`);
  doc.close();

  await new Promise(resolve => {
    if (doc.readyState === "complete") resolve();
    else iframe.addEventListener("load", resolve, { once: true });
  });

  await attendreImagesImpression(doc);
  await new Promise(resolve => setTimeout(resolve, 500));

  const nettoyerIframe = () => setTimeout(() => iframe.remove(), 300);
  iframe.contentWindow.addEventListener("afterprint", nettoyerIframe, { once: true });

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  setTimeout(() => {
    if (iframe.isConnected) iframe.remove();
  }, 60000);
}

document.getElementById("btn-print").addEventListener("click", imprimerLesDeuxPlannings);

async function convertirImageEnDataUrl(src) {
  if (!src || src.startsWith("data:")) return src;
  try {
    const response = await fetch(src);
    if (!response.ok) return src;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return src;
  }
}

async function preparerAfficheWeb(type) {
  const html = capturerAffichePourImpression(type);
  const conteneur = document.createElement("div");
  conteneur.innerHTML = html;
  const affiche = conteneur.firstElementChild;

  const images = Array.from(affiche.querySelectorAll("img"));
  await Promise.all(images.map(async image => {
    const source = image.getAttribute("src");
    if (!source) return;
    const urlAbsolue = new URL(source, window.location.href).href;
    image.setAttribute("src", await convertirImageEnDataUrl(urlAbsolue));
  }));

  return affiche.outerHTML;
}

function telechargerFichier(nom, contenu, type = "text/html;charset=utf-8") {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


const COURSE_DETAILS_KEY = "dojo-course-details-v30";
let courseDetails = {};
try {
  courseDetails = JSON.parse(localStorage.getItem(COURSE_DETAILS_KEY) || "{}") || {};
} catch (error) {
  console.warn("Les fiches enregistrées étaient illisibles. Une bibliothèque vide a été recréée.", error);
  courseDetails = {};
}

function toutesLesActivites() {
  const noms = new Set();
  Object.values(PLANNING_CONFIGS).forEach(config => (config.activites || []).forEach(a => noms.add(a.nom)));
  return Array.from(noms).sort((a, b) => a.localeCompare(b, "fr"));
}

function ficheCours(nom) {
  return courseDetails[nom] || { description: "" };
}

function sauvegarderFicheCours() {
  const nom = document.getElementById("details-course-select").value;
  courseDetails[nom] = {
    description: document.getElementById("details-description").value.trim()
  };
  localStorage.setItem(COURSE_DETAILS_KEY, JSON.stringify(courseDetails));
  const status = document.getElementById("details-save-status");
  status.textContent = `Fiche « ${nom} » enregistrée.`;
  setTimeout(() => { if (status.textContent.includes(nom)) status.textContent = ""; }, 2200);
}

function chargerFicheDansEditeur() {
  const nom = document.getElementById("details-course-select").value;
  const fiche = ficheCours(nom);
  document.getElementById("details-description").value = fiche.description || "";
  document.getElementById("details-save-status").textContent = "";
}

function ouvrirEditeurFiches() {
  const select = document.getElementById("details-course-select");
  if (!select.options.length) {
    toutesLesActivites().forEach(nom => {
      const option = document.createElement("option");
      option.value = nom;
      option.textContent = nom;
      select.appendChild(option);
    });
  }
  chargerFicheDansEditeur();
  document.getElementById("course-details-modal").hidden = false;
}

function fermerEditeurFiches() {
  document.getElementById("course-details-modal").hidden = true;
}

async function exporterPageQr() {
  const bouton = document.getElementById("btn-export-web");
  const planningAvantExport = planningActif;
  bouton.disabled = true;
  bouton.textContent = "⏳ Création de la page…";

  try {
    const imageLogo = document.getElementById("club-logo");
    let logoDojoMobile = settings.logo || "";
    if (imageLogo && imageLogo.getAttribute("src")) {
      const urlLogo = new URL(imageLogo.getAttribute("src"), window.location.href).href;
      logoDojoMobile = await convertirImageEnDataUrl(urlLogo);
    }

    const lirePlanningMobile = type => {
      chargerPlanning(type);
      const config = PLANNING_CONFIGS[type];
      return {
        type,
        titre: config.titre,
        sousTitre: config.sousTitre,
        cours: structuredClone(cours),
        activites: structuredClone(ACTIVITES),
        salles: structuredClone(SALLES),
        logo: logoDojoMobile,
        fiches: structuredClone(courseDetails)
      };
    };

    const donnees = {
      fitness: lirePlanningMobile("fitness"),
      martial: lirePlanningMobile("martial")
    };
    chargerPlanning(planningAvantExport);

    const donneesJson = JSON.stringify(donnees).replace(/</g, "\\u003c");
    const joursJson = JSON.stringify(JOURS).replace(/</g, "\\u003c");

    const pageTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Plannings du Dojo Club de Vieux-Condé</title>
<style>
:root{font-family:Arial,Helvetica,sans-serif;color:#111827;background:#0f172a}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#0f172a}button{font:inherit}
.home{min-height:100vh;padding:24px 16px;display:flex;align-items:flex-start;justify-content:center;background:linear-gradient(145deg,#0f172a,#24324a)}
.home.hidden{display:none}.home-card{width:min(100%,560px);background:#fff;border-radius:24px;padding:26px 18px;box-shadow:0 24px 70px rgba(0,0,0,.35);text-align:center}
.home-card h1{font-size:30px;line-height:1.05;margin:0 0 8px}.home-card p{margin:0;color:#64748b;font-weight:700}.choices{display:grid;gap:14px;margin-top:26px}
.choice{border:0;border-radius:16px;padding:19px 16px;color:#fff;font-weight:900;font-size:20px;cursor:pointer}.choice-fitness{background:#1677d2}.choice-martial{background:#c9252d}
.view{display:none;min-height:100vh;background:#eef2f7}.view.active{display:block}.toolbar{position:sticky;top:0;z-index:100;background:rgba(15,23,42,.97);padding:12px max(14px,env(safe-area-inset-right)) 12px max(14px,env(safe-area-inset-left));display:flex;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,.28)}
.toolbar button{border:0;border-radius:13px;padding:12px 22px;background:#fff;color:#1677d2;font-size:18px;font-weight:900;cursor:pointer}.mobile-planning{width:min(100%,680px);margin:0 auto;padding:14px 12px 36px}
.mobile-header{position:relative;overflow:hidden;border-radius:20px;background:linear-gradient(115deg,#e8edf5 0%,#dce6f0 66%,#0873aa 100%);border:4px solid #fff;box-shadow:0 8px 24px rgba(15,23,42,.18);padding:18px 16px;margin-bottom:15px}
.mobile-header:after{content:"";position:absolute;left:0;right:0;bottom:0;height:7px;background:linear-gradient(90deg,#ef233c 0 34%,#0ea5e9 34% 72%,#ef233c 72%)}
.brand-row{display:flex;align-items:center;gap:13px}.brand-logo{width:76px;height:76px;border-radius:50%;background:#fff;border:4px solid #3b82a8;object-fit:contain;padding:4px;flex:0 0 auto}.brand-placeholder{display:grid;place-items:center;font-size:38px}
.brand-title{text-align:left;min-width:0}.brand-title h1{margin:0;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.38);font-size:clamp(28px,8vw,40px);line-height:.95;letter-spacing:2px}.brand-title h2{margin:4px 0 0;color:#bcecff;text-shadow:0 2px 4px rgba(0,0,0,.38);font-size:clamp(18px,5.5vw,27px);line-height:1}.season{display:inline-block;margin-top:10px;background:#df2935;color:#fff;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:900;letter-spacing:1px}
.muscu-hours{background:#fff;border-radius:18px;padding:14px;margin-bottom:14px;box-shadow:0 8px 22px rgba(15,23,42,.12);border-top:6px solid #1677d2}.muscu-hours h3{margin:0 0 6px;text-align:center;font-size:23px;color:#0f172a}.muscu-hours .subtitle{text-align:center;font-weight:900;color:#1677d2;margin-bottom:12px}.muscu-grid{display:grid;gap:9px}.muscu-line{display:grid;grid-template-columns:minmax(108px,.9fr) 1.5fr;gap:12px;align-items:start;padding:10px 11px;background:#f1f5f9;border-radius:12px}.muscu-day{font-weight:950;color:#0f172a}.muscu-time{font-weight:850;color:#334155;line-height:1.45}.muscu-access{margin-top:12px;text-align:center;font-weight:900;color:#166534;background:#dcfce7;border-radius:12px;padding:11px}
.day{background:#fff;border-radius:18px;padding:12px;margin-bottom:14px;box-shadow:0 8px 22px rgba(15,23,42,.12)}.day h3{margin:0 0 12px;background:linear-gradient(#171a21,#05060a);color:#fff;border-radius:13px;padding:13px 10px;text-align:center;font-size:22px;letter-spacing:1px}
.course{display:block;width:100%;border-radius:16px;padding:14px 14px 13px;margin-top:11px;box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 5px 12px rgba(15,23,42,.12);border:1px solid rgba(255,255,255,.75);cursor:pointer;position:relative;text-align:inherit;touch-action:manipulation;-webkit-tap-highlight-color:rgba(14,165,233,.18)}.course>span{display:block}.course:after{content:'Voir la fiche ›';display:block;text-align:center;margin-top:10px;font-size:13px;font-weight:900;opacity:.72}.course:active{transform:scale(.99)}.course:focus-visible{outline:4px solid #0ea5e9;outline-offset:2px}.course:first-of-type{margin-top:0}
.time{font-size:22px;font-weight:950;text-align:center;line-height:1.1;padding-bottom:9px;border-bottom:1px solid rgba(15,23,42,.22)}.name{font-size:clamp(22px,6.8vw,32px);font-weight:950;line-height:1.02;text-align:center;margin:12px 0 10px;overflow-wrap:anywhere}.meta{display:flex;align-items:center;justify-content:center;gap:8px;font-size:16px;font-weight:850;text-align:center}.intensity{margin-top:8px;text-align:center;font-size:17px;letter-spacing:2px}.footer-note{text-align:center;color:#64748b;font-weight:700;font-size:13px;padding:8px 0 0}
.sheet-overlay{position:fixed;inset:0;z-index:500;background:rgba(15,23,42,.72);display:none;align-items:flex-end;justify-content:center;padding:12px}.sheet-overlay.open{display:flex}.sheet{width:min(100%,680px);max-height:88vh;overflow:auto;background:#fff;border-radius:24px 24px 18px 18px;padding:22px 18px 18px;box-shadow:0 -20px 60px rgba(0,0,0,.32)}.sheet-grip{width:58px;height:5px;border-radius:9px;background:#cbd5e1;margin:-8px auto 16px}.sheet h2{margin:0;text-align:center;font-size:28px;line-height:1.05}.sheet-grid{display:grid;gap:10px;margin:18px 0}.sheet-row{background:#f1f5f9;border-radius:13px;padding:12px}.sheet-label{display:block;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px}.sheet-value{font-weight:900;color:#0f172a;line-height:1.35}.sheet-description{white-space:pre-line;font-weight:700;line-height:1.55;color:#334155}.sheet-close{width:100%;border:0;border-radius:14px;padding:14px;background:#1677d2;color:#fff;font-size:18px;font-weight:950;cursor:pointer}
@media(min-width:720px){.mobile-planning{padding-left:20px;padding-right:20px}.name{font-size:30px}}
</style>
</head>
<body>
<section id="home" class="home"><div class="home-card"><h1>📅 Plannings 2026-2027</h1><p>Dojo Club de Vieux-Condé</p><div class="choices"><button type="button" class="choice choice-fitness" data-action="open-planning" data-type="fitness">🏋️ Fitness &amp; Bien-être</button><button type="button" class="choice choice-martial" data-action="open-planning" data-type="martial">🥋 Arts martiaux &amp; disciplines associées</button></div></div></section>
<section id="view" class="view"><div class="toolbar"><button type="button" data-action="back">← Retour</button></div><main id="planning" class="mobile-planning"></main></section>
<div id="sheetOverlay" class="sheet-overlay"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"><div class="sheet-grip"></div><h2 id="sheetTitle"></h2><div id="sheetContent" class="sheet-grid"></div><button type="button" class="sheet-close" data-action="close-sheet">Fermer</button></section></div>
<script>
'use strict';
const DONNEES=__DONNEES__;
const JOURS=__JOURS__;
function echapper(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
function ouvrirPlanning(type){document.getElementById('home').classList.add('hidden');document.getElementById('view').classList.add('active');rendre(type);window.scrollTo(0,0);}
function retourAccueil(){fermerFiche();document.getElementById('view').classList.remove('active');document.getElementById('home').classList.remove('hidden');window.scrollTo(0,0);}
function ouvrirFiche(type,index){var d=DONNEES[type];if(!d)return;var c=d.cours[index];if(!c)return;var fiche=d.fiches&&d.fiches[c.activite]?d.fiches[c.activite]:{};var a=(d.activites||[]).find(function(x){return x.nom===c.activite;})||{};document.getElementById('sheetTitle').textContent=c.activite;var lignes='<div class="sheet-row"><span class="sheet-label">Coach</span><div class="sheet-value">'+echapper(fiche.coach||'À renseigner')+'</div></div>'+'<div class="sheet-row"><span class="sheet-label">Horaire</span><div class="sheet-value">'+echapper(c.debut)+' - '+echapper(c.fin)+'</div></div>'+'<div class="sheet-row"><span class="sheet-label">Lieu</span><div class="sheet-value">'+echapper(c.salle)+'</div></div>';if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);lignes+='<div class="sheet-row"><span class="sheet-label">Intensité</span><div class="sheet-value">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</div></div>';}lignes+='<div class="sheet-row"><span class="sheet-label">Description</span><div class="sheet-description">'+echapper(fiche.description||'Description à renseigner dans le logiciel avant le prochain export.')+'</div></div>';document.getElementById('sheetContent').innerHTML=lignes;document.getElementById('sheetOverlay').classList.add('open');document.body.style.overflow='hidden';}
function fermerFiche(){document.getElementById('sheetOverlay').classList.remove('open');document.body.style.overflow='';}
function rendre(type){
  var d=DONNEES[type]; if(!d)return;
  var activites={}; (d.activites||[]).forEach(function(a){activites[a.nom]=a;});
  var salles={}; (d.salles||[]).forEach(function(s){salles[s.nom]=s;});
  var logo=d.logo?'<img class="brand-logo" src="'+d.logo+'" alt="Logo du Dojo">':'<div class="brand-logo brand-placeholder">🥋</div>';
  var html='<header class="mobile-header"><div class="brand-row">'+logo+'<div class="brand-title"><h1>'+echapper(d.titre)+'</h1><h2>'+echapper(d.sousTitre)+'</h2><span class="season">SAISON 2026-2027</span></div></div></header>';
  html+='<section class="muscu-hours"><h3>🏋️ ESPACE MUSCULATION</h3><div class="subtitle">Horaires d’ouverture</div><div class="muscu-grid"><div class="muscu-line"><div class="muscu-day">Lundi</div><div class="muscu-time">13h45 à 20h45</div></div><div class="muscu-line"><div class="muscu-day">Mardi au vendredi</div><div class="muscu-time">8h45 à 12h00<br>13h45 à 20h45</div></div><div class="muscu-line"><div class="muscu-day">Samedi</div><div class="muscu-time">8h45 à 12h00<br>13h45 à 16h30</div></div><div class="muscu-line"><div class="muscu-day">Dimanche</div><div class="muscu-time">8h45 à 12h00</div></div></div><div class="muscu-access">Accès libre pendant les horaires d’ouverture.</div></section>';
  JOURS.forEach(function(jour){
    var liste=[];
    (d.cours||[]).forEach(function(c,index){if(c.jour===jour){var copie={};Object.keys(c).forEach(function(k){copie[k]=c[k];});copie.__index=index;liste.push(copie);}});
    liste.sort(function(a,b){return a.debut.localeCompare(b.debut);}); if(!liste.length)return;
    html+='<section class="day"><h3>'+echapper(jour.toUpperCase())+'</h3>';
    liste.forEach(function(c){
      var a=activites[c.activite]||{}, salle=salles[c.salle]||{}, bg=a.couleur||'#e2e8f0', fg=a.couleurTexte||'#111827', intensite='';
      if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);intensite='<span class="intensity" aria-label="Intensité '+n+' sur 4">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</span>';}
      html+='<button type="button" class="course" data-type="'+echapper(type)+'" data-index="'+c.__index+'" style="background:'+echapper(bg)+';color:'+echapper(fg)+'"><span class="time">'+echapper(c.debut)+' - '+echapper(c.fin)+'</span><span class="name">'+echapper(c.activite)+'</span><span class="meta"><span>'+echapper(salle.icone||'📍')+'</span><span>'+echapper(c.salle)+'</span></span>'+intensite+'</button>';
    }); html+='</section>';
  });
  html+='<div class="footer-note">Planning susceptible d’évoluer. Consultez cette page pour la dernière version.</div>';
  var planning=document.getElementById('planning'); planning.innerHTML=html;
  var boutons=planning.querySelectorAll('.course');
  for(var i=0;i<boutons.length;i++)(function(bouton){bouton.onclick=function(e){if(e){e.preventDefault();e.stopPropagation();}ouvrirFiche(bouton.getAttribute('data-type'),Number(bouton.getAttribute('data-index')));};})(boutons[i]);
}
document.querySelector('.choice-fitness').onclick=function(){ouvrirPlanning('fitness');};
document.querySelector('.choice-martial').onclick=function(){ouvrirPlanning('martial');};
document.querySelector('[data-action="back"]').onclick=retourAccueil;
document.querySelector('[data-action="close-sheet"]').onclick=fermerFiche;
document.getElementById('sheetOverlay').addEventListener('click',function(event){if(event.target===this)fermerFiche();});
document.addEventListener('keydown',function(event){if(event.key==='Escape')fermerFiche();});
</script>
</body>
</html>`;

    const page = pageTemplate
      .replace("__DONNEES__", donneesJson)
      .replace("__JOURS__", joursJson);

    telechargerFichier("index.html", page);
    alert("La page index.html a été créée. Les cours sont cliquables et les fiches enregistrées sont intégrées au fichier.");
  } catch (error) {
    console.error(error);
    alert("L’export n’a pas pu être créé. Ouvre l’application depuis son dossier extrait puis réessaie.");
  } finally {
    chargerPlanning(planningAvantExport);
    bouton.disabled = false;
    bouton.textContent = "🌐 Exporter la page QR";
  }
}

document.getElementById("btn-export-web").addEventListener("click", exporterPageQr);



document.getElementById("btn-course-details").addEventListener("click", ouvrirEditeurFiches);
document.getElementById("btn-close-details").addEventListener("click", fermerEditeurFiches);
document.getElementById("btn-close-details-bottom").addEventListener("click", fermerEditeurFiches);
document.getElementById("btn-save-details").addEventListener("click", sauvegarderFicheCours);
document.getElementById("details-course-select").addEventListener("change", chargerFicheDansEditeur);
document.getElementById("course-details-modal").addEventListener("click", event => {
  if (event.target.id === "course-details-modal") fermerEditeurFiches();
});

document.getElementById("btn-settings").addEventListener("click", () => {
  document.getElementById("settings-panel").classList.toggle("open");
});

document.getElementById("input-photo-left").addEventListener("change", e => lireImage(e.target, "photoLeft"));
document.getElementById("input-photo-right").addEventListener("change", e => lireImage(e.target, "photoRight"));
document.getElementById("input-logo").addEventListener("change", e => lireImage(e.target, "logo"));
document.getElementById("input-bamboo").addEventListener("change", e => lireImage(e.target, "bamboo"));

document.getElementById("btn-reset-images").addEventListener("click", () => {
  settings = {};
  sauvegarderSettings();
  location.reload();
});

normaliserCoursPourPlanningActif();
mettreAJourIdentitePlanning();
afficherTout();


/* ===== V42.0 : publication automatique PC -> mobile ===== */
const PUBLICATION_API = "http://127.0.0.1:4172/api/publish";

function afficherEtatPublication(message, type = "") {
  const zone = document.getElementById("publish-status");
  const texte = document.getElementById("publish-status-text");
  if (!zone || !texte) return;
  zone.hidden = false;
  zone.classList.remove("success", "error");
  if (type) zone.classList.add(type);
  texte.textContent = message;
}

async function preparerDonneesMobiles() {
  const planningAvantPublication = planningActif;
  const imageLogo = document.getElementById("club-logo");
  let logoDojoMobile = settings.logo || "";

  if (imageLogo && imageLogo.getAttribute("src")) {
    const urlLogo = new URL(imageLogo.getAttribute("src"), window.location.href).href;
    logoDojoMobile = await convertirImageEnDataUrl(urlLogo);
  }

  const lirePlanningMobile = type => {
    chargerPlanning(type);
    const config = PLANNING_CONFIGS[type];
    return {
      type,
      titre: config.titre,
      sousTitre: config.sousTitre,
      cours: structuredClone(cours),
      activites: structuredClone(ACTIVITES),
      salles: structuredClone(SALLES),
      logo: logoDojoMobile,
      fiches: structuredClone(courseDetails)
    };
  };

  const donnees = {
    fitness: lirePlanningMobile("fitness"),
    martial: lirePlanningMobile("martial")
  };

  chargerPlanning(planningAvantPublication);
  return donnees;
}

async function publierPlanningMobile() {
  const bouton = document.getElementById("btn-publish");
  bouton.disabled = true;
  bouton.textContent = "⏳ Publication en cours…";
  afficherEtatPublication("Préparation des cours et des fiches…");

  try {
    const donnees = await preparerDonneesMobiles();

    afficherEtatPublication("Envoi au module de publication local…");
    const reponse = await fetch(PUBLICATION_API, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        donnees,
        version: "V45.0",
        message: "Mise à jour automatique du planning mobile"
      })
    });

    const resultat = await reponse.json().catch(() => ({}));
    if (!reponse.ok || !resultat.ok) {
      throw new Error(resultat.error || "La publication a échoué.");
    }

    if (resultat.unchanged) {
      afficherEtatPublication("ℹ️ Aucune modification détectée : rien à envoyer.", "success");
      alert("Aucune modification à publier.");
    } else {
      const confirmation = resultat.online
        ? `✅ ${resultat.version} est publiée et le site répond correctement.`
        : `✅ ${resultat.version} est envoyée sur GitHub. GitHub Pages termine encore son déploiement.`;
      afficherEtatPublication(confirmation, "success");
      alert(
        `Publication réussie !\n\n${resultat.version}\n` +
        `Fitness : ${resultat.fitness} cours\n` +
        `Arts martiaux : ${resultat.martial} cours\n\n` +
        `L'application mobile va se mettre à jour.`
      );
    }
  } catch (error) {
    console.error(error);
    afficherEtatPublication(
      "❌ Publication impossible. Lance d’abord « DEMARRER-DOJO-MANAGER.bat », puis réessaie. " + error.message,
      "error"
    );
    alert(
      "Publication impossible.\n\n" +
      "Double-clique sur DEMARRER-DOJO-MANAGER.bat, puis ouvre le planning depuis la page qui se lance."
    );
  } finally {
    bouton.disabled = false;
    bouton.textContent = "🚀 Publier sur le mobile";
  }
}

document.getElementById("btn-publish")?.addEventListener("click", publierPlanningMobile);



async function verifierModulePublication() {
  try {
    const reponse = await fetch("http://127.0.0.1:4172/api/status", { cache: "no-store" });
    const resultat = await reponse.json();
    if (!reponse.ok || !resultat.ok) throw new Error(resultat.error || "Module indisponible");
    afficherEtatPublication("✅ Module de publication prêt.", "success");
  } catch (error) {
    afficherEtatPublication("⚠️ Publication non prête : " + error.message, "error");
  }
}
window.addEventListener("load", verifierModulePublication);

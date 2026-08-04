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

normaliserHoraires();

function normaliserCoursPourPlanningActif() {
  const nomsActivites = new Set(ACTIVITES.map(a => a.nom));
  const nomsSalles = new Set(SALLES.map(s => s.nom));
  let modifie = false;

  cours = cours.map(c => {
    const copie = { ...c };

    if (!nomsActivites.has(copie.activite)) {
      copie.activite = ACTIVITES[0].nom;
      copie.intensite = ACTIVITES[0].intensite;
      modifie = true;
    }

    if (!nomsSalles.has(copie.salle)) {
      copie.salle = SALLES[0].nom;
      modifie = true;
    }

    return copie;
  });

  if (modifie) sauvegarder();
}

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
  normaliserHoraires();
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


function formaterHoraireMuscuPourAffiche(horaire) {
  const [debut, fin] = horaire.split(" à ");
  return `<div class="time-slot"><span class="word">DE</span><strong>${debut}</strong><span class="word">À</span><strong>${fin}</strong></div>`;
}

function genererHorairesMusculationAffiche() {
  const libelles = {
    "Lundi": "LUNDI",
    "Mardi et jeudi": "MARDI ET JEUDI",
    "Mercredi et vendredi": "MERCREDI ET VENDREDI",
    "Samedi": "SAMEDI",
    "Dimanche": "DIMANCHE"
  };

  return HORAIRES_MUSCULATION.map(item => {
    const horaires = item.horaires.map(horaire => {
      const [debut, fin] = horaire.split(" à ");
      return `<div class="muscu-period">
        <span class="muscu-label">DE</span>
        <strong>${debut}</strong>
        <span class="muscu-label">À</span>
        <strong>${fin}</strong>
      </div>`;
    }).join('<div class="muscu-divider"><span>ET</span></div>');

    const typePlage = item.horaires.length > 1 ? "muscu-double" : "muscu-single";

    return `<div class="muscu-day ${typePlage}">
      <h4>${libelles[item.jour] || item.jour.toUpperCase()}</h4>
      <div class="muscu-body">${horaires}</div>
    </div>`;
  }).join("");
}

function genererHorairesMusculationMobile() {
  return HORAIRES_MUSCULATION.map(item => {
    return `<div class="muscu-line"><div class="muscu-day">${item.jour}</div><div class="muscu-time">${item.horaires.join("<br>")}</div></div>`;
  }).join("");
}

function mettreAJourHorairesMusculationAffiche() {
  document.querySelectorAll(".muscu-grid-v27-5").forEach(grille => {
    grille.innerHTML = genererHorairesMusculationAffiche();
  });
}

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

function ajouterMinutes(heure, minutes) {
  const [h, m] = heure.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function normaliserHoraires() {
  let modifie = false;
  cours.forEach(c => {
    if (calculerDuree(c.debut, c.fin) <= 0) {
      const activite = getActivite(c.activite);
      c.fin = ajouterMinutes(c.debut, activite.duree || 45);
      modifie = true;
    }
  });
  if (modifie) sauvegarder();
}

function appliquerSettings() {
  if (settings.photoLeft) document.getElementById("hero-left").src = settings.photoLeft;
  if (settings.photoRight) document.getElementById("hero-right").src = settings.photoRight;
  if (settings.logo) document.getElementById("club-logo").src = settings.logo;
  document.documentElement.style.setProperty("--bamboo-img", settings.bamboo ? `url("${settings.bamboo}")` : `url("bambou.png")`);
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
  const coursModifie = cours[index];
  if (!coursModifie) return;
  coursModifie[champ] = valeur;
  if (champ === "jour") {
    jourOuvert = valeur;
    carteOuverte = index;
  }
  if ((champ === "debut" || champ === "fin") && calculerDuree(coursModifie.debut, coursModifie.fin) <= 0) {
    const activite = getActivite(coursModifie.activite);
    coursModifie.fin = ajouterMinutes(coursModifie.debut, activite.duree || 45);
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
            <small>${salle.icone} ${salle.nom}</small>
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
  mettreAJourHorairesMusculationAffiche();
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


const COURSE_DETAILS_KEY = "dojo-course-details-v31";
const DEFAULT_COURSE_DETAILS = {
  "Judo": {
    "coach": "",
    "description": "Le judo est un art martial basé sur les projections, les immobilisations et le contrôle de l’adversaire. Il développe la confiance en soi, le respect, la discipline et la maîtrise de soi, dans un esprit de partage et de progression."
  },
  "Karaté": {
    "coach": "",
    "description": "Le karaté est un art martial fondé sur les techniques de coups de poing, de pied et de défense. Il développe la concentration, la maîtrise de soi, la discipline et le respect, tout en améliorant la coordination et la confiance en soi."
  },
  "Karaté 6 ans et plus": {
    "coach": "",
    "description": "Cours de karaté accessible dès 6 ans. Les pratiquants découvrent et développent les techniques de base, la coordination, la concentration, la discipline et le respect, dans une progression adaptée à leur âge."
  },
  "Karaté + de 12 ans": {
    "coach": "",
    "description": "Cours de karaté destiné aux pratiquants de plus de 12 ans. Le travail porte sur l’approfondissement technique, la précision, la vitesse, la condition physique, la maîtrise de soi et la progression personnelle."
  },

  "Full Contact": {
    "coach": "",
    "description": "Le Full Contact combine puissance, vitesse et précision. Cette discipline améliore la condition physique, les réflexes et la maîtrise de soi dans un environnement sécurisé."
  },
  "Cross Training": {
    "coach": "",
    "description": "Combinaison d’exercices de cardio, de renforcement musculaire et de mobilité. Idéal pour améliorer sa condition physique générale."
  },
  "Fit Rox / Crosstraining": {
    "coach": "",
    "description": "Cours combinant cardio et renforcement musculaire pour un entraînement complet."
  },
  "Step": {
    "coach": "",
    "description": "Cours utilisant un step, une marche, pour réaliser des mouvements en rythme et chorégraphiés."
  },
  "Biking": {
    "coach": "",
    "description": "Cours de vélo indoor basé sur un travail de force, de vitesse et de puissance."
  },
  "Zumba": {
    "coach": "",
    "description": "La Zumba est un cours de fitness rythmé et ludique, qui mélange danse latine et mouvements cardio."
  },
  "Cardio Box": {
    "coach": "",
    "description": "Mouvements de boxe et de karaté couplés à des phases de renforcement musculaire."
  },
  "Body Move": {
    "coach": "",
    "description": "Cours mêlant cardio, renforcement musculaire et coordination, en musique et dans la bonne humeur."
  },
  "Body Move Kids": {
    "coach": "",
    "description": "Cours mêlant cardio, renforcement musculaire et coordination, en musique et dans la bonne humeur, dans un format adapté aux enfants."
  },
  "Body Move Seniors": {
    "coach": "",
    "description": "Cours mêlant cardio, renforcement musculaire et coordination, en musique et dans la bonne humeur, dans un format adapté aux seniors."
  },
  "Instant Papote": {
    "coach": "",
    "description": "Moment convivial d'échange, de discussion et de lien social à destination des participants."
  },

  "Gym Douce": {
    "coach": "",
    "description": "Renforcement musculaire de l’ensemble du corps, sans charges. Ce cours est idéal pour la reprise d’une activité ou en entretien."
  },
  "Gym Ball": {
    "coach": "",
    "description": "Cours sur swiss ball renforçant les muscles profonds, l’équilibre et la posture."
  },
  "Body Sculpt": {
    "coach": "",
    "description": "Cours de renforcement musculaire complet utilisant du petit matériel pour tonifier l’ensemble du corps."
  },
  "Abdos Flash": {
    "coach": "",
    "description": "Cours ciblé sur le renforcement de la sangle abdominale et des muscles du dos pour améliorer le gainage et la posture."
  },
  "Abdos": {
    "coach": "",
    "description": "Cours ciblé sur le renforcement de la sangle abdominale et des muscles du dos pour améliorer le gainage et la posture."
  },
  "Cuisses Fessiers": {
    "coach": "",
    "description": "Cours ciblé sur le renforcement et la tonification des cuisses, des fessiers et des jambes."
  },
  "Cuisses Abdos Fessiers": {
    "coach": "",
    "description": "Cours ciblé sur le renforcement et la tonification des cuisses, des abdominaux et des fessiers."
  },
  "Yoga": {
    "coach": "",
    "description": "Yoga dynamique qui enchaîne les postures en harmonie avec la respiration. Il améliore la souplesse, la force et le bien-être."
  },
  "Yin Yoga": {
    "coach": "",
    "description": "Yoga doux et méditatif favorisant la relaxation, la souplesse et le lâcher-prise grâce à des postures maintenues plusieurs minutes."
  },
  "Pilates": {
    "coach": "",
    "description": "Méthode douce qui renforce les muscles profonds, améliore la posture, la souplesse et le contrôle du corps."
  },
  "Gym Bien-être": {
    "coach": "",
    "description": "Gymnastique douce adaptée à tous, favorisant le renforcement musculaire, la mobilité et le bien-être au quotidien."
  },
  "Stretching": {
    "coach": "",
    "description": "Cours d’étirements favorisant la souplesse, la mobilité articulaire et la récupération musculaire."
  },
  "Yogalates": {
    "coach": "",
    "description": "Cours associant les bienfaits du yoga et du Pilates pour améliorer la posture, la souplesse et le renforcement des muscles profonds."
  },
  "Éveil Kids": {
    "coach": "",
    "description": "À partir de 15 mois, l’enfant découvre une activité conçue pour favoriser son développement moteur dans un environnement ludique, sécurisé et bienveillant. Chaque séance est adaptée à son âge afin de lui permettre d’évoluer à son rythme tout en prenant plaisir à bouger."
  }
};
let courseDetails = {};
try {
  const savedDetails = JSON.parse(localStorage.getItem(COURSE_DETAILS_KEY) || "{}") || {};
  courseDetails = structuredClone(DEFAULT_COURSE_DETAILS);
  Object.entries(savedDetails).forEach(([nom, fiche]) => {
    courseDetails[nom] = { ...(courseDetails[nom] || { coach: "", description: "" }), ...(fiche || {}) };
  });
} catch (error) {
  console.warn("Les fiches enregistrées étaient illisibles. Une bibliothèque vide a été recréée.", error);
  courseDetails = structuredClone(DEFAULT_COURSE_DETAILS);
}

function toutesLesActivites() {
  const noms = new Set();
  Object.values(PLANNING_CONFIGS).forEach(config => (config.activites || []).forEach(a => noms.add(a.nom)));
  return Array.from(noms).sort((a, b) => a.localeCompare(b, "fr"));
}

function ficheCours(nom) {
  return courseDetails[nom] || DEFAULT_COURSE_DETAILS[nom] || { coach: "", description: "" };
}

function sauvegarderFicheCours() {
  const nom = document.getElementById("details-course-select").value;
  courseDetails[nom] = {
    coach: document.getElementById("details-coach").value.trim(),
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
  document.getElementById("details-coach").value = fiche.coach || "";
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
  bouton.textContent = "⏳ Création de la page V33.13…";

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
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f172a">
<title>Planning mobile du Dojo Club de Vieux-Condé</title>
<style>
:root{font-family:Arial,Helvetica,sans-serif;color:#0f172a;background:#0f172a;--blue:#1677d2;--red:#c9252d}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#0f172a}button{font:inherit}.hidden{display:none!important}
.home{min-height:100vh;padding:28px 16px;display:flex;align-items:flex-start;justify-content:center;background:radial-gradient(circle at 20% 0,#334b70,#0f172a 55%)}
.home-card{width:min(100%,570px);overflow:hidden;background:#fff;border-radius:28px;box-shadow:0 28px 80px rgba(0,0,0,.42)}
.home-top{padding:28px 20px 22px;text-align:center;background:linear-gradient(145deg,#edf4fb,#fff)}
.home-logo{width:92px;height:92px;object-fit:contain;border-radius:50%;background:#fff;border:4px solid #3b82a8;padding:4px;box-shadow:0 8px 24px rgba(15,23,42,.2)}
.home-card h1{font-size:30px;line-height:1.05;margin:14px 0 7px}.home-card p{margin:0;color:#64748b;font-weight:800}.choices{display:grid;gap:14px;padding:20px}
.choice{border:0;border-radius:19px;padding:21px 16px;color:#fff;font-weight:950;font-size:20px;cursor:pointer;box-shadow:0 8px 20px rgba(15,23,42,.18);touch-action:manipulation}.choice-fitness{background:linear-gradient(135deg,#1688e7,#0b5faf)}.choice-martial{background:linear-gradient(135deg,#e43c46,#a81522)}
.view{display:none;min-height:100vh;background:#eef2f7}.view.active{display:block}.toolbar{position:sticky;top:0;z-index:100;background:rgba(15,23,42,.97);padding:11px max(14px,env(safe-area-inset-right)) 11px max(14px,env(safe-area-inset-left));display:flex;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,.28)}
.toolbar button{border:0;border-radius:13px;padding:12px 24px;background:#fff;color:var(--blue);font-size:18px;font-weight:950;cursor:pointer}.mobile-planning{width:min(100%,700px);margin:0 auto;padding:14px 12px 42px}
.mobile-header{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(115deg,#e8edf5 0%,#dce6f0 63%,#0873aa 100%);border:4px solid #fff;box-shadow:0 8px 24px rgba(15,23,42,.18);padding:18px 16px;margin-bottom:15px}.mobile-header:after{content:"";position:absolute;left:0;right:0;bottom:0;height:7px;background:linear-gradient(90deg,#ef233c 0 34%,#0ea5e9 34% 72%,#ef233c 72%)}
.brand-row{display:flex;align-items:center;gap:13px}.brand-logo{width:76px;height:76px;border-radius:50%;background:#fff;border:4px solid #3b82a8;object-fit:contain;padding:4px;flex:0 0 auto}.brand-placeholder{display:grid;place-items:center;font-size:38px}.brand-title{text-align:left;min-width:0}.brand-title h1{margin:0;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.38);font-size:clamp(28px,8vw,40px);line-height:.95;letter-spacing:2px}.brand-title h2{margin:4px 0 0;color:#bcecff;text-shadow:0 2px 4px rgba(0,0,0,.38);font-size:clamp(18px,5.5vw,27px);line-height:1}.season{display:inline-block;margin-top:10px;background:#df2935;color:#fff;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:950;letter-spacing:1px}
.muscu-hours{background:#fff;border-radius:19px;padding:14px;margin-bottom:14px;box-shadow:0 8px 22px rgba(15,23,42,.12);border-top:6px solid var(--blue)}.muscu-hours h3{margin:0 0 6px;text-align:center;font-size:23px}.muscu-hours .subtitle{text-align:center;font-weight:950;color:var(--blue);margin-bottom:12px}.muscu-grid{display:grid;gap:9px}.muscu-line{display:grid;grid-template-columns:minmax(108px,.9fr) 1.5fr;gap:12px;align-items:start;padding:10px 11px;background:#f1f5f9;border-radius:12px}.muscu-day{font-weight:950}.muscu-time{font-weight:850;color:#334155;line-height:1.45}.muscu-access{margin-top:12px;text-align:center;font-weight:950;color:#166534;background:#dcfce7;border-radius:12px;padding:11px}
.day{background:#fff;border-radius:19px;padding:12px;margin-bottom:14px;box-shadow:0 8px 22px rgba(15,23,42,.12)}.day h3{margin:0 0 12px;background:linear-gradient(#171a21,#05060a);color:#fff;border-radius:13px;padding:13px 10px;text-align:center;font-size:22px;letter-spacing:1px}
.course{display:block;width:100%;border-radius:17px;padding:14px;margin-top:11px;box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 6px 14px rgba(15,23,42,.14);border:1px solid rgba(255,255,255,.8);cursor:pointer;position:relative;text-align:inherit;touch-action:manipulation;-webkit-tap-highlight-color:rgba(14,165,233,.18)}.course>span{display:block}.course:after{content:'Découvrir le cours  ›';display:block;text-align:center;margin-top:10px;padding-top:9px;border-top:1px solid rgba(15,23,42,.17);font-size:13px;font-weight:950;opacity:.76}.course:active{transform:scale(.99)}.course:first-of-type{margin-top:0}.time{font-size:21px;font-weight:950;text-align:center;line-height:1.1}.name{font-size:clamp(22px,6.8vw,32px);font-weight:950;line-height:1.02;text-align:center;margin:12px 0 10px;overflow-wrap:anywhere}.meta{display:flex!important;align-items:center;justify-content:center;gap:8px;font-size:16px;font-weight:850;text-align:center}.intensity{margin-top:8px;text-align:center;font-size:17px;letter-spacing:2px}.footer-note{text-align:center;color:#64748b;font-weight:750;font-size:13px;padding:8px 0 0}
.sheet-overlay{position:fixed;inset:0;z-index:500;background:rgba(2,6,23,.78);display:none;align-items:flex-end;justify-content:center;padding:10px}.sheet-overlay.open{display:flex}.sheet{width:min(100%,700px);max-height:92vh;overflow:auto;background:#fff;border-radius:28px 28px 18px 18px;box-shadow:0 -24px 70px rgba(0,0,0,.4)}.sheet-grip{width:58px;height:5px;border-radius:9px;background:#cbd5e1;margin:10px auto 7px}.sheet-hero{position:relative;overflow:hidden;padding:25px 18px 22px;text-align:center;color:#fff;background:linear-gradient(135deg,#1677d2,#0f3f78)}.sheet-hero.martial{background:linear-gradient(135deg,#d93842,#84131d)}.sheet-icon{width:62px;height:62px;margin:0 auto 10px;display:grid;place-items:center;border-radius:20px;background:rgba(255,255,255,.17);font-size:33px;border:1px solid rgba(255,255,255,.35)}.sheet-hero h2{margin:0;font-size:30px;line-height:1.05}.sheet-kicker{margin-top:7px;font-size:13px;font-weight:950;text-transform:uppercase;letter-spacing:1.1px;opacity:.86}.sheet-body{padding:16px 16px 18px}.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.quick-card{min-height:86px;background:#f1f5f9;border-radius:15px;padding:12px;border:1px solid #e2e8f0}.quick-card.full{grid-column:1/-1}.quick-icon{font-size:21px;margin-bottom:5px}.sheet-label{display:block;color:#64748b;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px}.sheet-value{font-weight:950;color:#0f172a;line-height:1.35}.intensity-large{font-size:20px;letter-spacing:3px}.description-card{margin-top:12px;padding:16px;border-radius:17px;background:linear-gradient(145deg,#f8fafc,#edf2f7);border-left:5px solid var(--blue)}.description-card.martial{border-left-color:var(--red)}.description-title{font-size:13px;text-transform:uppercase;letter-spacing:.8px;font-weight:950;color:#475569;margin-bottom:8px}.sheet-description{white-space:pre-line;font-weight:750;line-height:1.6;color:#334155;font-size:16px}.all-times{margin-top:12px;padding:14px;border-radius:17px;background:#fff7ed;border:1px solid #fed7aa}.all-times-title{font-size:13px;text-transform:uppercase;letter-spacing:.8px;font-weight:950;color:#9a3412;margin-bottom:8px}.slot{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid #fed7aa;font-weight:850}.slot:first-of-type{border-top:0}.slot-day{color:#7c2d12}.slot-time{text-align:right}.sheet-close{width:100%;border:0;border-radius:15px;padding:15px;background:#1677d2;color:#fff;font-size:18px;font-weight:950;cursor:pointer;margin-top:14px}.version-badge{position:fixed;right:9px;bottom:9px;z-index:120;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:6px 10px;font-size:11px;font-weight:950;box-shadow:0 4px 12px rgba(0,0,0,.25)}
@media(min-width:720px){.mobile-planning{padding-left:20px;padding-right:20px}.name{font-size:30px}.sheet-overlay{align-items:center}.sheet{border-radius:28px}}
</style>
</head>
<body>
<section id="home" class="home"><div class="home-card"><div class="home-top"><div id="homeLogo"></div><h1>📅 Plannings 2026-2027</h1><p>Dojo Club de Vieux-Condé</p></div><div class="choices"><button type="button" class="choice choice-fitness" data-open="fitness">🏋️ Fitness &amp; Bien-être</button><button type="button" class="choice choice-martial" data-open="martial">🥋 Arts martiaux &amp; disciplines associées</button></div></div></section>
<section id="view" class="view"><div class="toolbar"><button type="button" id="backButton">← Retour</button></div><main id="planning" class="mobile-planning"></main></section>
<div id="sheetOverlay" class="sheet-overlay" aria-hidden="true"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"><div class="sheet-grip"></div><div id="sheetHero" class="sheet-hero"><div id="sheetIcon" class="sheet-icon"></div><h2 id="sheetTitle"></h2><div id="sheetKicker" class="sheet-kicker"></div></div><div class="sheet-body"><div id="sheetQuick" class="quick-grid"></div><div id="sheetDescription" class="description-card"></div><div id="sheetTimes" class="all-times"></div><button type="button" id="closeSheet" class="sheet-close">Fermer</button></div></section></div>
<div class="version-badge">V33.13</div>
<script>
'use strict';
const DONNEES=__DONNEES__;
const JOURS=__JOURS__;
let typeActif='fitness';
function echapper(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
function logoAccueil(){var d=DONNEES.fitness||DONNEES.martial;document.getElementById('homeLogo').innerHTML=d&&d.logo?'<img class="home-logo" src="'+d.logo+'" alt="Logo du Dojo">':'<div class="home-logo" style="display:grid;place-items:center;font-size:42px">🥋</div>';}
function ouvrirPlanning(type){typeActif=type;document.getElementById('home').classList.add('hidden');document.getElementById('view').classList.add('active');rendre(type);window.scrollTo(0,0);}
function retourAccueil(){fermerFiche();document.getElementById('view').classList.remove('active');document.getElementById('home').classList.remove('hidden');window.scrollTo(0,0);}
function iconeActivite(nom,type){if(type==='martial'){if(nom.indexOf('Judo')>=0)return '🥋';if(nom.indexOf('Karat')>=0)return '🥊';if(nom.indexOf('Full')>=0)return '🥊';return '🎯';}var n=nom.toLowerCase();if(n.indexOf('bike')>=0||n.indexOf('biking')>=0)return '🚴';if(n.indexOf('yoga')>=0||n.indexOf('pilates')>=0||n.indexOf('stretch')>=0)return '🧘';if(n.indexOf('box')>=0)return '🥊';if(n.indexOf('zumba')>=0||n.indexOf('move')>=0||n.indexOf('step')>=0)return '🎵';if(n.indexOf('cross')>=0||n.indexOf('rox')>=0)return '🔥';return '🏋️';}
function ouvrirFiche(type,index){var d=DONNEES[type];if(!d)return;var c=d.cours[index];if(!c)return;var fiche=d.fiches&&d.fiches[c.activite]?d.fiches[c.activite]:{};var a=(d.activites||[]).find(function(x){return x.nom===c.activite;})||{};var salle=(d.salles||[]).find(function(x){return x.nom===c.salle;})||{};var isMartial=type==='martial';document.getElementById('sheetTitle').textContent=c.activite;document.getElementById('sheetKicker').textContent=isMartial?'Art martial & discipline associée':'Fitness & bien-être';document.getElementById('sheetIcon').textContent=iconeActivite(c.activite,type);document.getElementById('sheetHero').className='sheet-hero'+(isMartial?' martial':'');var coach=fiche.coach||'À renseigner';var quick='<div class="quick-card"><div class="quick-icon">👤</div><span class="sheet-label">Coach</span><div class="sheet-value">'+echapper(coach)+'</div></div><div class="quick-card"><div class="quick-icon">🕒</div><span class="sheet-label">Horaire</span><div class="sheet-value">'+echapper(c.debut)+' - '+echapper(c.fin)+'</div></div><div class="quick-card"><div class="quick-icon">'+echapper(salle.icone||'📍')+'</div><span class="sheet-label">Lieu</span><div class="sheet-value">'+echapper(c.salle)+'</div></div>';if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);quick+='<div class="quick-card"><div class="quick-icon">🔥</div><span class="sheet-label">Intensité</span><div class="sheet-value intensity-large">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</div></div>';}else{quick+='<div class="quick-card"><div class="quick-icon">📅</div><span class="sheet-label">Jour</span><div class="sheet-value">'+echapper(c.jour)+'</div></div>';}document.getElementById('sheetQuick').innerHTML=quick;var desc=document.getElementById('sheetDescription');desc.className='description-card'+(isMartial?' martial':'');desc.innerHTML='<div class="description-title">À propos du cours</div><div class="sheet-description">'+echapper(fiche.description||'Description à renseigner dans le logiciel avant le prochain export.')+'</div>';var slots=(d.cours||[]).filter(function(x){return x.activite===c.activite;}).sort(function(x,y){var a=JOURS.indexOf(x.jour),b=JOURS.indexOf(y.jour);return a-b||x.debut.localeCompare(y.debut);});document.getElementById('sheetTimes').innerHTML='<div class="all-times-title">Tous les créneaux de cette activité</div>'+slots.map(function(x){return '<div class="slot"><span class="slot-day">'+echapper(x.jour)+'</span><span class="slot-time">'+echapper(x.debut)+' - '+echapper(x.fin)+' · '+echapper(x.salle)+'</span></div>';}).join('');document.getElementById('sheetOverlay').classList.add('open');document.getElementById('sheetOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function fermerFiche(){document.getElementById('sheetOverlay').classList.remove('open');document.getElementById('sheetOverlay').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function rendre(type){var d=DONNEES[type];if(!d)return;var activites={};(d.activites||[]).forEach(function(a){activites[a.nom]=a;});var salles={};(d.salles||[]).forEach(function(s){salles[s.nom]=s;});var logo=d.logo?'<img class="brand-logo" src="'+d.logo+'" alt="Logo du Dojo">':'<div class="brand-logo brand-placeholder">🥋</div>';var html='<header class="mobile-header"><div class="brand-row">'+logo+'<div class="brand-title"><h1>'+echapper(d.titre)+'</h1><h2>'+echapper(d.sousTitre)+'</h2><span class="season">SAISON 2026-2027</span></div></div></header>';html+='<section class="muscu-hours"><h3>🏋️ ESPACE MUSCULATION</h3><div class="subtitle">Horaires d’ouverture</div><div class="muscu-grid">__HORAIRES_MUSCU__</div><div class="muscu-access">Accès libre pendant les horaires d’ouverture.</div></section>';JOURS.forEach(function(jour){var liste=[];(d.cours||[]).forEach(function(c,index){if(c.jour===jour){var copie=Object.assign({},c,{__index:index});liste.push(copie);}});liste.sort(function(a,b){return a.debut.localeCompare(b.debut);});if(!liste.length)return;html+='<section class="day"><h3>'+echapper(jour.toUpperCase())+'</h3>';liste.forEach(function(c){var a=activites[c.activite]||{},salle=salles[c.salle]||{},bg=a.couleur||'#e2e8f0',fg=a.couleurTexte||'#111827',intensite='';if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);intensite='<span class="intensity" aria-label="Intensité '+n+' sur 4">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</span>';}html+='<button type="button" class="course" data-type="'+echapper(type)+'" data-index="'+c.__index+'" style="background:'+echapper(bg)+';color:'+echapper(fg)+'"><span class="time">'+echapper(c.debut)+' - '+echapper(c.fin)+'</span><span class="name">'+echapper(c.activite)+'</span><span class="meta"><span>'+echapper(salle.icone||'📍')+'</span><span>'+echapper(c.salle)+'</span></span>'+intensite+'</button>';});html+='</section>';});html+='<div class="footer-note">Planning susceptible d’évoluer. Consultez cette page pour la dernière version.</div>';document.getElementById('planning').innerHTML=html;}
document.addEventListener('click',function(event){var open=event.target.closest('[data-open]');if(open){ouvrirPlanning(open.getAttribute('data-open'));return;}var course=event.target.closest('.course');if(course){event.preventDefault();ouvrirFiche(course.getAttribute('data-type'),Number(course.getAttribute('data-index')));return;}if(event.target.id==='backButton'){retourAccueil();return;}if(event.target.id==='closeSheet'){fermerFiche();return;}if(event.target.id==='sheetOverlay'){fermerFiche();}});
document.addEventListener('keydown',function(event){if(event.key==='Escape')fermerFiche();});
logoAccueil();
</script>
</body>
</html>`;

    const page = pageTemplate
      .replace("__DONNEES__", donneesJson)
      .replace("__JOURS__", joursJson)
      .replace("__HORAIRES_MUSCU__", genererHorairesMusculationMobile());

    if (!page.includes("V33.13") || !page.includes("const DONNEES=")) {
      throw new Error("Le contrôle interne de l’export V33.13 a échoué.");
    }

    telechargerFichier("index.html", page);
    alert("Le fichier index.html V33.13 a été créé. Il contient le planning actuel, les fiches, les coachs et la nouvelle présentation mobile.");
  } catch (error) {
    console.error(error);
    alert("L’export V33.13 n’a pas pu être créé. Ouvre l’application depuis son dossier extrait puis réessaie.");
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

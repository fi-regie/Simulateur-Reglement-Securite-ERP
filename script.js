// --- State Management ---
const state = {
    capacity: 450,
    materialFocus: 1 // Default M1
};

// --- Chart Instances ---
let classificationChartInstance = null;
let materialsChartInstance = null;
let evacChartInstance = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initClassificationChart();
    initMaterialsChart();
    initEvacChart();
    
    // Initial calculations
    updateClassification(state.capacity);
    updateEvacuation(500);

    // Listeners
    document.getElementById('calcBtn').addEventListener('click', () => {
        const val = parseInt(document.getElementById('capacityInput').value);
        if(!isNaN(val)) updateClassification(val);
    });

    document.getElementById('capacityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(document.getElementById('capacityInput').value);
            if(!isNaN(val)) updateClassification(val);
        }
    });

    document.getElementById('evacSlider').addEventListener('input', (e) => {
        updateEvacuation(parseInt(e.target.value));
    });
});

// --- Section 1: Classification Logic ---
function updateClassification(capacity) {
    state.capacity = capacity;
    
    // Logic based on flashcards/quiz source
    let category, desc, implication, barColors;
    
    if (capacity > 1500) {
        category = "1ère Catégorie";
        desc = "Plus de 1 500 personnes.";
        implication = "Contrôles stricts. Présence permanente SSIAP 1, 2 et 3.";
        barColors = ['#cbd5e1', '#cbd5e1', '#cbd5e1', '#ea580c']; // Highlight 1st
    } else if (capacity > 700) {
        category = "2ème Catégorie";
        desc = "De 701 à 1 500 personnes.";
        implication = "Visite périodique. Présence SSIAP adaptée.";
        barColors = ['#cbd5e1', '#cbd5e1', '#ea580c', '#cbd5e1']; // Highlight 2nd
    } else if (capacity > 300) {
        category = "3ème Catégorie";
        desc = "De 301 à 700 personnes.";
        implication = "Seuil critique de 700. Visite périodique tous les 3-5 ans.";
        barColors = ['#cbd5e1', '#ea580c', '#cbd5e1', '#cbd5e1']; // Highlight 3rd
    } else {
        // Covers 4th and 5th for simplicity of chart visualization
        category = capacity < 50 ? "5ème Catégorie" : "4ème Catégorie";
        desc = capacity < 50 ? "Petits établissements (seuil bas)." : "Moins de 300 personnes.";
        implication = "Règlementation allégée mais obligations de sécurité maintenues.";
        barColors = ['#ea580c', '#cbd5e1', '#cbd5e1', '#cbd5e1']; // Highlight 4th/5th
    }

    // Update UI
    document.getElementById('catText').textContent = category;
    document.getElementById('catDesc').textContent = desc;
    document.getElementById('catImplication').textContent = implication;

    // Update Chart Colors
    if(classificationChartInstance) {
        classificationChartInstance.data.datasets[0].backgroundColor = barColors;
        classificationChartInstance.update();
    }
}

function initClassificationChart() {
    const ctx = document.getElementById('classificationChart').getContext('2d');
    classificationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cat 4/5 (<300)', 'Cat 3 (301-700)', 'Cat 2 (701-1500)', 'Cat 1 (>1500)'],
            datasets: [{
                label: 'Capacité',
                data: [300, 700, 1500, 2000], // Visual heights
                backgroundColor: ['#cbd5e1', '#ea580c', '#cbd5e1', '#cbd5e1'],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { 
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const labels = ['Moins de 300 pers.', '301-700 pers.', '701-1500 pers.', 'Plus de 1500 pers.'];
                            return labels[context.dataIndex] + ' : ' + context.parsed.y + ' personnes (seuil)';
                        }
                    }
                }
            },
            scales: {
                y: { 
                    display: true,
                    title: { display: true, text: 'Jauge (Personnes)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// --- Section 2: Materials Logic ---
function highlightMaterial(index) {
    // Reset styles
    document.querySelectorAll('.material-card').forEach(el => {
        el.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50', 'ring-slate-400', 'bg-stone-50');
        el.classList.add('bg-white');
    });

    // Highlight selected
    const ids = ['m0-card', 'm1-card', 'm2-card', 'm4-card'];
    const selected = document.getElementById(ids[index]);
    selected.classList.remove('bg-white');
    selected.classList.add('bg-stone-50', 'ring-2', 'ring-slate-400');

    // Update Chart Highlight
    const colors = ['#a8a29e', '#10b981', '#f97316', '#ef4444'];
    const bgColors = colors.map((c, i) => i === index ? c : c + '40'); // Dim others
    
    materialsChartInstance.data.datasets[0].backgroundColor = bgColors;
    materialsChartInstance.update();
}

function initMaterialsChart() {
    const ctx = document.getElementById('materialsChart').getContext('2d');
    materialsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['M0 (Structure)', 'M1 (Décors)', 'M2 (Mobilier)', 'M3/M4 (Interdit)'],
            datasets: [{
                data: [20, 50, 20, 10], // Representative proportions for visual
                backgroundColor: ['#a8a29e', '#10b981', '#f97316', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10 } } },
                title: { display: true, text: 'Répartition de Sécurité Idéale' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const materials = {
                                'M0 (Structure)': 'Incombustible - Structure porteuse',
                                'M1 (Décors)': 'Non inflammable - Décors obligatoires',
                                'M2 (Mobilier)': 'Difficilement inflammable - Mobilier',
                                'M3/M4 (Interdit)': 'Interdit en zone publique'
                            };
                            return materials[context.label] || context.label;
                        }
                    }
                }
            },
            cutout: '60%',
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    highlightMaterial(index);
                }
            }
        }
    });
}

// --- Section 3: Evacuation Logic ---
function updateEvacuation(val) {
    document.getElementById('evacValue').textContent = val;
    
    // Logic: 
    // <= 500 pers: roughly 1 UP per 100 pers (simplified rule for viz)
    // > 500 pers: +1 UP per 100 pers
    // Note: Strict rules are 1-19: 1 UP, 20-100: 2 UP, etc. 
    // For this simulator, we linearize it to show the trend.
    
    let ups = Math.ceil(val / 100);
    if(ups < 2 && val > 19) ups = 2; // Min 2 exits often required
    
    // 1 UP = 0.60m for calculation mass, but physical widths differ.
    // We'll display the theoretical flow width = UP * 0.60
    let width = (ups * 0.60).toFixed(2);

    document.getElementById('upResult').textContent = ups;
    document.getElementById('widthResult').textContent = width + "m";

    // Update chart point
    // We don't really need to update the dataset every time for a static line, 
    // but we could show a "You are here" point.
    // For simplicity, we just keep the reference line.
}

function initEvacChart() {
    const ctx = document.getElementById('evacChart').getContext('2d');
    
    // Generate trend data
    const population = [0, 100, 300, 500, 700, 1000, 1500, 2000];
    const widths = population.map(p => (Math.ceil(p/100) * 0.60));

    evacChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: population,
            datasets: [{
                label: 'Largeur requise (m)',
                data: widths,
                borderColor: '#059669',
                backgroundColor: '#05966920',
                fill: true,
                tension: 0.1,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#059669'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(2) + ' mètres de large';
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Public (Personnes)' },
                    grid: { color: '#e2e8f0' }
                },
                y: { 
                    title: { display: true, text: 'Largeur Cumulée (m)' },
                    grid: { color: '#e2e8f0' }
                }
            }
        }
    });
}

// --- Utility Functions ---
function resetAll() {
    // Reset capacity input
    document.getElementById('capacityInput').value = 450;
    updateClassification(450);
    
    // Reset evacuation slider
    document.getElementById('evacSlider').value = 500;
    updateEvacuation(500);
    
    // Reset materials highlight
    highlightMaterial(1);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make functions available globally
window.highlightMaterial = highlightMaterial;
window.resetAll = resetAll;

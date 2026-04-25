import os, re

city_data = {
    'rabat': {
        'name': 'Rabat',
        'neighborhoods': 'Agdal, Hay Riad, Souissi, Hassan, Aviation',
        'nearby': 'Salé, Témara, Skhirat',
        'delay': '24 à 48h',
        'context': "Capitale administrative du Maroc, Rabat concentre une forte demande en miroirs de qualité, notamment dans les quartiers résidentiels haut de gamme d'Agdal et Hay Riad. Les immeubles neufs et villas de Souissi optent souvent pour des miroirs <strong>LED anti-buée avec cadre aluminium</strong> — le standard des promoteurs immobiliers modernes.",
        'tip': 'Pour les projets de riad ou de villa à Rabat-Salé-Kénitra, nous recommandons les modèles <a href="/miroir-avec-cadre/" style="color:#cc2366">avec cadre</a> pour les salles de bain de prestige et les <a href="/miroir-salle-de-bain-led/" style="color:#cc2366">modèles LED</a> pour les espaces sans fenêtre.',
    },
    'marrakech': {
        'name': 'Marrakech',
        'neighborhoods': 'Gueliz, Hivernage, Palmeraie, Targa, M\'hamid',
        'nearby': 'Bensergao, Tamansourt',
        'delay': '48 à 72h',
        'context': "Marrakech est l'une de nos destinations phares pour les projets haut de gamme. Les riads de la médina, les villas de la Palmeraie et les hôtels de Gueliz recherchent des miroirs <strong>design et sur mesure</strong> qui se marient avec l'architecture locale. Les formes rondes, organiques et avec cadre doré sont particulièrement prisées.",
        'tip': 'Pour un riad ou une villa à Marrakech, découvrez nos <a href="/miroir-rond/" style="color:#cc2366">miroirs ronds</a> et nos modèles <a href="/miroir-avec-cadre/" style="color:#cc2366">avec cadre doré ou bois</a> — parfaits pour l\'esthétique marocaine contemporaine.',
    },
    'tanger': {
        'name': 'Tanger',
        'neighborhoods': 'Malabata, Moghogha, Tanger City Center, Ibéria',
        'nearby': 'Tétouan, Asilah, M\'diq',
        'delay': '48 à 72h',
        'context': "Tanger connaît un boom immobilier important grâce à son développement économique (zone franche, port Tanger Med). Les nouveaux quartiers résidentiels de Malabata et Moghogha concentrent une forte demande en miroirs de salle de bain <strong>LED et anti-buée</strong>, adaptés aux immeubles modernes. L'humidité côtière rend l'anticorrosion indispensable.",
        'tip': 'Le climat côtier de Tanger rend le traitement <a href="/miroir-salle-de-bain-anti-buee/" style="color:#cc2366">anti-buée</a> particulièrement recommandé. Nos modèles anticorrosion résistent aux environnements marins.',
    },
    'fes': {
        'name': 'Fès',
        'neighborhoods': 'Agdal, Atlas, Narjiss, Saïss',
        'nearby': 'Meknès, Sefrou',
        'delay': '48 à 72h',
        'context': "Fès, capitale spirituelle et culturelle du Maroc, allie tradition et modernité. Les riads de la médina se rénovent avec des miroirs qui respectent l'esprit du lieu : formes travaillées, cadres en bois ou laiton. Les quartiers modernes d'Agdal et Narjiss optent pour des <strong>miroirs LED rectangulaires</strong> contemporains.",
        'tip': 'Pour une rénovation de riad à Fès, nos <a href="/miroir-avec-cadre/" style="color:#cc2366">miroirs avec cadre</a> en bois noyer ou finition laiton s\'intègrent parfaitement à l\'architecture traditionnelle marocaine.',
    },
    'agadir': {
        'name': 'Agadir',
        'neighborhoods': 'Founty, Hay Dakhla, Cité Suisse, Tilila',
        'nearby': 'Inezgane, Aït Melloul, Tiznit',
        'delay': '48 à 72h',
        'context': "Station balnéaire internationale, Agadir concentre un fort volume de projets hôteliers et résidentiels touristiques. Les appartements en front de mer et les villas de Tilila choisissent des miroirs <strong>LED anti-buée de grand format</strong>. L'humidité océanique rend l'anticorrosion indispensable pour éviter les points noirs au bout de quelques mois.",
        'tip': 'À Agadir, la proximité de l\'océan accélère la corrosion des miroirs bas de gamme. Nos miroirs avec verre AGC Belgique et traitement anticorrosion durent 10+ ans. Voir nos <a href="/miroir-salle-de-bain-anti-buee/" style="color:#cc2366">modèles anti-buée</a>.',
    },
    'meknes': {
        'name': 'Meknès',
        'neighborhoods': 'Hamria, Borj Sud, Plaisance, Riad',
        'nearby': 'Fès, Khénifra, Ifrane',
        'delay': '48 à 72h',
        'context': "Meknès, ville impériale au cœur du Maroc, voit ses quartiers résidentiels de Hamria et Plaisance se moderniser rapidement. La proximité avec Fès (1h) permet une livraison express. Les promoteurs immobiliers apprécient nos <strong>miroirs LED standards</strong> pour les logements neufs et nos modèles sur mesure pour les maisons individuelles.",
        'tip': 'Meknès est à mi-chemin entre Casablanca et Fès — nous livrons en 48h. Pas de surcoût pour les villes à moins de 300 km. <a href="/miroir-salle-de-bain-fes/" style="color:#cc2366">Voir aussi nos livraisons à Fès</a>.',
    },
    'oujda': {
        'name': 'Oujda',
        'neighborhoods': 'Lazaret, Al Qods, Sidi Maâfa, Centre-ville',
        'nearby': 'Berkane, Nador, Saïdia',
        'delay': '72h à 5 jours',
        'context': "Oujda, capitale de l'oriental marocain, est une ville en pleine croissance universitaire et résidentielle. Les nouvelles résidences du quartier Al Qods et les villas de la périphérie choisissent des miroirs de salle de bain modernes. Nova Style livre <strong>partout en oriental</strong> — Oujda, Berkane, Nador, Saïdia.",
        'tip': 'Pour les commandes dans l\'oriental marocain, prévoir un délai légèrement plus long (72h à 5 jours). Commandez suffisamment à l\'avance pour les projets avec une date d\'inauguration fixe.',
    },
    'kenitra': {
        'name': 'Kénitra',
        'neighborhoods': 'Bir Rami, OLM Souissi, Kénitra Nord',
        'nearby': 'Salé, Rabat, Sidi Kacem',
        'delay': '24 à 48h',
        'context': "Kénitra, à seulement 40 km de Rabat, bénéficie de la même dynamique immobilière que la capitale. Les quartiers de Bir Rami et OLM Souissi concentrent des projets résidentiels modernes avec une forte demande en miroirs <strong>LED rectangulaires</strong> pour salles de bain standards. La proximité géographique permet une livraison express.",
        'tip': 'Kénitra étant proche de Rabat, nous pouvons grouper les livraisons. <a href="/miroir-salle-de-bain-rabat/" style="color:#cc2366">Voir aussi nos livraisons à Rabat</a> — même délai, même service.',
    },
    'eljadida': {
        'name': 'El Jadida',
        'neighborhoods': 'Haouzia, Azemmour, Sidi Bouzid',
        'nearby': 'Safi, Azemmour, Mohammedia',
        'delay': '24 à 48h',
        'context': "El Jadida, ville côtière atlantique à 1h de Casablanca, voit ses résidences balnéaires de Haouzia et Sidi Bouzid se développer rapidement. Le profil acheteur — maisons de vacances et résidences secondaires — favorise les miroirs <strong>anti-buée</strong> (humidité marine) et les designs contemporains.",
        'tip': 'Comme Agadir, El Jadida est soumise à l\'humidité marine. Nos miroirs <a href="/miroir-salle-de-bain-anti-buee/" style="color:#cc2366">anti-buée et anticorrosion</a> sont fortement recommandés pour les résidences en front de mer.',
    },
    'tetouan': {
        'name': 'Tétouan',
        'neighborhoods': 'Martil, M\'diq, Cabo Negro, Centre médina',
        'nearby': 'M\'diq, Chefchaouen, Tanger',
        'delay': '48 à 72h',
        'context': "Tétouan et ses stations balnéaires (Martil, M'diq, Cabo Negro) constituent un marché prisé pour les résidences de vacances et les hôtels. L'influence méditerranéenne dans l'architecture locale se prête bien aux miroirs <strong>avec cadre aluminium ou bois</strong>. L'humidité méditerranéenne rend l'anti-buée indispensable.",
        'tip': 'Pour les propriétés dans le triangle Tétouan–M\'diq–Martil, nos modèles <a href="/miroir-avec-cadre/" style="color:#cc2366">avec cadre aluminium</a> — durables, résistants à la corrosion marine — sont le meilleur choix.',
    },
    'mohammedia': {
        'name': 'Mohammedia',
        'neighborhoods': 'Ain Harrouda, Centre-ville, Banlieue nord',
        'nearby': 'Casablanca, Bouskoura, Zenata',
        'delay': '24h',
        'context': "Mohammedia est la ville la plus proche de notre atelier de Casablanca (30 min) — ce qui en fait notre délai de livraison le plus court. Les projets résidentiels d'Ain Harrouda et les appartements du front de mer bénéficient d'un service <strong>express quasi-immédiat</strong>. Vous pouvez même visiter notre showroom.",
        'tip': 'Vous êtes à Mohammedia ? Visitez notre atelier à Bd Oued Sebou, Rue 13 N°24, Casablanca — à 30 min. Voyez les matériaux et modèles en vrai avant de commander. <a href="https://wa.me/212707074748" style="color:#cc2366">Contactez-nous</a> pour rendez-vous.',
    },
}

BLOCK_TEMPLATE = '''
<section style="max-width:900px;margin:0 auto 32px;padding:0 24px;line-height:1.75;color:#333;">
  <h2 style="font-size:18px;font-weight:700;color:#222;margin-bottom:12px;">Livraison miroir salle de bain à {name}</h2>
  <p>{context}</p>
  <p style="margin-top:12px;">{tip}</p>
  <div style="background:#f5f0ff;border:1px solid #e0d4f5;border-radius:10px;padding:14px 18px;margin-top:16px;font-size:13px;color:#555;">
    <strong style="color:#6b2929;">🚚 Délai de livraison à {name} :</strong> {delay} après fabrication (fabrication : 5 à 7 jours). Paiement 50% à la commande, solde à la livraison.
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;">
    <a href="/miroir-salle-de-bain/" style="background:#f5f0ff;border:1px solid #e0d4f5;color:#6b2929;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;">🪞 Tous les miroirs</a>
    <a href="/miroir-salle-de-bain-led/" style="background:#f5f0ff;border:1px solid #e0d4f5;color:#6b2929;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;">💡 Miroirs LED</a>
    <a href="/miroir-sur-mesure/" style="background:#f5f0ff;border:1px solid #e0d4f5;color:#6b2929;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;">📐 Sur mesure</a>
    <a href="/blog/installation-miroir-mural-guide/" style="background:#f5f0ff;border:1px solid #e0d4f5;color:#6b2929;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:600;text-decoration:none;">🔧 Guide installation</a>
  </div>
</section>
'''

updated = 0
for slug, d in city_data.items():
    fpath = f'miroir-salle-de-bain-{slug}/index.html'
    if not os.path.exists(fpath):
        print(f'MISSING: {fpath}')
        continue
    with open(fpath, 'r', encoding='utf-8-sig', errors='replace') as f:
        content = f.read()
    if 'Livraison miroir salle de bain' in content:
        print(f'SKIP: {fpath}')
        continue
    block = BLOCK_TEMPLATE.format(**d)
    content = content.replace(
        '<section class="city-section">',
        block + '\n<section class="city-section">'
    )
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    updated += 1
    print(f'Updated: {fpath}')

print(f'\nDone: {updated} files updated')

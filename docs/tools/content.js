/**
 * Approved product copy for the four essences.
 * Source of truth — DO NOT READ product copy from i18n/*.js or data/products.js.
 * ruby-hibiscus copy is sourced from index.html (see ruby-hibiscus block below).
 *
 * Format: { slug: { lead, taste, composition, essence_title, essence_body, pillars[], ritual_title, steps[], badges[], ingredients } }
 * Each has { en, fr }
 *
 * Pillars: 3 values, no label.
 * Badges: temp, time, serve — 3 values.
 * Steps: 4 ordered strings.
 *
 * VERIFIED: No forbidden words (organic, caffeine, soothes, quiets, calms,
 *   relieves, Matricaria, Lippia, Foeniculum, apaise) found in the blocks below.
 */

window.SK_APPROVED_COPY = {
    'noble-chamomile': {
        slug: 'noble-chamomile',
        name: { en: 'Noble Chamomile', fr: 'Camomille Noble' },
        tagline: { en: 'Gentleness · Silence', fr: 'Douceur · Silence' },
        lead: {
            en: 'Soft, golden and naturally sweet, chamomile invites the day to slow down. Whole blossoms infuse into a gentle, honeyed cup, made for quiet evenings and unhurried moments.',
            fr: 'Douce, dorée et naturellement sucrée, la camomille invite la journée à ralentir. Ses fleurs entières se déploient en une tasse tendre aux notes de miel, pour les soirées calmes et les instants sans hâte.'
        },
        taste: { en: 'Soft · Honeyed · Floral', fr: 'Douce · Miellée · Florale' },
        composition: { en: '100% natural chamomile flowers', fr: 'Fleurs de camomille 100% naturelles' },
        essence_title: { en: 'A quiet kind of calm.', fr: 'Une douceur tranquille.' },
        essence_body: {
            en: 'Chamomile has long been a companion to slow evenings. It accompanies the moments when you wish to pause, soften and simply be present.',
            fr: 'La camomille accompagne depuis toujours les soirées lentes. Elle est là quand on souhaite faire une pause, s’adoucir et simplement être présent.'
        },
        pillars: [
            { en: 'Softens the pace of your day', fr: 'Adoucit le rythme de votre journée' },
            { en: 'Accompanies your evening ritual', fr: 'Accompagne votre rituel du soir' },
            { en: 'Invites a sense of stillness', fr: 'Invite à la quiétude' }
        ],
        ritual_title: { en: 'A few minutes. One flower. A moment of stillness.', fr: 'Quelques minutes. Une fleur. Un instant de quiétude.' },
        steps: [
            { en: 'Heat the water to 95°C.', fr: 'Chauffez l’eau à 95°C.' },
            { en: 'Place a sachet in your cup.', fr: 'Placez un sachet dans votre tasse.' },
            { en: 'Steep for 5 minutes.', fr: 'Laissez infuser 5 minutes.' },
            { en: 'Savour in stillness.', fr: 'Savourez en silence.' }
        ],
        badges: { temp: { en: '95°C', fr: '95°C' }, time: { en: '5 min', fr: '5 min' }, serve: { en: 'Serve hot', fr: 'À servir chaud' } },
        ingredients: { en: '100% natural chamomile flowers.', fr: 'Fleurs de camomille 100% naturelles.' }
    },

    'royal-verbena': {
        slug: 'royal-verbena',
        name: { en: 'Royal Verbena', fr: 'Verveine Royale' },
        tagline: { en: 'Clarity · Lightness', fr: 'Clarté · Légèreté' },
        lead: {
            en: 'Bright, lemony and light, verbena brings a clear, fresh lift to the cup. A delicate infusion for mornings and pauses that call for clarity.',
            fr: 'Vive, citronnée et légère, la verveine apporte une fraîcheur limpide à la tasse. Une infusion délicate pour les matins et les pauses qui appellent la clarté.'
        },
        taste: { en: 'Lemony · Fresh · Light', fr: 'Citronnée · Fraîche · Légère' },
        composition: { en: '100% natural verbena leaves', fr: 'Feuilles de verveine 100% naturelles' },
        essence_title: { en: 'Clarity, gently.', fr: 'La clarté, tout en douceur.' },
        essence_body: {
            en: 'Verbena is a fragrant leaf, light and bright. It accompanies the moments when you wish to feel lighter, clearer and more present.',
            fr: 'La verveine est une feuille parfumée, légère et lumineuse. Elle accompagne les instants où l’on souhaite se sentir plus léger, plus clair, plus présent.'
        },
        pillars: [
            { en: 'Brightens your morning', fr: 'Illumine votre matin' },
            { en: 'Lightens the pace of the day', fr: 'Allège le rythme de la journée' },
            { en: 'Leaves a clean, fresh finish', fr: 'Laisse une finale nette et fraîche' }
        ],
        ritual_title: { en: 'A few minutes. One leaf. A moment of clarity.', fr: 'Quelques minutes. Une feuille. Un instant de clarté.' },
        steps: [
            { en: 'Heat the water to 95°C.', fr: 'Chauffez l’eau à 95°C.' },
            { en: 'Place a sachet in your cup.', fr: 'Placez un sachet dans votre tasse.' },
            { en: 'Steep for 5 minutes.', fr: 'Laissez infuser 5 minutes.' },
            { en: 'Savour slowly.', fr: 'Savourez lentement.' }
        ],
        badges: { temp: { en: '95°C', fr: '95°C' }, time: { en: '5 min', fr: '5 min' }, serve: { en: 'Serve hot', fr: 'À servir chaud' } },
        ingredients: { en: '100% natural verbena leaves.', fr: 'Feuilles de verveine 100% naturelles.' }
    },

    'atlas-oregano': {
        slug: 'atlas-oregano',
        name: { en: 'Atlas Oregano', fr: 'Origan d’Atlas' },
        tagline: { en: 'Grounding · Strength', fr: 'Ancrage · Force' },
        lead: {
            en: 'Bold, earthy and warm, oregano carries the character of the mountains. A grounding infusion with a savoury, herbal depth.',
            fr: 'Franc, terreux et chaleureux, l’origan porte le caractère des montagnes. Une infusion ancrée, à la profondeur herbacée et sapide.'
        },
        taste: { en: 'Herbal · Earthy · Warm', fr: 'Herbacée · Terreuse · Chaleureuse' },
        composition: { en: '100% natural oregano leaves', fr: 'Feuilles d’origan 100% naturelles' },
        essence_title: { en: 'Rooted in strength.', fr: 'Enraciné dans la force.' },
        essence_body: {
            en: 'Oregano grows where the land is rugged and the air is clear. It accompanies the moments when you wish to feel grounded, steady and present.',
            fr: 'L’origan pousse là où la terre est rude et l’air limpide. Il accompagne les instants où l’on souhaite se sentir ancré, stable et présent.'
        },
        pillars: [
            { en: 'Grounds your day', fr: 'Ancre votre journée' },
            { en: 'Warms the moment', fr: 'Réchauffe l’instant' },
            { en: 'Leaves a deep herbal finish', fr: 'Laisse une finale herbacée et profonde' }
        ],
        ritual_title: { en: 'A few minutes. One herb. A moment of strength.', fr: 'Quelques minutes. Une plante. Un instant de force.' },
        steps: [
            { en: 'Heat the water to 95°C.', fr: 'Chauffez l’eau à 95°C.' },
            { en: 'Place a sachet in your cup.', fr: 'Placez un sachet dans votre tasse.' },
            { en: 'Steep for 5 minutes.', fr: 'Laissez infuser 5 minutes.' },
            { en: 'Savour while warm.', fr: 'Savourez bien chaud.' }
        ],
        badges: { temp: { en: '95°C', fr: '95°C' }, time: { en: '5 min', fr: '5 min' }, serve: { en: 'Serve hot', fr: 'À servir chaud' } },
        ingredients: { en: '100% natural oregano leaves.', fr: 'Feuilles d’origan 100% naturelles.' }
    },

    'heritage-fennel': {
        slug: 'heritage-fennel',
        name: { en: 'Heritage Fennel', fr: 'Fenouil Héritage' },
        tagline: { en: 'Harmony · Serenity', fr: 'Harmonie · Sérénité' },
        lead: {
            en: 'Sweet, soft and gently aniseed, fennel brings harmony to the cup. A calm infusion with a rounded, comforting finish.',
            fr: 'Doux, tendre et délicatement anisé, le fenouil apporte l’harmonie à la tasse. Une infusion paisible à la finale ronde et réconfortante.'
        },
        taste: { en: 'Sweet · Aniseed · Soft', fr: 'Doux · Anisé · Tendre' },
        composition: { en: '100% natural fennel seeds', fr: 'Graines de fenouil 100% naturelles' },
        essence_title: { en: 'Harmony, in every sip.', fr: 'L’harmonie, à chaque gorgée.' },
        essence_body: {
            en: 'Fennel is a gentle, sweet seed with a long tradition at the table. It accompanies the moments when you wish to slow down and feel at ease.',
            fr: 'Le fenouil est une graine douce et sucrée, présente à table depuis toujours. Il accompagne les instants où l’on souhaite ralentir et se sentir à l’aise.'
        },
        pillars: [
            { en: 'Rounds off your meal', fr: 'Arrondit votre repas' },
            { en: 'Slows the pace of the evening', fr: 'Ralentit le rythme de la soirée' },
            { en: 'Leaves a soft, sweet finish', fr: 'Laisse une finale douce et sucrée' }
        ],
        ritual_title: { en: 'A few minutes. One seed. A moment of serenity.', fr: 'Quelques minutes. Une graine. Un instant de sérénité.' },
        steps: [
            { en: 'Heat the water to 95°C.', fr: 'Chauffez l’eau à 95°C.' },
            { en: 'Place a sachet in your cup.', fr: 'Placez un sachet dans votre tasse.' },
            { en: 'Steep for 6 minutes.', fr: 'Laissez infuser 6 minutes.' },
            { en: 'Savour at your own pace.', fr: 'Savourez à votre rythme.' }
        ],
        badges: { temp: { en: '95°C', fr: '95°C' }, time: { en: '6 min', fr: '6 min' }, serve: { en: 'Serve hot', fr: 'À servir chaud' } },
        ingredients: { en: '100% natural fennel seeds.', fr: 'Graines de fenouil 100% naturelles.' }
    },

    'ruby-hibiscus': {
        slug: 'ruby-hibiscus',
        name: { en: 'Ruby Hibiscus', fr: 'Hibiscus Rubis' },
        tagline: { en: 'Glow · Radiance', fr: 'Éclat · Rayonnement' },
        lead: {
            en: 'A ruby-red infusion that awakens the senses and invites you to pause.',
            fr: 'Une infusion rubis qui réveille les sens et invite à la pause.'
        },
        taste: { en: 'Tangy · Fruity', fr: 'Acidulée · Fruitée' },
        composition: { en: '100% natural hibiscus flowers', fr: 'Fleurs d’hibiscus 100% naturelles' },
        essence_title: { en: 'A natural glow that inspires.', fr: 'Un éclat naturel qui inspire.' },
        essence_body: {
            en: 'Hibiscus invites you to reconnect with the beauty of the living world. It accompanies the moments when you wish to feel more present, more luminous, more aligned.',
            fr: 'L’hibiscus invite à se reconnecter à la beauté du vivant. Il accompagne les instants où l’on souhaite se sentir plus présent, plus lumineux, plus aligné.'
        },
        pillars: [
            { en: 'Reveals inner radiance', fr: 'Révèle la radiance intérieure' },
            { en: 'Awakens the senses', fr: 'Réveille les sens' },
            { en: 'Brings a moment of joy', fr: 'Offre un moment de joie' }
        ],
        ritual_title: { en: 'A few minutes. One plant. A moment for yourself.', fr: 'Quelques minutes. Une plante. Un instant pour soi.' },
        steps: [
            { en: 'Heat the water to 90°C.', fr: 'Chauffer l’eau à 90°C.' },
            { en: 'Place a sachet in your cup.', fr: 'Placer un sachet dans votre tasse.' },
            { en: 'Steep for 8 minutes.', fr: 'Laisser infuser 8 minutes.' },
            { en: 'Savour your SUKOON moment.', fr: 'Savourez votre moment SUKOON.' }
        ],
        badges: { temp: { en: '90°C', fr: '90°C' }, time: { en: '8 min', fr: '8 min' }, serve: { en: 'Serve hot or iced', fr: 'Servir chaud ou glacé' } },
        ingredients: { en: '100% natural hibiscus flowers.', fr: 'Fleurs d’hibiscus 100% naturelles.' },
        sachets: { en: '20 individual sachets', fr: '20 sachets individuels' }
    }
};

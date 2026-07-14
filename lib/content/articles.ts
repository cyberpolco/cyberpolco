export type Article = {
  slug: string;
  date: string;
  image?: string | null;
  viewCount?: number;
  shareCount?: number;
  fr: { title: string; excerpt: string; body: string[] };
  en: { title: string; excerpt: string; body: string[] };
};

export const articles: Article[] = [
  {
    slug: "vpns-explained",
    date: "2026-01-15",
    image: "/images/articles/vpns-explained.jpg",
    en: {
      title: "VPNs: What They Actually Do (and How to Pick One)",
      excerpt:
        "A VPN isn't just a trick to unlock another country's Netflix library. Here's what it really protects — and the three things to check before choosing one.",
      body: [
        "What comes to mind when you hear \"VPN\"? Most people imagine it as a magic tool for sneaking into another country's streaming library. But what is a VPN actually for, and how do you pick the right one?",
        "A VPN (Virtual Private Network) is a secure tunnel for your internet connection. It hides your online activity from prying eyes — hackers, your internet provider, even governments — and can make it look like you're browsing from a different location.",
        "Since your data passes through a server controlled by the VPN provider, choosing wisely matters. Three things to check:",
        "Speed: a VPN can slow your connection down. The further the server, the longer the detour. A good VPN balances security and speed.",
        "No-log policy: the provider should promise not to track, store, or share your activity. Without this guarantee, using a VPN just means handing your privacy to someone else.",
        "Security features: strong encryption, a kill switch (cuts your connection if the VPN drops), DNS leak protection, and obfuscation (stealth mode) for countries with heavy censorship.",
        "Our team reviewed VPNs against these three criteria and recommends ExpressVPN, NordVPN, and CyberGhost as solid options.",
        "With a VPN in sight, your data's out of sight.",
      ],
    },
    fr: {
      title: "VPN : à quoi ça sert vraiment (et comment bien choisir)",
      excerpt:
        "Un VPN n'est pas juste une astuce pour débloquer le catalogue Netflix d'un autre pays. Voici ce qu'il protège réellement — et les trois critères à vérifier avant d'en choisir un.",
      body: [
        "Qu'évoque le mot « VPN » pour vous ? Beaucoup l'imaginent comme un outil magique pour accéder au catalogue Netflix d'un autre pays. Mais à quoi sert réellement un VPN, et comment bien le choisir ?",
        "Un VPN (réseau privé virtuel) est un tunnel sécurisé pour votre connexion internet. Il masque votre activité en ligne aux regards indiscrets — pirates, fournisseur d'accès, voire gouvernements — et peut faire croire que vous naviguez depuis un autre lieu.",
        "Puisque vos données transitent par un serveur contrôlé par le fournisseur du VPN, bien choisir compte. Trois critères à vérifier :",
        "La vitesse : un VPN peut ralentir votre connexion. Plus le serveur est loin, plus le détour est long. Un bon VPN équilibre sécurité et vitesse.",
        "La politique de non-conservation des logs : le fournisseur doit s'engager à ne pas suivre, stocker ou partager votre activité. Sans cette garantie, utiliser un VPN revient à confier votre vie privée à quelqu'un d'autre.",
        "Les fonctionnalités de sécurité : chiffrement robuste, kill switch (coupe la connexion si le VPN tombe), protection contre les fuites DNS, et mode furtif pour les pays à forte censure.",
        "Notre équipe a comparé plusieurs VPN selon ces trois critères et recommande ExpressVPN, NordVPN et CyberGhost comme options solides.",
        "Avec un VPN en vue, vos données sont hors de vue.",
      ],
    },
  },
  {
    slug: "understanding-ai-in-cybersecurity",
    date: "2026-01-08",
    image: "/images/articles/understanding-ai-in-cybersecurity.jpg",
    en: {
      title: "Understanding AI: Opportunity and Risk in Cybersecurity",
      excerpt:
        "Not every automated system is AI. Here's what actually qualifies — and the two biggest cybersecurity challenges it creates.",
      body: [
        "Not every automated system is AI. Factory robots performing repetitive tasks, or spell checkers using fixed rules, aren't AI systems.",
        "Simply put, AI enables machines to think and act in ways typically associated with human intelligence — solving problems, understanding language, recognizing patterns, learning from experience, making decisions.",
        "In cybersecurity, AI raises two major challenges. Privacy: AI can process vast amounts of personal data, raising questions about how it's collected, stored, and used. Security: AI systems themselves can be attacked, and malicious actors can exploit AI to generate deepfakes or automate attacks.",
        "AI-powered surveillance systems that analyze camera footage to track individuals involve extensive data collection. Misused, this technology raises serious privacy and human rights concerns.",
        "AI-generated deepfakes can create realistic but fraudulent video or audio — used for misinformation, blackmail, or impersonation in social engineering attacks.",
        "Everyone has a role to play in how these systems are built and used. At Cyber PolCo, we use AI across our work, and we always ask: will this use of AI endanger anyone?",
      ],
    },
    fr: {
      title: "Comprendre l'IA : opportunité et risque en cybersécurité",
      excerpt:
        "Tout système automatisé n'est pas une IA. Voici ce qui en fait réellement une — et les deux grands défis qu'elle pose en cybersécurité.",
      body: [
        "Tout système automatisé n'est pas une intelligence artificielle. Un robot d'usine effectuant des tâches répétitives, ou un correcteur orthographique basé sur des règles fixes, ne sont pas des systèmes d'IA.",
        "Simplement dit, l'IA permet à des machines de penser et d'agir d'une manière habituellement associée à l'intelligence humaine — résoudre des problèmes, comprendre le langage, reconnaître des schémas, apprendre de l'expérience, prendre des décisions.",
        "En cybersécurité, l'IA soulève deux défis majeurs. La vie privée : l'IA peut traiter d'immenses volumes de données personnelles, ce qui interroge sur leur collecte, leur stockage et leur usage. La sécurité : les systèmes d'IA peuvent eux-mêmes être attaqués, et des acteurs malveillants peuvent exploiter l'IA pour générer des deepfakes ou automatiser des attaques.",
        "Les systèmes de surveillance basés sur l'IA qui analysent des images de caméras pour suivre des individus impliquent une collecte massive de données. Mal utilisée, cette technologie soulève de sérieuses questions de vie privée et de droits humains.",
        "Les deepfakes générés par IA peuvent créer des vidéos ou audios réalistes mais frauduleux — utilisés pour la désinformation, le chantage, ou l'usurpation d'identité dans des attaques d'ingénierie sociale.",
        "Chacun a un rôle à jouer dans la manière dont ces systèmes sont conçus et utilisés. Chez Cyber PolCo, nous utilisons l'IA dans notre travail, en nous demandant toujours : cet usage de l'IA met-il quelqu'un en danger ?",
      ],
    },
  },
  {
    slug: "who-is-spying-on-me",
    date: "2026-01-02",
    image: "/images/articles/who-is-spying-on-me.jpg",
    en: {
      title: "Who's Spying on Me? Recognizing the Signs of Spyware",
      excerpt:
        "Before diving in, a real case: Pegasus spyware and its alleged link to the surveillance of journalist Jamal Khashoggi — and the warning signs everyone should know.",
      body: [
        "We've all asked ourselves this after watching a spy movie. But the real question is: how do I know if I'm being spied on?",
        "Pegasus is an advanced surveillance tool developed by the Israeli company NSO Group, designed to infiltrate smartphones without the user's knowledge. It can read encrypted messages, listen to calls, activate microphones, track GPS location, extract contacts and photos, and secretly turn on cameras.",
        "Pegasus was allegedly used to surveil people close to journalist Jamal Khashoggi before his assassination in 2018, reportedly helping track his movements.",
        "How to protect yourself: keep your phone's OS updated, avoid clicking unknown links (spyware often spreads via phishing), use encrypted messaging apps with disappearing messages, and restart your phone regularly.",
        "Signs someone might be spying on you: unusual battery drain, overheating for no reason, abnormal data usage, unfamiliar apps you don't remember installing, or your camera/microphone activating on its own.",
        "If you have serious concerns that someone might be spying on you, reach out to our team for assistance.",
      ],
    },
    fr: {
      title: "Qui m'espionne ? Reconnaître les signes d'un logiciel espion",
      excerpt:
        "Avant de plonger dans le sujet, un cas réel : le logiciel espion Pegasus et son lien présumé avec la surveillance du journaliste Jamal Khashoggi — et les signes à connaître.",
      body: [
        "Nous nous sommes tous posé la question après avoir regardé un film d'espionnage. Mais la vraie question est : comment savoir si je suis espionné ?",
        "Pegasus est un outil de surveillance avancé développé par l'entreprise israélienne NSO Group, conçu pour infiltrer les smartphones à l'insu de leur utilisateur. Il peut lire des messages chiffrés, écouter des appels, activer le microphone, suivre la position GPS, extraire contacts et photos, et activer discrètement la caméra.",
        "Pegasus aurait été utilisé pour surveiller des proches du journaliste Jamal Khashoggi avant son assassinat en 2018, aidant apparemment à suivre ses déplacements.",
        "Comment se protéger : maintenez le système de votre téléphone à jour, évitez de cliquer sur des liens inconnus (les logiciels espions se propagent souvent par hameçonnage), utilisez des messageries chiffrées à messages éphémères, et redémarrez régulièrement votre téléphone.",
        "Signes qu'on pourrait vous espionner : batterie qui se vide anormalement vite, surchauffe inexpliquée, consommation de données anormale, applications inconnues que vous ne vous souvenez pas avoir installées, ou caméra/microphone qui s'active seul.",
        "Si vous avez de sérieuses inquiétudes d'être espionné, contactez notre équipe pour obtenir de l'aide.",
      ],
    },
  },
  {
    slug: "digital-footprint",
    date: "2025-12-18",
    en: {
      title: "Your Digital Footprint: Smaller Than You Think, Bigger Than You Realize",
      excerpt:
        "Every search, like, and login leaves a trace. Here's how to understand — and start managing — your digital footprint.",
      body: [
        "Every time you browse, post, or log in somewhere, you leave a trace. Together, these traces form your digital footprint — a profile of you that exists whether you're paying attention to it or not.",
        "There are two kinds: active footprints (what you deliberately share — posts, photos, comments) and passive footprints (what's collected without an explicit action from you — browsing history, location data, device metadata).",
        "Why it matters: employers, banks, and even scammers can build a picture of you from what's publicly available. A digital footprint can't be erased entirely, but it can be managed.",
        "Practical steps: review privacy settings on every platform you use, search your own name periodically, limit what you share publicly, and think before posting anything you wouldn't want a future employer — or a bad actor — to see.",
      ],
    },
    fr: {
      title: "Votre empreinte numérique : plus petite qu'on le croit, plus grande qu'on ne le pense",
      excerpt:
        "Chaque recherche, chaque like, chaque connexion laisse une trace. Voici comment comprendre — et commencer à gérer — votre empreinte numérique.",
      body: [
        "Chaque fois que vous naviguez, publiez ou vous connectez quelque part, vous laissez une trace. Ensemble, ces traces forment votre empreinte numérique — un profil de vous qui existe, que vous y prêtiez attention ou non.",
        "Il en existe deux types : les empreintes actives (ce que vous partagez délibérément — publications, photos, commentaires) et les empreintes passives (ce qui est collecté sans action explicite de votre part — historique de navigation, données de localisation, métadonnées d'appareil).",
        "Pourquoi c'est important : employeurs, banques, et même des escrocs peuvent se faire une idée de vous à partir de ce qui est public. Une empreinte numérique ne peut pas être totalement effacée, mais elle peut être gérée.",
        "Conseils pratiques : vérifiez les paramètres de confidentialité de chaque plateforme utilisée, recherchez périodiquement votre propre nom, limitez ce que vous partagez publiquement, et réfléchissez avant de publier quelque chose que vous ne voudriez pas qu'un futur employeur — ou une personne malveillante — voie.",
      ],
    },
  },
  {
    slug: "international-data-privacy-day",
    date: "2025-01-28",
    en: {
      title: "International Data Privacy Day: A Reminder Worth Repeating",
      excerpt:
        "It began with Convention 108 in 1981. Here's why data privacy deserves attention from individuals, organizations, and governments alike.",
      body: [
        "International Data Privacy Day traces back to the signing of Convention 108 in 1981, the first legally binding international treaty on privacy and data protection.",
        "For individuals: know your rights over your personal data and be mindful of how you share it online.",
        "For organizations: review your data protection practices, train your team, and stay aligned with applicable privacy frameworks.",
        "For governments and policymakers: continue advancing legal frameworks that protect citizens and hold organizations accountable.",
        "In 2018, Convention 108 was modernized into Convention 108+ to address AI, big data, and emerging cybersecurity threats — strengthening individual rights and encouraging international cooperation.",
        "Its influence is global, shaping major frameworks including the EU's GDPR. On this day, we're reminded that protecting personal data is a shared responsibility.",
      ],
    },
    fr: {
      title: "Journée internationale de la protection des données : un rappel qui mérite d'être répété",
      excerpt:
        "Tout a commencé avec la Convention 108 en 1981. Voici pourquoi la protection des données mérite l'attention des individus, des organisations et des gouvernements.",
      body: [
        "La Journée internationale de la protection des données remonte à la signature de la Convention 108 en 1981, premier traité international juridiquement contraignant sur la vie privée et la protection des données.",
        "Pour les individus : connaissez vos droits sur vos données personnelles et soyez attentifs à la manière dont vous les partagez en ligne.",
        "Pour les organisations : revoyez vos pratiques de protection des données, formez vos équipes, et restez alignés avec les cadres de confidentialité applicables.",
        "Pour les gouvernements et décideurs : continuez à faire progresser des cadres juridiques qui protègent les citoyens et responsabilisent les organisations.",
        "En 2018, la Convention 108 a été modernisée en Convention 108+ pour répondre à l'IA, au big data et aux menaces émergentes de cybersécurité — renforçant les droits individuels et encourageant la coopération internationale.",
        "Son influence est mondiale et façonne des cadres majeurs, dont le RGPD européen. Cette journée nous rappelle que protéger les données personnelles est une responsabilité partagée.",
      ],
    },
  },
  {
    slug: "world-backup-day",
    date: "2025-03-31",
    en: {
      title: "World Backup Day: The Habit That Saves Your Data",
      excerpt:
        "Power cuts, crashes, theft, malware — your files are more fragile than you think. Here's why backups aren't optional.",
      body: [
        "Ever been deep into an important project when the power goes out or your computer crashes — and you realize you never saved your work?",
        "Backups matter for three reasons: protecting important files (photos, documents, messages can vanish instantly), staying safe from cyber threats (malware and ransomware can wipe your data), and recovering quickly from theft or hardware failure — a device can be replaced, unsaved data usually can't.",
        "Pro tip: in case of a broader outage, offline backups (USB drives, external hard disks) ensure you still have access to your critical data.",
        "Best practice: use a hybrid backup strategy, combining physical and cloud backups for maximum security and peace of mind.",
        "Stay ahead — don't delay, back up your data today.",
      ],
    },
    fr: {
      title: "Journée mondiale de la sauvegarde : l'habitude qui protège vos données",
      excerpt:
        "Coupures de courant, plantages, vol, malwares — vos fichiers sont plus fragiles qu'on ne le pense. Voici pourquoi la sauvegarde n'est pas optionnelle.",
      body: [
        "Vous êtes plongé dans un projet important quand, soudain, une coupure de courant ou un plantage survient — et vous réalisez que vous n'aviez jamais sauvegardé votre travail ?",
        "Les sauvegardes sont importantes pour trois raisons : protéger vos fichiers importants (photos, documents, messages peuvent disparaître instantanément), rester à l'abri des cybermenaces (malwares et rançongiciels peuvent effacer vos données), et récupérer rapidement après un vol ou une panne matérielle — un appareil se remplace, des données non sauvegardées, rarement.",
        "Astuce : en cas de panne généralisée, des sauvegardes hors ligne (clés USB, disques durs externes) garantissent l'accès à vos données critiques.",
        "Bonne pratique : adoptez une stratégie de sauvegarde hybride, combinant sauvegardes physiques et cloud pour une sécurité et une tranquillité d'esprit maximales.",
        "Ne tardez pas — sauvegardez vos données dès aujourd'hui.",
      ],
    },
  },
  {
    slug: "cyberbullying",
    date: "2025-05-17",
    en: {
      title: "Cyberbullying Affects Everyone — Here's How to Respond",
      excerpt:
        "It doesn't stop at childhood. Adults face it too, through harassment and revenge content. Practical steps for young people, parents, and adults.",
      body: [
        "Know the platforms your child uses, but avoid being overly invasive — the goal is trust, not surveillance.",
        "For young people who are being bullied online: talk to someone you trust — a parent, teacher, or another adult. Block and report the person rather than engaging, since reacting can make bullying worse. Save the evidence — screenshots or messages — so you can show an adult or report it to the platform.",
        "Cyberbullying affects everyone, not just children. Many adults face harassment or non-consensual sharing of intimate content through social media, email, and other platforms, with effects on mental health comparable to what younger victims experience.",
        "There's still hope — with the right tools and open communication, the internet can remain a safer, kinder space for everyone. Parents, there's still time to have that important conversation with your child — please don't put it off.",
      ],
    },
    fr: {
      title: "Le cyberharcèlement touche tout le monde — voici comment réagir",
      excerpt:
        "Cela ne s'arrête pas à l'enfance. Les adultes y sont aussi confrontés, à travers le harcèlement ou la diffusion de contenus intimes. Des pistes concrètes pour les jeunes, les parents et les adultes.",
      body: [
        "Connaissez les plateformes utilisées par votre enfant, sans être trop intrusif — l'objectif est la confiance, pas la surveillance.",
        "Pour les jeunes victimes de harcèlement en ligne : parlez-en à une personne de confiance — un parent, un enseignant, ou un autre adulte. Bloquez et signalez la personne plutôt que d'engager le dialogue, car réagir peut aggraver le harcèlement. Conservez les preuves — captures d'écran ou messages — pour les montrer à un adulte ou les signaler à la plateforme.",
        "Le cyberharcèlement touche tout le monde, pas seulement les enfants. De nombreux adultes font face à du harcèlement ou à la diffusion non consentie de contenus intimes via les réseaux sociaux, l'e-mail ou d'autres plateformes, avec des effets sur la santé mentale comparables à ceux vécus par les jeunes victimes.",
        "Il y a encore de l'espoir — avec les bons outils et une communication ouverte, internet peut rester un espace plus sûr et plus bienveillant pour tous. Parents, il est encore temps d'avoir cette conversation importante avec votre enfant — ne la repoussez pas.",
      ],
    },
  },
  {
    slug: "siri-and-voice-assistants",
    date: "2025-06-10",
    en: {
      title: "Siri and Voice Assistants: Convenient, But Worth a Second Look",
      excerpt:
        "Voice assistants are always listening for their wake word. Here's what that means for your privacy, and simple steps to reduce the risk.",
      body: [
        "Voice assistants like Siri use AI and natural language processing to understand and respond to voice commands, operating in both online and offline modes depending on the request.",
        "They need an internet connection for tasks like web searches, weather updates, streaming, or translation.",
        "Should you be concerned? Voice assistants collect voice data, and can occasionally misinterpret background conversation as a wake word, recording unintended audio. They can also be tricked into opening malicious links.",
        "Practical steps: disable the assistant on your lock screen, review and periodically delete your voice history in settings, and strengthen your device security with Face ID, Touch ID, or a strong passcode.",
        "Voice assistants are genuinely useful — just don't let convenience come at the cost of basic privacy hygiene.",
      ],
    },
    fr: {
      title: "Siri et les assistants vocaux : pratiques, mais à surveiller",
      excerpt:
        "Les assistants vocaux sont toujours à l'écoute de leur mot d'activation. Voici ce que cela implique pour votre vie privée, et des gestes simples pour réduire les risques.",
      body: [
        "Les assistants vocaux comme Siri utilisent l'IA et le traitement du langage naturel pour comprendre et répondre aux commandes vocales, en fonctionnant en ligne ou hors ligne selon la demande.",
        "Ils ont besoin d'une connexion internet pour des tâches comme les recherches web, la météo, le streaming ou la traduction.",
        "Faut-il s'inquiéter ? Les assistants vocaux collectent des données vocales, et peuvent parfois interpréter une conversation de fond comme un mot d'activation, enregistrant un son non désiré. Ils peuvent aussi être trompés pour ouvrir des liens malveillants.",
        "Gestes pratiques : désactivez l'assistant sur l'écran verrouillé, consultez et supprimez périodiquement votre historique vocal dans les paramètres, et renforcez la sécurité de votre appareil avec Face ID, Touch ID ou un code fort.",
        "Les assistants vocaux sont réellement utiles — à condition que le confort ne se fasse pas au prix des bases de la vie privée.",
      ],
    },
  },
  {
    slug: "data-privacy-and-messaging-apps",
    date: "2024-09-05",
    en: {
      title: "Data Privacy and Messaging Apps: What Are You Really Trading Away?",
      excerpt:
        "High-profile controversies around messaging apps keep putting one question back on the table: what exactly is being collected about you?",
      body: [
        "Messaging app controversies keep bringing one topic back to the table: data privacy. Users want end-to-end encryption, anonymity, and minimal content moderation — but the same features that protect privacy can also shield bad actors, which is why platforms face ongoing scrutiny over content moderation and compliance.",
        "Data privacy refers to protecting personal information individuals share online, ensuring it's collected, stored, and used in ways that respect their rights and comply with legal requirements.",
        "Apps commonly collect: personal identification (name, email, phone), device information (IP address, device ID, OS), location data, contacts and social media access, media files, health and fitness data, and payment information. Users typically can deny access to optional data — and should.",
        "The Cambridge Analytica scandal (2018) remains a landmark case: personal data from up to 87 million Facebook users was harvested without consent and allegedly used to influence political campaigns, triggering global scrutiny of platform data practices.",
        "The core question for any platform you use: is the data collected proportional, necessary, transparent, and gathered with your genuine consent and awareness?",
      ],
    },
    fr: {
      title: "Vie privée et applications de messagerie : que cédez-vous réellement ?",
      excerpt:
        "Les controverses autour des applications de messagerie ramènent toujours la même question sur la table : que collecte-t-on exactement sur vous ?",
      body: [
        "Les controverses autour des applications de messagerie ramènent toujours le même sujet : la protection des données. Les utilisateurs veulent le chiffrement de bout en bout, l'anonymat et une modération minimale — mais ces mêmes fonctionnalités qui protègent la vie privée peuvent aussi protéger des acteurs malveillants, ce qui explique le contrôle constant exercé sur ces plateformes.",
        "La protection des données désigne la protection des informations personnelles partagées en ligne, en veillant à ce qu'elles soient collectées, stockées et utilisées dans le respect des droits des personnes et des obligations légales.",
        "Les applications collectent généralement : identification personnelle (nom, e-mail, téléphone), informations sur l'appareil (adresse IP, identifiant, système d'exploitation), données de localisation, accès aux contacts et réseaux sociaux, fichiers multimédias, données de santé et de fitness, et informations de paiement. Les utilisateurs peuvent généralement refuser l'accès aux données optionnelles — et devraient le faire.",
        "Le scandale Cambridge Analytica (2018) reste un cas de référence : les données personnelles de jusqu'à 87 millions d'utilisateurs Facebook ont été collectées sans consentement et prétendument utilisées pour influencer des campagnes politiques, déclenchant un examen mondial des pratiques des plateformes.",
        "La question essentielle pour toute plateforme que vous utilisez : les données collectées sont-elles proportionnées, nécessaires, transparentes, et recueillies avec votre consentement réel et éclairé ?",
      ],
    },
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getLatestArticles(count: number) {
  return [...articles]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, count);
}

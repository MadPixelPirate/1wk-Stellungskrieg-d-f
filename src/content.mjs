export const checkedOn = '2026-09-13';

export const sources = [
  {
    id: 'dhm-marne',
    institution: 'Deutsches Historisches Museum',
    title: 'Die Schlacht an der Marne 1914',
    url: 'https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/marne',
    evidence: 'Franz\u00f6sische und britische Streitkr\u00e4fte stoppten den deutschen Vormarsch im September 1914; R\u00fcckzug hinter die Aisne.'
  },
  {
    id: 'dhm-trenches',
    institution: 'Deutsches Historisches Museum',
    title: 'Der Stellungskrieg',
    url: 'https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/stellungskrieg.html',
    evidence: 'Ab Herbst 1914 rund 700 Kilometer Front von der belgischen K\u00fcste bis zur Schweizer Grenze; zumeist dreigliedrige Grabensysteme, Verbindungsgr\u00e4ben, schwierige Lebensbedingungen.'
  },
  {
    id: 'britannica-front',
    institution: 'Encyclopaedia Britannica',
    title: 'Western Front',
    url: 'https://www.britannica.com/event/Western-Front-World-War-I',
    evidence: 'Rund 700 Kilometer von Nieuwpoort bis nahe Pfetterhouse; Marne im September 1914; Vorteile der Verteidigung; alliierte Gegenoffensiven 1918 mit US-Verst\u00e4rkung.'
  },
  {
    id: 'memorial-verdun',
    institution: 'M\u00e9morial de Verdun',
    title: 'La bataille de Verdun',
    url: 'https://memorial-verdun.fr/fr/ressources/la-bataille-de-verdun',
    evidence: '21. Februar bis 18. Dezember 1916; das Museum nennt gerundet 300 Tage (302 Kalendertage einschlie\u00dflich beider Endtage). Rund 700.000 Gefallene und Verwundete zusammen. Falkenhayns genaue Ziele bleiben Gegenstand einer historischen Debatte.'
  },
  {
    id: 'britannica-verdun',
    institution: 'Encyclopaedia Britannica',
    title: 'Battle of Verdun',
    url: 'https://www.britannica.com/event/Battle-of-Verdun',
    evidence: 'Best\u00e4tigt den Zeitraum 21. Februar bis 18. Dezember 1916 und die Abwehr der deutschen Offensive; nennt rund 300.000 Tote bei h\u00f6heren Gesamtverlusten.'
  },
  {
    id: 'dhm-verdun',
    institution: 'Deutsches Historisches Museum',
    title: 'Die Schlacht um Verdun 1916',
    url: 'https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/verdun',
    evidence: 'Beginn der deutschen Offensive am 21. Februar 1916; Materialschlacht und Zerst\u00f6rung. Die hier genannte Totenzahl weicht deutlich von M\u00e9morial und Britannica ab und wird nicht \u00fcbernommen.'
  },
  {
    id: 'nam-somme',
    institution: 'National Army Museum',
    title: 'Battle of the Somme',
    url: 'https://www.nam.ac.uk/explore/battle-somme',
    evidence: 'Britisch-franz\u00f6sische Offensive ab 1. Juli, Abbruch am 18. November 1916; 141 Kalendertage einschlie\u00dflich beider Endtage. Entlastung Verduns, aber kein entscheidender Durchbruch; erste britische Tanks am 15. September; R\u00fcckzug zur Hindenburgstellung im Fr\u00fchjahr 1917.'
  },
  {
    id: 'dhm-somme',
    institution: 'Deutsches Historisches Museum',
    title: 'Die Schlacht an der Somme 1916',
    url: 'https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/somme',
    evidence: 'Angriff britischer und franz\u00f6sischer Truppen am 1. Juli 1916; Artillerie zerst\u00f6rte die deutschen Stellungen nicht vollst\u00e4ndig; begrenzte Gel\u00e4ndegewinne trotz hoher Verluste.'
  },
  {
    id: 'nam-1918',
    institution: 'National Army Museum',
    title: '1918: Year of victory',
    url: 'https://www.nam.ac.uk/explore/1918-victory',
    evidence: 'Deutsche Fr\u00fchjahrsoffensive ab 21. M\u00e4rz 1918, alliierte Gegenoffensiven ab Sommer, Waffenstillstand am 11. November in Compi\u00e8gne unterzeichnet und um 11 Uhr wirksam.'
  },
  {
    id: 'nam-peace',
    institution: 'National Army Museum',
    title: 'Peace and commemoration',
    url: 'https://www.nam.ac.uk/explore/peace-and-commemoration',
    evidence: 'Unterscheidung zwischen Waffenstillstand im November 1918 und Friedensvertrag 1919; langwierige Demobilisierung und anhaltende k\u00f6rperliche und psychische Folgen.'
  },
  {
    id: 'britannica-versailles',
    institution: 'Encyclopaedia Britannica',
    title: 'Treaty of Versailles',
    url: 'https://www.britannica.com/event/Treaty-of-Versailles-1919',
    evidence: 'Der Versailler Vertrag wurde am 28. Juni 1919 unterzeichnet; sein Inkrafttreten folgte erst am 10. Januar 1920.'
  }
];

export const chapters = [
  {
    id: 'marne',
    year: '1914',
    date: 'September 1914',
    nav: 'Der Stillstand',
    title: 'Der schnelle Sieg bleibt aus.',
    scene: 'map',
    focus: 'marne',
    lead: 'Im Sommer marschieren Armeen. Im Herbst graben sie sich ein.',
    paragraphs: [
      'Die deutsche Milit\u00e4rf\u00fchrung will Frankreich rasch besiegen, bevor sie ihre Kr\u00e4fte gegen Russland richtet. Deutsche Truppen r\u00fccken durch Belgien nach Nordfrankreich vor. Doch im September stoppen franz\u00f6sische und britische Truppen den Vormarsch an der Marne.',
      'Die deutsche Armee zieht sich hinter die Aisne zur\u00fcck. Aus dem erhofften kurzen Feldzug wird ein Krieg, in dem beide Seiten Schutz im Boden suchen. Nicht an einem einzigen Tag, sondern im Verlauf des Herbstes verfestigt sich die Westfront.'
    ],
    metric: { value: '1914', unit: 'September', label: 'Der Vormarsch an der Marne scheitert.' },
    takeaway: 'Der Stellungskrieg entsteht aus einem gescheiterten Bewegungskrieg.',
    sourceIds: ['dhm-marne', 'dhm-trenches', 'britannica-front']
  },
  {
    id: 'system',
    year: '1914',
    date: 'Ab Herbst 1914',
    nav: 'Die Gr\u00e4ben',
    title: 'Eine Front wird zum System.',
    scene: 'trenches',
    focus: 'system',
    lead: 'Was als Erdloch beginnt, wird zu einem verzweigten Netz.',
    paragraphs: [
      'Von der belgischen K\u00fcste bis zur Schweizer Grenze erstreckt sich die Westfront \u00fcber rund 700 Kilometer. Das ist die L\u00e4nge der Front, nicht die Summe aller ausgehobenen Gr\u00e4ben. Gek\u00e4mpft wird vor allem in Belgien und Nordostfrankreich, nicht entlang der heutigen deutsch-franz\u00f6sischen Grenze.',
      'Hinter dem vorderen Graben liegen weitere Stellungen. Verbindungsgr\u00e4ben f\u00fchren nach hinten zu Versorgung und Unterst\u00e4nden. Zwischen den gegnerischen Linien liegt das Niemandsland. Die Systeme sind je nach Ort und Zeitpunkt unterschiedlich; drei Linien sind ein vereinfachtes Grundmodell.'
    ],
    metric: { value: '\u2248 700', unit: 'Kilometer', label: 'Westfront, von der Nordsee bis zur Schweiz.' },
    takeaway: 'Eine Frontlinie besteht aus vielen gestaffelten Stellungen.',
    sourceIds: ['dhm-trenches', 'britannica-front']
  },
  {
    id: 'daily-life',
    year: '1915',
    date: '1915 / Alltag an der Front',
    nav: 'Der Alltag',
    title: 'Das Warten hat kein Ende.',
    scene: 'trenches',
    focus: 'shelter',
    lead: 'Ein Graben bietet Schutz. Ein Zuhause ist er nicht.',
    paragraphs: [
      'Die Geschichte verengt sich nun auf wenige Meter Erde. In den Unterst\u00e4nden leben deutsche und franz\u00f6sische Soldaten mit Enge, N\u00e4sse, schlechten hygienischen Bedingungen und zu wenig Schlaf. Zur Angst vor dem n\u00e4chsten Angriff kommt die dauernde Ersch\u00f6pfung. Wie schlimm die Bedingungen sind, h\u00e4ngt vom Ort, vom Wetter und vom Zeitpunkt ab.',
      'Warum gehen die Armeen nicht einfach weiter? Stacheldraht bremst Angriffe, Maschinengewehre und Artillerie st\u00e4rken die Verteidigung. Selbst wenn ein vorderer Graben f\u00e4llt, k\u00f6nnen Gegenangriffe aus den hinteren Stellungen folgen. Schutz, Versorgung und Feuerkraft greifen ineinander. Stillstand bedeutet deshalb nicht, dass nichts geschieht.'
    ],
    metric: { value: 'Tag & Nacht', unit: 'Belastung', label: 'Schlafmangel, N\u00e4sse und st\u00e4ndige Unsicherheit.' },
    takeaway: 'Der Graben sch\u00fctzt vor Beschuss, nicht vor den Folgen des Krieges.',
    note: 'Dieses Kapitel beschreibt typische Belastungen, keinen einzelnen Tag und keinen erfundenen Zeitzeugen.',
    sourceIds: ['dhm-trenches', 'britannica-front']
  },
  {
    id: 'verdun',
    year: '1916',
    date: '21. Februar bis 18. Dezember 1916',
    nav: 'Verdun',
    title: 'Verdun. Ein Ort wird zum Symbol.',
    scene: 'map',
    focus: 'verdun',
    lead: 'Die Entscheidung soll kommen. Stattdessen vergehen rund 300 Tage.',
    paragraphs: [
      'Am 21. Februar 1916 beginnt die deutsche Offensive bei Verdun. Frankreich verteidigt die Stadt und ihre Umgebung. Forts und H\u00f6hen wechseln teilweise den Besitzer, doch der erhoffte entscheidende Erfolg bleibt der deutschen Armee versagt. Im Herbst erobern franz\u00f6sische Truppen wichtige Forts zur\u00fcck.',
      'Bis zum 18. Dezember dauert die Schlacht. F\u00fcr Deutschland und Frankreich steht Verdun seither f\u00fcr die menschlichen Kosten des industrialisierten Krieges. Das M\u00e9morial de Verdun nennt rund 700.000 Gefallene und Verwundete zusammen. Diese Gesamtverluste d\u00fcrfen nicht mit 700.000 Toten gleichgesetzt werden.'
    ],
    metric: { value: '\u2248 300', unit: 'Tage', label: 'Verdun, vom 21. Februar bis 18. Dezember 1916.' },
    takeaway: 'Materialschlacht: Immer mehr Menschen und Material bringen keine schnelle Entscheidung.',
    note: '300 Tage ist die gerundete Museumsangabe; mit beiden Endtagen sind es 302 Kalendertage. Opferzahlen sind Sch\u00e4tzungen. Falkenhayns genaue Absicht ist historisch umstritten.',
    sourceIds: ['memorial-verdun', 'britannica-verdun', 'dhm-verdun']
  },
  {
    id: 'somme',
    year: '1916',
    date: '1. Juli bis 18. November 1916',
    nav: 'Die Somme',
    title: 'Ein zweiter Schauplatz. Dasselbe Dilemma.',
    scene: 'map',
    focus: 'somme',
    lead: 'W\u00e4hrend bei Verdun gek\u00e4mpft wird, beginnt die Offensive an der Somme.',
    paragraphs: [
      'Am 1. Juli greifen britische und franz\u00f6sische Truppen an der Somme an. Die Offensive soll auch Frankreich bei Verdun entlasten. Trotz langer Artillerievorbereitung sind viele deutsche Stellungen noch verteidigungsf\u00e4hig. Die Angriffe bringen hohe Verluste und begrenzte Gel\u00e4ndegewinne.',
      'Am 15. September setzen die Briten erstmals Tanks im Kampf ein. Auch sie bringen 1916 keinen entscheidenden Durchbruch. Die Offensive endet am 18. November. Verdun wird entlastet, doch eine schnelle Entscheidung des Krieges bleibt aus. Die Westfront ist eben nicht nur ein deutsch-franz\u00f6sischer Krieg: Auch Gro\u00dfbritannien und Truppen seines Empire spielen eine zentrale Rolle.'
    ],
    metric: { value: '141', unit: 'Tage', label: 'Somme, 1. Juli bis 18. November, beide Endtage mitgez\u00e4hlt.' },
    takeaway: 'Verdun und Somme finden 1916 \u00fcber Monate gleichzeitig statt.',
    note: 'Datierung nach National Army Museum. Die 141 Tage sind aus den dort genannten Daten berechnet, keine Opferzahl.',
    sourceIds: ['nam-somme', 'dhm-somme', 'memorial-verdun']
  },
  {
    id: 'turning-point',
    year: '1917/18',
    date: '1917 bis Herbst 1918',
    nav: 'Der Wandel',
    title: 'Die Front kommt wieder in Bewegung.',
    scene: 'map',
    focus: 'amiens',
    lead: 'Der Stellungskrieg ist pr\u00e4gend. Unver\u00e4nderlich ist er nicht.',
    paragraphs: [
      'Schon im Fr\u00fchjahr 1917 verk\u00fcrzt die deutsche Armee ihre Front durch den R\u00fcckzug in die Hindenburgstellung. Am 21. M\u00e4rz 1918 beginnt dann eine neue deutsche Offensive. Erstmals seit Jahren verschiebt sich die Front wieder gro\u00dfr\u00e4umig. Doch die Anfangserfolge f\u00fchren nicht zum Sieg: Kr\u00e4fte und Nachschub reichen nicht aus.',
      'Ab Sommer 1918 dr\u00e4ngen die Alliierten die deutschen Truppen zur\u00fcck, inzwischen auch mit starker Unterst\u00fctzung aus den USA. Infanterie, Artillerie, Panzer und Flugzeuge wirken zunehmend zusammen. Die deutsche Armee wird milit\u00e4risch zur\u00fcckgedr\u00e4ngt. Die Behauptung, die Westfront sei vier Jahre lang v\u00f6llig unbeweglich gewesen, greift deshalb zu kurz.'
    ],
    metric: { value: '1918', unit: 'Wendepunkt', label: 'Fr\u00fchjahrsoffensiven, danach alliierte Gegenoffensiven.' },
    takeaway: 'Neue Taktiken, materielle Kr\u00e4fteverh\u00e4ltnisse und Ersch\u00f6pfung ver\u00e4ndern den Krieg.',
    sourceIds: ['nam-somme', 'nam-1918', 'britannica-front']
  },
  {
    id: 'armistice',
    year: '1918',
    date: '11. November 1918',
    nav: 'Die Waffenruhe',
    title: 'Die Waffen schweigen. Die Folgen bleiben.',
    scene: 'map',
    focus: 'compiegne',
    lead: 'Um 11 Uhr endet das K\u00e4mpfen an der Westfront.',
    paragraphs: [
      'Am fr\u00fchen Morgen des 11. November 1918 wird bei Compi\u00e8gne der Waffenstillstand zwischen Deutschland und den Alliierten unterzeichnet. Um 11 Uhr tritt er in Kraft. Die Geschichte der Front endet damit, die Geschichte ihrer Folgen nicht: zerst\u00f6rte Orte, verlorene Angeh\u00f6rige und k\u00f6rperliche wie psychische Verletzungen bleiben.',
      'Ein Waffenstillstand ist noch kein Friedensvertrag. Der Versailler Vertrag wird erst am 28. Juni 1919 unterzeichnet. Wenn wir auf die Linien einer Karte zur\u00fcckblicken, sehen wir deshalb nur einen Teil der Geschichte. Hinter jedem Abschnitt stehen Menschen auf beiden Seiten und eine Landschaft, die der Krieg ver\u00e4ndert hat.'
    ],
    metric: { value: '11:00', unit: 'Uhr', label: 'Der Waffenstillstand tritt am 11. November 1918 in Kraft.' },
    takeaway: 'Das Ende des K\u00e4mpfens und der Abschluss des Friedens sind zwei verschiedene Ereignisse.',
    sourceIds: ['nam-1918', 'nam-peace', 'britannica-versailles', 'memorial-verdun']
  }
];

export const modelNotes = {
  map: 'Frontband: schematisch Ende 1914. Keine Staatsgrenzen; kein tagesgenauer Frontverlauf. K\u00fcsten: Natural Earth.',
  trenches: 'Didaktisches Modell, nicht ma\u00dfstabsgetreu. Drei Linien je Seite; Anordnung und Abst\u00e4nde waren nicht \u00fcberall gleich.'
};

export const glossary = [
  { id: 'front', title: 'Vorderer Graben', text: 'Die vordere Verteidigungsstellung. Weitere Gr\u00e4ben liegen gestaffelt dahinter.', sourceIds: ['dhm-trenches'] },
  { id: 'no-mans-land', title: 'Niemandsland', text: 'Der Raum zwischen den gegnerischen Stellungen. Seine Breite war je nach Frontabschnitt unterschiedlich.', sourceIds: ['dhm-trenches'] },
  { id: 'communication', title: 'Verbindungsgraben', text: 'Er verbindet die vorderen Stellungen mit r\u00fcckw\u00e4rtigen Linien und dem Nachschub.', sourceIds: ['dhm-trenches'] },
  { id: 'shelter', title: 'Unterstand', text: 'Ein gesch\u00fctzter Aufenthaltsraum im Stellungssystem. Enge und schlechte hygienische Bedingungen belasteten die Soldaten.', sourceIds: ['dhm-trenches'] }
];

export const quiz = [
  {
    question: 'Wof\u00fcr stehen die rund 700 Kilometer?',
    options: ['F\u00fcr die ungef\u00e4hre L\u00e4nge der Westfront.', 'F\u00fcr die Summe aller Sch\u00fctzengr\u00e4ben.', 'F\u00fcr die Entfernung zwischen den gegnerischen Gr\u00e4ben.'],
    correct: 0,
    explanation: 'Die Front reichte von der belgischen K\u00fcste bis zur Schweizer Grenze. Hinter dieser Linie lagen viele weitere Gr\u00e4ben.',
    chapter: 'system'
  },
  {
    question: 'Was verbindet Verdun und Somme im Jahr 1916?',
    options: ['Sie waren zwei Namen f\u00fcr dieselbe Schlacht.', 'Sie fanden monatelang gleichzeitig statt.', 'Mit der Somme endete der Krieg.'],
    correct: 1,
    explanation: 'Verdun dauerte von Februar bis Dezember, die Somme-Offensive von Juli bis November. Die Somme sollte auch die franz\u00f6sische Armee bei Verdun entlasten.',
    chapter: 'somme'
  },
  {
    question: 'Was geschah am 11. November 1918 um 11 Uhr?',
    options: ['Der Versailler Vertrag wurde unterschrieben.', 'Die Schlacht um Verdun begann.', 'Der Waffenstillstand trat in Kraft.'],
    correct: 2,
    explanation: 'An der Westfront endeten die Kampfhandlungen. Der Versailler Friedensvertrag wurde erst am 28. Juni 1919 unterzeichnet.',
    chapter: 'armistice'
  }
];
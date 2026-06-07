const kenyaSourceRegistry = [
  {
    group: 'kenya-executive',
    name: 'Office of the President of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.president.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.98,
    crawlIntervalMins: 120,
    termsNotes: 'Official executive source. Monitor official statements, cabinet, and ministry notices.'
  },
  {
    group: 'kenya-executive',
    name: 'Government of Kenya MyGov',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.mygov.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.95,
    crawlIntervalMins: 120,
    termsNotes: 'Official Government Advertising Agency and public notices source.'
  },
  {
    group: 'kenya-executive',
    name: 'State Department for Parliamentary Affairs',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.parliamentaryaffairs.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.94,
    crawlIntervalMins: 240,
    termsNotes: 'Official executive-parliament coordination source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Interior and National Administration',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.interior.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.94,
    crawlIntervalMins: 180,
    termsNotes: 'Official interior, security, and national administration source.'
  },
  {
    group: 'kenya-executive',
    name: 'National Treasury and Economic Planning',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.treasury.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.96,
    crawlIntervalMins: 240,
    termsNotes: 'Official fiscal policy, budget, and economic planning source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Foreign and Diaspora Affairs',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://mfa.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.94,
    crawlIntervalMins: 240,
    termsNotes: 'Official foreign affairs and diaspora source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Defence Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://mod.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.93,
    crawlIntervalMins: 360,
    termsNotes: 'Official defence source. Use cautiously and verify sensitive claims.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Health Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.health.go.ke/',
    category: 'HEALTH',
    credibilityScore: 0.96,
    crawlIntervalMins: 180,
    termsNotes: 'Official health policy, advisories, and disease updates.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Education Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.education.go.ke/',
    category: 'EDUCATION',
    credibilityScore: 0.95,
    crawlIntervalMins: 240,
    termsNotes: 'Official education policy and school calendar source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Roads and Transport Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.transport.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.93,
    crawlIntervalMins: 240,
    termsNotes: 'Official transport policy and infrastructure source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of ICT and Digital Economy Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.ict.go.ke/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.93,
    crawlIntervalMins: 240,
    termsNotes: 'Official ICT, digital economy, and communications source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Agriculture and Livestock Development Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://kilimo.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.93,
    crawlIntervalMins: 240,
    termsNotes: 'Official agriculture, livestock, food security, and farm policy source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Energy and Petroleum Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://energy.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.93,
    crawlIntervalMins: 240,
    termsNotes: 'Official energy and petroleum policy source.'
  },
  {
    group: 'kenya-executive',
    name: 'Ministry of Environment Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.environment.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.92,
    crawlIntervalMins: 360,
    termsNotes: 'Official environment and climate policy source.'
  },
  {
    group: 'kenya-legislature',
    name: 'Parliament of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.parliament.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.98,
    crawlIntervalMins: 120,
    termsNotes: 'Official legislature source for National Assembly and Senate activity.'
  },
  {
    group: 'kenya-legislature',
    name: 'National Assembly of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.parliament.go.ke/the-national-assembly',
    category: 'POLITICS',
    credibilityScore: 0.97,
    crawlIntervalMins: 180,
    termsNotes: 'Official National Assembly source.'
  },
  {
    group: 'kenya-legislature',
    name: 'Senate of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.parliament.go.ke/the-senate',
    category: 'POLITICS',
    credibilityScore: 0.97,
    crawlIntervalMins: 180,
    termsNotes: 'Official Senate source.'
  },
  {
    group: 'kenya-judiciary',
    name: 'Judiciary of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://judiciary.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.98,
    crawlIntervalMins: 180,
    termsNotes: 'Official judiciary source for court statements, notices, and administration.'
  },
  {
    group: 'kenya-judiciary',
    name: 'Kenya Law',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://kenyalaw.org/',
    category: 'POLITICS',
    credibilityScore: 0.98,
    crawlIntervalMins: 360,
    termsNotes: 'Official legal information source for judgments, legislation, and gazette material.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Revenue Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kra.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.97,
    crawlIntervalMins: 180,
    termsNotes: 'Official tax and customs source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Central Bank of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.centralbank.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.98,
    crawlIntervalMins: 120,
    termsNotes: 'Official monetary policy, banking, rates, and payments regulator source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya National Bureau of Statistics',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.knbs.or.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.97,
    crawlIntervalMins: 360,
    termsNotes: 'Official statistics source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Independent Electoral and Boundaries Commission',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.iebc.or.ke/',
    category: 'POLITICS',
    credibilityScore: 0.96,
    crawlIntervalMins: 240,
    termsNotes: 'Official elections source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Communications Authority of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.ca.go.ke/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.96,
    crawlIntervalMins: 240,
    termsNotes: 'Official communications, broadcasting, telecoms, and spectrum regulator source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Competition Authority of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.cak.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.95,
    crawlIntervalMins: 360,
    termsNotes: 'Official competition and consumer protection source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Public Procurement Regulatory Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.ppra.go.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.95,
    crawlIntervalMins: 360,
    termsNotes: 'Official procurement regulator source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'National Environment Management Authority Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.nema.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.95,
    crawlIntervalMins: 360,
    termsNotes: 'Official environment regulator source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Power',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kplc.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.94,
    crawlIntervalMins: 180,
    termsNotes: 'Official electricity distribution source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'KenGen',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kengen.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.93,
    crawlIntervalMins: 360,
    termsNotes: 'Official power generation source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Electricity Transmission Company',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.ketraco.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.93,
    crawlIntervalMins: 360,
    termsNotes: 'Official electricity transmission source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Ports Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kpa.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.94,
    crawlIntervalMins: 360,
    termsNotes: 'Official ports and shipping logistics source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya National Highways Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://kenha.co.ke/',
    category: 'LOCAL',
    credibilityScore: 0.94,
    crawlIntervalMins: 360,
    termsNotes: 'Official national highways source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Rural Roads Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kerra.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.93,
    crawlIntervalMins: 360,
    termsNotes: 'Official rural roads source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Kenya Urban Roads Authority',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://kura.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.93,
    crawlIntervalMins: 360,
    termsNotes: 'Official urban roads source.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Directorate of Criminal Investigations Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.dci.go.ke/',
    category: 'LOCAL',
    credibilityScore: 0.92,
    crawlIntervalMins: 240,
    termsNotes: 'Official investigations source. Verify sensitive claims before publication.'
  },
  {
    group: 'kenya-parastatals',
    name: 'Ethics and Anti-Corruption Commission',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://eacc.go.ke/',
    category: 'POLITICS',
    credibilityScore: 0.95,
    crawlIntervalMins: 240,
    termsNotes: 'Official anti-corruption source.'
  },
  {
    group: 'kenya-media',
    name: 'The Standard Kenya RSS',
    type: 'RSS',
    homepageUrl: 'https://www.standardmedia.co.ke/',
    feedUrl: 'https://www.standardmedia.co.ke/rss/kenya.php',
    category: 'LOCAL',
    credibilityScore: 0.78,
    crawlIntervalMins: 30,
    termsNotes: 'Kenyan media RSS source. Cross-check with official and competing sources before publication.'
  },
  {
    group: 'kenya-media',
    name: 'Capital FM Kenya News RSS',
    type: 'RSS',
    homepageUrl: 'https://www.capitalfm.co.ke/news/',
    feedUrl: 'https://www.capitalfm.co.ke/news/feed/',
    category: 'LOCAL',
    credibilityScore: 0.77,
    crawlIntervalMins: 30,
    termsNotes: 'Kenyan media RSS source. Cross-check major claims.'
  },
  {
    group: 'kenya-media',
    name: 'Nation Africa',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://nation.africa/kenya',
    category: 'LOCAL',
    credibilityScore: 0.8,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan media source. Monitor public pages; verify claims independently.'
  },
  {
    group: 'kenya-media',
    name: 'Citizen Digital',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.citizen.digital/',
    category: 'LOCAL',
    credibilityScore: 0.79,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan media source. Monitor public pages; verify claims independently.'
  },
  {
    group: 'kenya-media',
    name: 'KBC Digital',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.kbc.co.ke/',
    category: 'LOCAL',
    credibilityScore: 0.76,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan public broadcaster source.'
  },
  {
    group: 'kenya-media',
    name: 'Business Daily Africa',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.businessdailyafrica.com/',
    category: 'BUSINESS',
    credibilityScore: 0.81,
    crawlIntervalMins: 60,
    termsNotes: 'Kenyan business media source.'
  },
  {
    group: 'kenya-media',
    name: 'The Star Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.the-star.co.ke/',
    category: 'LOCAL',
    credibilityScore: 0.76,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan media source. Cross-check major claims.'
  },
  {
    group: 'kenya-media',
    name: 'People Daily Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://peopledaily.digital/',
    category: 'LOCAL',
    credibilityScore: 0.74,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan media source. Cross-check major claims.'
  },
  {
    group: 'kenya-media',
    name: 'K24 TV Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.k24tv.co.ke/',
    category: 'LOCAL',
    credibilityScore: 0.73,
    crawlIntervalMins: 45,
    termsNotes: 'Kenyan media source. Cross-check major claims.'
  },
  {
    group: 'international-media',
    name: 'BBC News Africa RSS',
    type: 'RSS',
    homepageUrl: 'https://www.bbc.com/news/world/africa',
    feedUrl: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
    category: 'WORLD',
    credibilityScore: 0.86,
    crawlIntervalMins: 30,
    termsNotes: 'International comparator source for Africa and global stories.'
  },
  {
    group: 'international-media',
    name: 'Reuters Africa',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.reuters.com/world/africa/',
    category: 'WORLD',
    credibilityScore: 0.88,
    crawlIntervalMins: 45,
    termsNotes: 'International wire comparator source. Cross-check with BBC and local sources.'
  },
  {
    group: 'international-media',
    name: 'CNN Africa',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://edition.cnn.com/world/africa',
    category: 'WORLD',
    credibilityScore: 0.82,
    crawlIntervalMins: 45,
    termsNotes: 'International comparator source. Cross-check with BBC, Reuters, and local sources.'
  },
  {
    group: 'kenya-banks',
    name: 'Equity Bank Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://equitygroupholdings.com/ke/',
    category: 'BUSINESS',
    credibilityScore: 0.82,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source. Monitor official statements, products, and financial releases.'
  },
  {
    group: 'kenya-banks',
    name: 'KCB Group',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://kcbgroup.com/',
    category: 'BUSINESS',
    credibilityScore: 0.82,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source. Monitor official statements and investor updates.'
  },
  {
    group: 'kenya-banks',
    name: 'Co-operative Bank of Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.co-opbank.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.81,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'Absa Bank Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.absabank.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.81,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'NCBA Group',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://ncbagroup.com/',
    category: 'BUSINESS',
    credibilityScore: 0.81,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'Stanbic Bank Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.stanbicbank.co.ke/',
    category: 'BUSINESS',
    credibilityScore: 0.8,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'Standard Chartered Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.sc.com/ke/',
    category: 'BUSINESS',
    credibilityScore: 0.8,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'I&M Bank Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.imbankgroup.com/ke/',
    category: 'BUSINESS',
    credibilityScore: 0.79,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-banks',
    name: 'Diamond Trust Bank Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://dtbk.dtbafrica.com/',
    category: 'BUSINESS',
    credibilityScore: 0.79,
    crawlIntervalMins: 360,
    termsNotes: 'Banking sector source.'
  },
  {
    group: 'kenya-telcos',
    name: 'Safaricom',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.safaricom.co.ke/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.84,
    crawlIntervalMins: 180,
    termsNotes: 'Telecommunications and mobile money source.'
  },
  {
    group: 'kenya-telcos',
    name: 'Airtel Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://www.airtelkenya.com/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.82,
    crawlIntervalMins: 180,
    termsNotes: 'Telecommunications and mobile money source.'
  },
  {
    group: 'kenya-telcos',
    name: 'Telkom Kenya',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://telkom.co.ke/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.8,
    crawlIntervalMins: 240,
    termsNotes: 'Telecommunications source.'
  },
  {
    group: 'kenya-telcos',
    name: 'Jamii Telecommunications Faiba',
    type: 'STATIC_PAGE',
    homepageUrl: 'https://faiba.co.ke/',
    category: 'TECHNOLOGY',
    credibilityScore: 0.78,
    crawlIntervalMins: 240,
    termsNotes: 'Telecommunications and internet service source.'
  }
];

export { kenyaSourceRegistry };

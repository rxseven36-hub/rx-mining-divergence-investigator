export type TimelineEventType =
  | "news"
  | "filing"
  | "corporate"
  | "suspension";

export type TimelineScope =
  | "company"
  | "market-context";

export type TimelineEvent = {
  id: string;
  date: string;
  sortDate: string;
  type: TimelineEventType;
  scope: TimelineScope;
  title: string;
  summary: string;
  source: string;
  secondaryDate?: string;
};

export type CompanyTimelineSnapshot = {
  symbol: string;

  period: {
    start: string;
    end: string;
  };

  newsCount: number;

  suspension: {
    recorded: boolean;
    text: string;
  };

  events: TimelineEvent[];
};

export const timelineSnapshots: Record<
  string,
  CompanyTimelineSnapshot
> = {
  BUMI: {
    symbol: "BUMI",

    period: {
      start: "1 Jan 2026",
      end: "10 Sep 2026",
    },

    newsCount: 334,

    suspension: {
      recorded: false,
      text: "No suspension recorded in the selected period.",
    },

    events: [
      {
        id: "bumi-news-2026-09-10-loyal-metals",
        date: "10 Sep 2026",
        sortDate: "2026-09-10T21:11:00",
        type: "news",
        scope: "company",
        title: "BUMI explains the rationale behind Loyal Metals acquisition",
        summary:
          "BUMI discussed the acquisition of Loyal Metals Ltd despite its cumulative loss position, pointing to copper-gold and lithium assets and future revenue potential as part of the strategic rationale.",
        source: "Sectors News · IDX extension",
      },

      {
        id: "bumi-news-2026-09-09-market-context",
        date: "9 Sep 2026",
        sortDate: "2026-09-09T12:00:00",
        type: "news",
        scope: "market-context",
        title: "Foreign selling and price strength appeared together",
        summary:
          "A market article reported BUMI among the largest foreign net-sell names while the stock still gained during that session. RX MDI treats this as market context, not evidence that one event caused the other.",
        source: "Sectors News · IDX extension",
      },

      {
        id: "bumi-filing-2026-06-19-insider-sale",
        date: "19 Jun 2026",
        sortDate: "2026-06-19T00:00:00",
        type: "filing",
        scope: "company",
        title: "Insider transaction reported",
        summary:
          "Adrian Maulana Krisbiantoro reported the sale of 200 BUMI shares at IDR165 per share.",
        source: "IDX filing",
        secondaryDate: "Transaction disclosure",
      },

      {
        id: "bumi-agm-2026-06-18",
        date: "18 Jun 2026",
        sortDate: "2026-06-18T00:00:00",
        type: "corporate",
        scope: "company",
        title: "2026 Annual General Meeting",
        summary:
          "Shareholders approved the 2025 annual report and audited financial statements. No dividend was declared for FY2025. The meeting also covered auditor appointment, board matters, remuneration authority and reporting related to BUMI's sustainable bonds.",
        source: "Corporate Actions · AGM",
      },

      {
        id: "bumi-filing-2026-05-19-insider-buy",
        date: "19 May 2026",
        sortDate: "2026-05-19T00:00:00",
        type: "filing",
        scope: "company",
        title: "Insider purchase reported",
        summary:
          "Adrian Maulana Krisbiantoro reported the purchase of 1,200 BUMI shares. RX MDI preserves the values as reported in the source record rather than silently normalizing them.",
        source: "IDX filing",
        secondaryDate: "Transaction disclosure",
      },

      {
        id: "bumi-filing-2026-05-07-ubs",
        date: "7 May 2026",
        sortDate: "2026-05-07T00:00:00",
        type: "filing",
        scope: "company",
        title: "Large shareholder position change disclosed",
        summary:
          "A filing recorded a UBS client position change of approximately 3.544 billion shares, with reported holdings moving from about 20.58 billion to 17.04 billion shares.",
        source: "IDX filing",
      },
    ],
  },

  ADMR: {
    symbol: "ADMR",

    period: {
      start: "22 Jul 2026",
      end: "6 Sept 2026",
    },

    newsCount: 30,

    suspension: {
      recorded: false,
      text: "Suspension status was not collected for this company in this News snapshot.",
    },

    events: [
      {
        id: "admr-news-20260906180000-1",
        date: "6 Sept 2026",
        sortDate: "2026-09-06T18:00:00",
        type: "news",
        scope: "market-context",
        title: "El Nino Reduces Mahakam and Barito River Levels, Disrupting Coal Barge Operations for Harum Energy, Bayan Resources, Adaro Energy, and Alamtri Minerals",
        summary: "El Nino-induced water level declines in the Mahakam and Barito rivers in Kalimantan are disrupting barge operations for coal transport, potentially affecting exports. Harum Energy (HRUM) loads nearly all its coal onto customer vessels at the Separi facility on the Mahakam using 8,000-ton barges. Bayan Resources (BYAN) produces about 3 million tons annually at its TSA and FKP mines and operates a Mahakam loading facility with 1,000-ton-per-hour crushing, 400,000-ton stockpile, and 2,000-ton-per-hour barge loading capacity for 7,500-ton barges. Adaro Energy (AADI) moves coal through the Kelanis terminal on the Barito, while its logistics subsidiary PT Adaro Logistics owns PT Maritim Barito Perkasa (MBP), which as of June 2024 operated a fleet of 70 barges, 72 tugboats, and three SPB vessels with over 771,000 tons capacity and seven transshipment facilities capable of 222,000 tons per day, transporting 34.6 million tons for the group and Alamtri Minerals (ADMR).",
        source: "Bloomberg Technoz",
      },
      {
        id: "admr-news-20260904153206-2",
        date: "4 Sept 2026",
        sortDate: "2026-09-04T15:32:06",
        type: "news",
        scope: "market-context",
        title: "PT Alamtri Minerals Indonesia Tbk's aluminum business via subsidiary PT Kalimantan Aluminium Industry poised to surpass metallurgical coal as primary growth driver with potential 44% stock upside",
        summary: "PT Alamtri Minerals Indonesia Tbk's aluminum segment is projected to become the main growth catalyst replacing metallurgical coal, according to Phintraco Sekuritas research. Domestic aluminum consumption is forecast to grow 14% in 2026 and at a 16% compound annual growth rate from 2027 to 2030, driven by industrialization, infrastructure development, and policy support. The company operates through its subsidiary PT Kalimantan Aluminium Industry, which began smelter commissioning in late 2025 and targets full phase-one capacity of 500,000 tons by end-2026. PT Alamtri Minerals Indonesia Tbk is expected to record aluminum revenue starting in the second half of 2026, providing a positive catalyst for revenue growth.",
        source: "Investor.id",
      },
      {
        id: "admr-news-20260904092700-3",
        date: "4 Sept 2026",
        sortDate: "2026-09-04T09:27:00",
        type: "news",
        scope: "market-context",
        title: "IHSG and Asian Exchanges Cheerful This Morning",
        summary: "The Jakarta Stock Exchange (IHSG) opened higher on Friday, September 4, 2026, gaining 27.8 points (0.42%) to 6,695 as Asian markets such as KOSDAQ, Hang Seng, KOSPI, Shenzhen Composite, CSI 300, Straits Times, Shanghai Composite, NIKKEI 225 and TW Weighted Index also rose in green zones. The rally was supported by a net foreign purchase of Rp1.07 trillion, a strong rupiah at Rp17,660 per USD, and bullish technical levels with the index breaking resistance at 6,650 and targeting 6,724 while holding support near 6,550. Brokers highlighted several stocks as top picks: BRI Danareksa recommended BBCA, LSIP and ARCI; Phintraco listed JPFA, PANI, CPIN, ANTM and ARCI; CGS International suggested ADMR, AADI, ADRO, SMGR, BMRI and MDKA; and Panin Sekuritas favored BDMN, AALI and SMDR. Analysts noted that continued foreign buying, commodity price gains and a dovish Fed outlook could sustain the market, though short-term profit-taking ahead of the weekend remains a risk.",
        source: "Bloomberg Technoz",
      },
      {
        id: "admr-news-20260903183500-4",
        date: "3 Sept 2026",
        sortDate: "2026-09-03T18:35:00",
        type: "news",
        scope: "market-context",
        title: "Ten Indonesian coal issuers report H1 2026 net profit growth led by Adaro Andalan Indonesia Tbk and Bayan Resources Tbk",
        summary: "Ten Indonesian coal mining issuers posted year-on-year net profit increases in the first half of 2026, with PT Adaro Andalan Indonesia Tbk recording the highest profit attributable to parent entity owners at US$473.77 million (approximately Rp8.48 trillion), up 10.52%, followed by PT Bayan Resources Tbk at approximately Rp7.34 trillion, up 17.47%. PT Alamtri Resources Indonesia Tbk ranked third with US$309.36 million (Rp5.54 trillion), a 76.83% surge, while PT Alamtri Minerals Indonesia Tbk, PT Bukit Asam Tbk, PT Indo Tambangraya Megah Tbk, PT Bumi Resources Tbk, PT Darma Henwa Tbk, PT Petrindo Jaya Kreasi Tbk, and PT Indika Energy Tbk completed the list with profits ranging from Rp3.12 trillion down to Rp182 billion. PT Petrindo Jaya Kreasi Tbk posted the highest profit growth at approximately 918% to US$19.78 million (Rp354 billion), and PT Indika Energy Tbk followed with a 354.30% increase to US$10.20 million (Rp182 billion). Revenue growth accompanied profit gains across the group, with Adaro's revenue rising 6.13% to US$2.55 billion and Bayan's reaching approximately Rp31.15 trillion.",
        source: "Bisnis",
      },
      {
        id: "admr-news-20260901212000-5",
        date: "1 Sept 2026",
        sortDate: "2026-09-01T21:20:00",
        type: "news",
        scope: "market-context",
        title: "Global Coal Price Surge Drives Strong First-Half 2026 Earnings for Indonesian Coal Miners",
        summary: "Rising global coal prices since March 2026 have significantly improved the financial performance of Indonesian coal mining companies in the first half of 2026. PT Bukit Asam Tbk reported revenue growth of 7.73% to Rp 22.03 trillion and a 218.10% surge in net profit to Rp 2.65 trillion, while PT Bumi Resources Tbk saw net profit jump 188.34% to US$58.85 million on 27.85% revenue growth to US$866.75 million. PT Adaro Andalan Indonesia Tbk posted 6.25% revenue growth to US$2.55 billion and a 10.52% rise in net profit to US$473.77 million. Analysts attribute the gains to coal prices above US$120 per ton, operational improvements, and structural demand from AI and seasonal factors, highlighting PT Bukit Asam Tbk, PT Adaro Andalan Indonesia Tbk, ADRO, ADMR, ITMG, and INDY as favored picks for the second half, with trading recommendations for PT Bumi Resources Tbk (Rp 224 target) and INDY (Rp 3,330 target).",
        source: "Kontan",
      },
    ],
  },

  BYAN: {
    symbol: "BYAN",

    period: {
      start: "20 Aug 2026",
      end: "12 Sept 2026",
    },

    newsCount: 30,

    suspension: {
      recorded: false,
      text: "Suspension status was not collected for this company in this News snapshot.",
    },

    events: [
      {
        id: "byan-news-20260912081200-1",
        date: "12 Sept 2026",
        sortDate: "2026-09-12T08:12:00",
        type: "news",
        scope: "market-context",
        title: "Grup Djarum, Low Tuck Kwong, and Prajogo Pangestu Stocks Weigh Down the IHSG for the Week",
        summary: "During the week of 7â11 September 2026, shares of PT Bank Central Asia Tbk, PT Bayan Resources Tbk, PT Bank Rakyat Indonesia Tbk, PT Dian Swastatika Sentosa Tbk, PT Bank Negara Indonesia Tbk, PT Bumi Resources Minerals Tbk, PT Barito Pacific Tbk, PT Bank Mandiri Tbk, PT Barito Renewables Energy Tbk, and PT VKTR Teknologi Mobilitas Tbk fell sharply, delivering the largest negative contributions to the IHSG, with BBCA down 5.60% (-33.09 points), BYAN down 10.51% (-23.63 points), BBRI down 3.54% (-17.51 points), DSSA down 6.78% (-6.86 points), BBNI down 4.82% (-6.26 points), BRMS down 5.59% (-5.95 points), BRPT down 5.03% (-5.22 points), BMRI down 1.36% (-4.90 points), BREN down 3.57% (-4.64 points), and VKTR down 8.09% (-4.31 points). The composite index slipped 1.43% to 6,541,377, while total market capitalization fell 1.32% to Rp11,446 trillion and average daily transaction value dropped 14.88% to Rp16.36 trillion. Foreign investors posted a net sell of Rp690.19 billion on 11 September, contributing to a year-to-date net outflow of Rp71,415 trillion.",
        source: "Bisnis",
      },
      {
        id: "byan-news-20260911163100-2",
        date: "11 Sept 2026",
        sortDate: "2026-09-11T16:31:00",
        type: "news",
        scope: "market-context",
        title: "9/11, IHSG Corrected as Oil Prices Surge and Rupiah Weakens",
        summary: "The Indonesian Composite Index (IHSG) closed at 6,541.37 on Friday, down 0.73% (47.96 points), as Brent crude rose above $100 per barrel to $107.63 and the rupiah weakened to Rp17,611 per USD, prompting a correction after an earlier 1.49% drop. The decline was led by big-cap stocks BYAN, MORA, TPIA and CUAN, which fell amid heightened geopolitical tensions and domestic fiscal pressures, while total market capitalization stood at Rp11,470.93 trillion.",
        source: "Bisnis",
      },
      {
        id: "byan-news-20260911161800-3",
        date: "11 Sept 2026",
        sortDate: "2026-09-11T16:18:00",
        type: "news",
        scope: "company",
        title: "Check BYAN Stock Valuation Amid Haji Isam's Cheap Offer",
        summary: "The article examines PT Bayan Resources Tbk's valuation as a rumor circulates that Haji Isam is offering to buy 62% of the company for US$3 billion, an implied 80% discount to the current market price. The rumor has driven the shares down, with the stock falling 675 points (4.91%) to Rp13,100 and then another 7% to Rp12,150 on September 11 2026. BYAN trades at a price-to-book ratio of 9.44x and a price-to-earnings ratio of 27.9x, far above the coal-mining industry averages of 3.2x PBV and 11.4x PER, giving it a market capitalisation of roughly Rp412 trillion. Major shareholders Low Tuck Kwong (40.25%) and Elaine Low (22%) together hold the 62.2% stake that the offer seeks to acquire, and the deal is expected to close before year-end, potentially financed by Indonesian state-owned banks.",
        source: "Bloomberg Technoz",
      },
      {
        id: "byan-news-20260911135400-4",
        date: "11 Sept 2026",
        sortDate: "2026-09-11T13:54:00",
        type: "news",
        scope: "market-context",
        title: "IHSG Falls 1.49% in First Session as Global Markets Slide on Oil Surge and Fed Rate Hike Bets",
        summary: "The Indonesian Composite Stock Price Index (IHSG) fell 1.49% to 6,490 in the first trading session on Friday, driven by heavy selling pressure across the market. Big-cap stocks BYAN, BBCA, and BRMS were the primary weights on the index, while transport, non-primary consumer, and infrastructure sectors led declines of more than 1.7% each. The selloff tracked a broad decline across Asian markets as Brent crude surged above $108 per barrel and stronger-than-expected US producer inflation increased the probability of a Federal Reserve rate hike to 70%. The rupiah weakened to 17,610 per US dollar amid dollar strength fueled by rate hike expectations. Panin Sekuritas cited escalating geopolitical tensions, oil above $100 per barrel, and heavy foreign outflows as key drivers.",
        source: "Bloomberg Technoz",
      },
      {
        id: "byan-news-20260911132100-5",
        date: "11 Sept 2026",
        sortDate: "2026-09-11T13:21:00",
        type: "news",
        scope: "company",
        title: "Haji Isam Rumored to Offer About $3 billion for 62% of PT Bayan Resources Tbk, Below Market Value",
        summary: "According to a Bloomberg report on 11 September 2026, the conglomerate led by Andi Syamsuddin Arsyad, known as Haji Isam, is rumored to have submitted a bid to acquire roughly 62 % of PT Bayan Resources Tbk for about US$3 billion (approximately Rp 52.75 trillion). The proposed price is well below the current market valuation of PT Bayan Resources Tbk, which is near US$26 billion (around Rp 457.96 trillion). Earlier indications suggested an initial offer of US$4.8 billion (Rp 84.54 trillion), also below market levels. Neither Haji Isam nor PT Bayan Resources Tbk has responded to comment requests.",
        source: "finance.detik.com",
      },
    ],
  },

  ITMG: {
    symbol: "ITMG",

    period: {
      start: "26 Jul 2026",
      end: "9 Sept 2026",
    },

    newsCount: 30,

    suspension: {
      recorded: false,
      text: "Suspension status was not collected for this company in this News snapshot.",
    },

    events: [
      {
        id: "itmg-news-20260909110600-1",
        date: "9 Sept 2026",
        sortDate: "2026-09-09T11:06:00",
        type: "news",
        scope: "company",
        title: "PT Indo Tambangraya Megah Tbk signals plan for interim dividend in FY2026",
        summary: "PT Indo Tambangraya Megah Tbk announced it is planning an interim dividend for fiscal year 2026, though the exact amount and percentage are still being calculated. The company highlighted its strong first-half 2026 performance, with revenue up 9% YoY to USD1.0 billion, net profit rising 17% to USD110 million, gross profit to USD256 million and EBITDA to USD181 million, driven by a 5% volume increase and a 4% rise in average selling price to USD81 per ton. ITMG noted its regular dividend practice, citing interim and final dividends paid in FY2024 and FY2025, and reaffirmed the interim payout as part of its commitment to deliver value to shareholders.",
        source: "EmitenNews",
      },
      {
        id: "itmg-news-20260909110400-2",
        date: "9 Sept 2026",
        sortDate: "2026-09-09T11:04:00",
        type: "news",
        scope: "company",
        title: "ITMG Signals Interim Dividend as H1 2026 Net Profit Rises 16.5%",
        summary: "PT Indo Tambangraya Megah Tbk (ITMG) signaled an interim dividend during its public expose, with the CEO stating the payout remains under calculation but historically the company has distributed high payout ratios. In fiscal year 2025, ITMG paid a total dividend of US$115 million, representing a 60% payout ratio, of which US$50 million (Rp738 per share) was distributed as an interim dividend on November 26, 2025. For the first half of 2026, net profit increased 16.5% year-on-year to US$105.9 million (Rp1.89 trillion) on revenue of US$1 billion, up 9%, driven by a 5% rise in sales volume and a 4% increase in average selling price to US$81 per ton.",
        source: "Bisnis",
      },
      {
        id: "itmg-news-20260907072300-3",
        date: "7 Sept 2026",
        sortDate: "2026-09-07T07:23:00",
        type: "news",
        scope: "market-context",
        title: "Foreign investors heavily buy big bank stocks PT Bank Rakyat Indonesia Tbk, PT Bank Central Asia Tbk and PT Bank Mandiri Tbk in the past week.",
        summary: "The article reports that foreign investors returned to Indonesia's banking sector last week, posting the largest net purchases in the market for the three big banks. PT Bank Rakyat Indonesia Tbk recorded a net buy of Rp 1.41 trillion, PT Bank Central Asia Tbk Rp 1.20 trillion and PT Bank Mandiri Tbk Rp 1.01 trillion, together accounting for about Rp 3.62 trillion of foreign inflows, while PT Bank Negara Indonesia Tbk added Rp 261.39 billion. Other heavily bought stocks included PT Chandra Asri Pacific Tbk (Rp 238.84 billion), PT Dian Swastatika Sentosa Tbk (Rp 168.05 billion), PT Triputra Agro Persada Tbk (Rp 147.58 billion), PT Erajaya Swasembada Tbk (Rp 126.94 billion), PT Adaro Andalan Indonesia Tbk (Rp 93.49 billion) and PT Alamtri Resources Indonesia Tbk (Rp 84.23 billion). Foreign investors sold PT Charoen Pokphand Indonesia Tbk (Rp 485.66 billion), PT Merdeka Gold Resources Tbk (Rp 337.42 billion), PT Indosat Tbk (Rp 225.62 billion), PT Amman Mineral Internasional Tbk (Rp 173 billion), PT Petrosea Tbk (Rp 162.7 billion), PT Astra International Tbk (Rp 150.28 billion), PT Bukalapak.com Tbk (Rp 129.03 billion), PT Bumi Resources Minerals Tbk (Rp 126.97 billion), PT Indo Tambangraya Megah Tbk (Rp 121.57 billion) and PT Unilever Indonesia Tbk (Rp 109.91 billion), contributing to a total foreign net buy of Rp 1.85 trillion and supporting a 1.82 % weekly rise in the IHSG index, which closed at 6,636.47, down 31.4 points (0.47 %) on Friday.",
        source: "Kontan",
      },
      {
        id: "itmg-news-20260903183500-4",
        date: "3 Sept 2026",
        sortDate: "2026-09-03T18:35:00",
        type: "news",
        scope: "market-context",
        title: "Ten Indonesian coal issuers report H1 2026 net profit growth led by Adaro Andalan Indonesia Tbk and Bayan Resources Tbk",
        summary: "Ten Indonesian coal mining issuers posted year-on-year net profit increases in the first half of 2026, with PT Adaro Andalan Indonesia Tbk recording the highest profit attributable to parent entity owners at US$473.77 million (approximately Rp8.48 trillion), up 10.52%, followed by PT Bayan Resources Tbk at approximately Rp7.34 trillion, up 17.47%. PT Alamtri Resources Indonesia Tbk ranked third with US$309.36 million (Rp5.54 trillion), a 76.83% surge, while PT Alamtri Minerals Indonesia Tbk, PT Bukit Asam Tbk, PT Indo Tambangraya Megah Tbk, PT Bumi Resources Tbk, PT Darma Henwa Tbk, PT Petrindo Jaya Kreasi Tbk, and PT Indika Energy Tbk completed the list with profits ranging from Rp3.12 trillion down to Rp182 billion. PT Petrindo Jaya Kreasi Tbk posted the highest profit growth at approximately 918% to US$19.78 million (Rp354 billion), and PT Indika Energy Tbk followed with a 354.30% increase to US$10.20 million (Rp182 billion). Revenue growth accompanied profit gains across the group, with Adaro's revenue rising 6.13% to US$2.55 billion and Bayan's reaching approximately Rp31.15 trillion.",
        source: "Bisnis",
      },
      {
        id: "itmg-news-20260901212000-5",
        date: "1 Sept 2026",
        sortDate: "2026-09-01T21:20:00",
        type: "news",
        scope: "market-context",
        title: "Global Coal Price Surge Drives Strong First-Half 2026 Earnings for Indonesian Coal Miners",
        summary: "Rising global coal prices since March 2026 have significantly improved the financial performance of Indonesian coal mining companies in the first half of 2026. PT Bukit Asam Tbk reported revenue growth of 7.73% to Rp 22.03 trillion and a 218.10% surge in net profit to Rp 2.65 trillion, while PT Bumi Resources Tbk saw net profit jump 188.34% to US$58.85 million on 27.85% revenue growth to US$866.75 million. PT Adaro Andalan Indonesia Tbk posted 6.25% revenue growth to US$2.55 billion and a 10.52% rise in net profit to US$473.77 million. Analysts attribute the gains to coal prices above US$120 per ton, operational improvements, and structural demand from AI and seasonal factors, highlighting PT Bukit Asam Tbk, PT Adaro Andalan Indonesia Tbk, ADRO, ADMR, ITMG, and INDY as favored picks for the second half, with trading recommendations for PT Bumi Resources Tbk (Rp 224 target) and INDY (Rp 3,330 target).",
        source: "Kontan",
      },
    ],
  },

  GEMS: {
    symbol: "GEMS",

    period: {
      start: "19 May 2026",
      end: "27 Aug 2026",
    },

    newsCount: 17,

    suspension: {
      recorded: false,
      text: "Suspension status was not collected for this company in this News snapshot.",
    },

    events: [
      {
        id: "gems-news-20260827102000-1",
        date: "27 Aug 2026",
        sortDate: "2026-08-27T10:20:00",
        type: "news",
        scope: "market-context",
        title: "Coal Stocks Outlook for H2 2026 Highlights PT Adaro Andalan Indonesia Tbk Amid RKAB and DSI Uncertainties",
        summary: "The article evaluates the outlook for Indonesian coal equities in the second half of 2026, noting that production uncertainty from RKAB plans, DSI policy implementation, and fuel price dynamics cast a shadow over the sector. Analysts from Panin Sekuritas expect operational improvements in Q2 2026, with average selling price support but margins constrained by fuel costs, and they project Newcastle coal prices to stay above US$120 per ton. PT Adaro Andalan Indonesia Tbk is singled out as the top pick due to high cash margin, low stripping ratio and large reserves, while PT Bumi Resources Tbk, PT Bukit Asam Tbk, PT Indo Tambangraya Megah Tbk and PT Golden Energy Mines Tbk are also highlighted as beneficiaries; Sucor Sekuritas sets a buy target of Rp12,600 per share for AADI. Investors should watch for coal price volatility, potential fuel price spikes from Middle-East geopolitics, and the September 2026 implementation of DSI, which could raise administrative costs.",
        source: "Bisnis",
      },
      {
        id: "gems-news-20260810084306-2",
        date: "10 Aug 2026",
        sortDate: "2026-08-10T08:43:06",
        type: "news",
        scope: "market-context",
        title: "PT Dian Swastatika Sentosa Tbk outlines $2.8 bn digital-AI transformation plan aiming for 50% non-coal revenue by 2029",
        summary: "PT Dian Swastatika Sentosa Tbk announced a strategic shift toward digital and artificial-intelligence infrastructure, targeting an equal split of revenue between coal and non-coal businesses by 2029. While about 90% of its EBITDA currently comes from coal through its subsidiary PT Golden Energy Mines Tbk, the company projects EBITDA to be 60% coal and 40% non-coal this year and to achieve a 50:50 revenue mix by 2029. It has invested roughly US$2.8 bn (âRp50 trillion) in an AI-ready ecosystem, including a fully contracted 40 MW data-center in Jakarta slated to start operations in October 2026. The transformation will also leverage its digital assets such as MyRepublic, Moratelindo, SM+, ASIX, Dana, Video and its stake in XLSMART.",
        source: "Investor.id",
      },
      {
        id: "gems-news-20260721193707-3",
        date: "21 Jul 2026",
        sortDate: "2026-07-21T19:37:07",
        type: "news",
        scope: "market-context",
        title: "Foreign investors post biggest net purchase of PT Dian Swastatika Sentosa Tbk (DSSA) on July 21, 2026",
        summary: "Foreign investors made a net purchase of Rp 263.6 billion in PT Dian Swastatika Sentosa Tbk (DSSA) on Tuesday, 21 July 2026, the largest foreign net buy among Indonesian stocks that day. The DSSA inflow was followed by a Rp 91.7 billion net buy in PT Antam Tbk (ANTM), while foreign investors sold Rp 61.3 billion of PT Astra International Tbk (ASII) and Rp 51.9 billion of PT Bumi Resources Tbk (BUMI). Across the market, foreign investors recorded a net purchase of Rp 30.7 billion on the day, against a year-to-date foreign net sell total of Rp 75.5 trillion. DSSA, described as the consolidator of Grup Sinar Mas's telecom and technology businesses, plans to acquire 35 % of PT Ketrosden Triasmitra Tbk (KETR) at Rp 523 per share as it seeks to reduce dependence on its coal business PT Golden Energy Mines Tbk (GEMS).",
        source: "Investor.id",
      },
      {
        id: "gems-news-20260721172111-4",
        date: "21 Jul 2026",
        sortDate: "2026-07-21T17:21:11",
        type: "news",
        scope: "market-context",
        title: "Bayan Resources (BYAN) Shows Lower Cash Costs and Stronger Margins Than Peer Coal Issuers",
        summary: "Analyst Adolf RB Setiadi of KB Valbury highlights that PT Bayan Resources Tbk (BYAN) maintains a lower cash cost of US$32.5 per metric ton in 2025, well below the US$39.1 guidance and a stripping ratio of 3.9 Ã, the lowest among Indonesian coal producers. The company's integrated operations enabled a 2025 EBITDA margin of 33.9 % and net-margin of 22.9 %, and Q1-2026 EBITDA reached US$285.6 million, surpassing the internal estimate of US$247 million despite a 0.5 % revenue decline and 16.9 % profit drop. Ownership remains concentrated, with Low Tuck Kwong holding 40.2 % and his daughter Elaine Low 22 % of the shares. Compared with peers PT Golden Energy Mines Tbk, PT Bumi Resources Tbk, PT Bukit Asam Tbk and PT Indo Tambangraya Megah Tbk, BYAN's cost structure and logistics integration provide greater resilience to coal-price fluctuations.",
        source: "Investor.id",
      },
      {
        id: "gems-news-20260721094800-5",
        date: "21 Jul 2026",
        sortDate: "2026-07-21T09:48:00",
        type: "news",
        scope: "market-context",
        title: "DSSA stock jumps 5.5% on strong net buying as company pivots to AI and renewable energy",
        summary: "Shares of PT Dian Swastatika Sentosa Tbk (DSSA), an issuer of the Sinar Mas Group, surged 5.52% to Rp 860 on Tuesday after a net buy of Rp 129.6 billion, the highest among net-buy stocks, with 432.8 million shares traded. The rally follows DSSA's announced transformation from a coal-dominant businessâwhere PT Golden Energy Mines Tbk (GEMS) contributed about 86.4% of FY25 revenueâto a four-layer AI ecosystem built on the DANA digital wallet, the SMX01 hyperscale data centre (jointly with LG CNS), a 480 MW geothermal portfolio and a solar-plant JV with Trina Solar and PLN. The company projects revenue to rise from US$2.79 billion in FY25 to US$5.53 billion in FY30 and net profit from US$230 million to US$752 million, with net margin expanding to 13.6% by FY30. Additionally, XLSmart, the merged XL AxiataâSmartfren operator, is expected to shift from a Rp 4.4 trillion loss in FY25 to a Rp 1.1 trillion contribution by FY27, supported by annual cost synergies of Rp 820 billion.",
        source: "Investor.id",
      },
    ],
  },
};

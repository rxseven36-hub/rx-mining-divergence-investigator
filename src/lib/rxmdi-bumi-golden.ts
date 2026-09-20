export const bumiGoldenData = {
  identity: {
    ticker: "BUMI",
    symbol: "BUMI.JK",
    name: "PT Bumi Resources Tbk",
    category: "THERMAL COAL",
    listing: "Indonesia Stock Exchange",
    logo: "/company-logos/bumi-resources.png",
    latestClose: 222,
    latestCloseDate: "2026-09-09",
    dailyChange: -0.0176991150442478,
    marketCapIdr: 82436457039096,
    marketCapRank: 30,
    esgScore: 46.55,
    indices: ["LQ45", "KOMPAS100", "IDX30", "JII70"],
  },

  financials2024: {
    assetsUsd: 4163000000,
    revenueUsd: 1360000000,
    coalRevenueUsd: 1197330000,
    goldSilverRevenueUsd: 162340000,
    costOfRevenueUsd: 1190390000,
    netProfitUsd: 90000000,
  },

  operations2024: {
    productionMt: 74.7,
    salesMt: 75.8,
    overburdenMt: 649.7,
    stripRatio: 8.7,
    totalReservesMt: 2354,
    totalResourcesMt: 6817,
    measurementYear: 2024,
    availableYears: [2019, 2020, 2021, 2022, 2023, 2024],
  },

  license: {
    type: "IUP",
    number: "212 TAHUN 2013",
    location: "Kabupaten Lebong, Bengkulu",
    activity: "Operasi Produksi",
    areaHa: 535,
    effectiveDate: "2013-05-27",
    expiryDate: "2028-05-27",
    commodity: "Coal",
  },

  subsidiaries: [
    { name: "PT Arutmin Indonesia", ownership: 90 },
    { name: "PT Pendopo Energi Batubara", ownership: 84.52 },
    { name: "PT Kaltim Prima Coal", ownership: 51 },
    { name: "PT Bumi Resources Minerals Tbk", ownership: 20.92 },
  ],

  destinations2024: [
    { country: "Indonesia", volume: 23.07 },
    { country: "China", volume: 21.258 },
    { country: "India", volume: 12.767 },
    { country: "Japan", volume: 5.661 },
    { country: "Philippines", volume: 3.451 },
    { country: "Taiwan", volume: 2.457 },
    { country: "Malaysia", volume: 2.267 },
    { country: "Korea", volume: 1.831 },
  ],

  products: [
    { name: "Prima", kcal: 6976, moisture: 10, ashAdb: 6, sulphurAdb: 0.6 },
    { name: "Pinang 6250 GAR", kcal: 6613, moisture: 13, ashAdb: 7, sulphurAdb: 0.6 },
    { name: "Pinang 6150 GAR", kcal: 6579, moisture: 14, ashAdb: 7, sulphurAdb: 0.6 },
    { name: "Pinang 6000 GAR", kcal: 6275, moisture: 16, ashAdb: 7, sulphurAdb: 0.8 },
    { name: "Pinang 5800 GAR", kcal: 6083, moisture: 18, ashAdb: 5, sulphurAdb: 1.5 },
    { name: "KPC 4700", kcal: 5330, moisture: 28, ashAdb: 7, sulphurAdb: 0.8 },
    { name: "KPC 4200", kcal: 4613, moisture: 35, ashAdb: 4, sulphurAdb: 0.4 },
    { name: "Ecocoal", kcal: 5177, moisture: 35.5, ashAdb: 5.5, sulphurAdb: 0.4 },
  ],

  peers2025: [
    { ticker: "BYAN", name: "Bayan Resources", marketCapIdr: 459166689625000, pe: 32.4213788338334 },
    { ticker: "AADI", name: "Adaro Andalan Indonesia", marketCapIdr: 96946802412000, pe: 6.98233733693602 },
    { ticker: "ADRO", name: "Alamtri Resources Indonesia", marketCapIdr: 77473329398000, pe: 7.76658278646337 },
    { ticker: "ADMR", name: "Alamtri Minerals Indonesia", marketCapIdr: 68477905262500, pe: 13.1171869827167 },
    { ticker: "GEMS", name: "Golden Energy Mines", marketCapIdr: 45147059275000, pe: 11.9969212062063 },
    { ticker: "PTBA", name: "Bukit Asam", marketCapIdr: 35714043675000, pe: 7.52379569171899 },
    { ticker: "ITMG", name: "Indo Tambangraya Megah", marketCapIdr: 29999508750000, pe: 8.5289480774325 },
  ],

  provenance: {
    label: "Sectors data snapshot collected by RX MDI",
    collected: "2026-09-11",
    financialYear: 2024,
    peerYear: 2025,
  },
} as const;

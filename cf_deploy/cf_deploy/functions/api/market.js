// ─── MODULE-LEVEL CONSTANTS ───────────────────────────────────────────────────
// FIX #1: All constants moved OUTSIDE handler — not re-created on every request.

// FIX #7: AbortSignal.timeout() requires Node 17.3+. Use explicit AbortController
// so this works on any Node version Vercel may provision.
function fetchWithTimeout(url, opts = {}, ms = 6000) {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// FIX #5: Updated prices to March 2026 reality. Micro-cap series stored with
// sufficient decimal places; toFixed(8) in makeSeries preserves precision.
const STATIC = {
  currencies: {
    "FX / MAD": [
      { id: "USD/MAD", name: "US Dollar",          value: 10.0415, change:  0.75, series: [9.88, 9.90, 9.95, 9.97, 10.00, 10.02, 10.04] },
      { id: "EUR/MAD", name: "Euro",               value: 10.8876, change: -0.92, series: [11.12, 11.08, 11.03, 10.98, 10.95, 10.91, 10.89] },
      { id: "GBP/MAD", name: "British Pound",      value: 12.7540, change:  0.18, series: [12.62, 12.65, 12.68, 12.70, 12.73, 12.74, 12.754] },
      { id: "CHF/MAD", name: "Swiss Franc",        value: 11.2340, change:  0.08, series: [11.18, 11.19, 11.20, 11.21, 11.22, 11.23, 11.234] },
      { id: "CAD/MAD", name: "Canadian Dollar",    value:  7.4120, change: -0.14, series: [7.45, 7.44, 7.43, 7.43, 7.42, 7.42, 7.412] },
      { id: "AUD/MAD", name: "Australian Dollar",  value:  6.4850, change: -0.31, series: [6.54, 6.52, 6.51, 6.50, 6.49, 6.49, 6.485] },
      { id: "JPY/MAD", name: "100 Japanese Yen",   value:  6.7022, change: -0.25, series: [6.81, 6.79, 6.76, 6.74, 6.73, 6.71, 6.70] },
      { id: "CNY/MAD", name: "Chinese Yuan",       value:  1.3820, change: -0.10, series: [1.39, 1.388, 1.386, 1.384, 1.382, 1.382, 1.382] },
      { id: "NOK/MAD", name: "Norwegian Krone",    value:  0.9140, change:  0.05, series: [0.910, 0.911, 0.912, 0.912, 0.913, 0.914, 0.914] },
      { id: "SEK/MAD", name: "Swedish Krona",      value:  0.9380, change: -0.08, series: [0.942, 0.941, 0.940, 0.940, 0.939, 0.938, 0.938] },
      { id: "DKK/MAD", name: "Danish Krone",       value:  1.4620, change:  0.03, series: [1.460, 1.461, 1.461, 1.462, 1.462, 1.462, 1.462] },
      { id: "SAR/MAD", name: "Saudi Riyal",        value:  2.6780, change:  0.18, series: [2.66, 2.663, 2.667, 2.670, 2.672, 2.675, 2.678] },
      { id: "AED/MAD", name: "UAE Dirham",         value:  2.7341, change:  0.22, series: [2.71, 2.715, 2.72, 2.723, 2.726, 2.73, 2.734] },
      { id: "KWD/MAD", name: "Kuwaiti Dinar",      value: 32.6400, change:  0.09, series: [32.50, 32.54, 32.56, 32.58, 32.60, 32.62, 32.64] },
      { id: "QAR/MAD", name: "Qatari Riyal",       value:  2.7560, change:  0.11, series: [2.74, 2.745, 2.748, 2.750, 2.752, 2.754, 2.756] },
      { id: "BHD/MAD", name: "Bahraini Dinar",     value: 26.6300, change:  0.07, series: [26.58, 26.60, 26.61, 26.62, 26.63, 26.63, 26.63] },
      { id: "OMR/MAD", name: "Omani Rial",         value: 26.1100, change:  0.12, series: [26.04, 26.06, 26.08, 26.09, 26.10, 26.11, 26.11] },
      { id: "JOD/MAD", name: "Jordanian Dinar",    value: 14.1600, change:  0.05, series: [14.13, 14.14, 14.14, 14.15, 14.15, 14.16, 14.16] },
      { id: "TRY/MAD", name: "Turkish Lira",       value:  0.3120, change: -0.85, series: [0.318, 0.317, 0.316, 0.314, 0.313, 0.312, 0.312] },
      { id: "EGP/MAD", name: "Egyptian Pound",     value:  0.2050, change: -0.48, series: [0.210, 0.209, 0.208, 0.207, 0.206, 0.205, 0.205] },
      { id: "TND/MAD", name: "Tunisian Dinar",     value:  3.2450, change: -0.22, series: [3.28, 3.27, 3.26, 3.26, 3.25, 3.245, 3.245] },
      { id: "DZD/MAD", name: "Algerian Dinar",     value:  0.0748, change:  0.04, series: [0.074, 0.074, 0.075, 0.075, 0.075, 0.075, 0.075] },
      { id: "BRL/MAD", name: "Brazilian Real",     value:  1.7940, change: -0.62, series: [1.83, 1.82, 1.81, 1.80, 1.80, 1.796, 1.794] },
      { id: "INR/MAD", name: "Indian Rupee",       value:  0.1185, change:  0.10, series: [0.117, 0.118, 0.118, 0.118, 0.119, 0.119, 0.119] },
      { id: "ZAR/MAD", name: "South African Rand", value:  0.5480, change: -0.35, series: [0.554, 0.553, 0.552, 0.551, 0.550, 0.549, 0.548] },
    ],
  },
  crypto: {
    "LARGE CAP": [
      { id: "BTC",   name: "Bitcoin",           symbol: "₿",  value: 83200.00, change:  0.35, series: [81100, 81350, 81520, 81900, 82100, 82820, 83200] },
      { id: "ETH",   name: "Ethereum",          symbol: "Ξ",  value:  1905.00, change: -0.88, series: [1940, 1932, 1926, 1920, 1916, 1910, 1905] },
      { id: "BNB",   name: "BNB",               symbol: "⬡",  value:   612.14, change:  0.52, series: [603, 604, 606, 608, 609, 611, 612] },
      { id: "SOL",   name: "Solana",            symbol: "◎",  value:   126.44, change:  1.14, series: [120, 121, 122, 123, 124, 125, 126.4] },
      { id: "XRP",   name: "XRP",               symbol: "✕",  value:     2.21, change:  2.10, series: [2.08, 2.10, 2.12, 2.15, 2.17, 2.19, 2.21] },
      { id: "ADA",   name: "Cardano",           symbol: "₳",  value:    0.718, change: -1.20, series: [0.742, 0.738, 0.733, 0.729, 0.726, 0.722, 0.718] },
      { id: "AVAX",  name: "Avalanche",         symbol: "▲",  value:    19.42, change: -0.75, series: [19.8, 19.7, 19.6, 19.6, 19.5, 19.5, 19.42] },
      { id: "DOT",   name: "Polkadot",          symbol: "●",  value:     3.92, change: -0.44, series: [4.00, 3.98, 3.97, 3.96, 3.95, 3.94, 3.92] },
      { id: "MATIC", name: "Polygon",           symbol: "⬡",  value:    0.228, change:  1.30, series: [0.220, 0.222, 0.223, 0.224, 0.225, 0.227, 0.228] },
      { id: "LTC",   name: "Litecoin",          symbol: "Ł",  value:    87.25, change: -0.62, series: [88.5, 88.2, 87.9, 87.7, 87.6, 87.4, 87.25] },
    ],
    "DEFI / LAYER2": [
      { id: "LINK",  name: "Chainlink",         symbol: "⬡",  value:    13.64, change:  1.85, series: [13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.64] },
      { id: "UNI",   name: "Uniswap",           symbol: "🦄", value:     5.84, change:  2.25, series: [5.52, 5.58, 5.64, 5.68, 5.72, 5.78, 5.84] },
      { id: "AAVE",  name: "Aave",              symbol: "👻", value:   152.40, change:  1.40, series: [148.2, 148.8, 149.4, 150.0, 150.8, 151.6, 152.4] },
      { id: "ARB",   name: "Arbitrum",          symbol: "🔵", value:    0.342, change:  2.80, series: [0.320, 0.324, 0.328, 0.332, 0.336, 0.339, 0.342] },
      { id: "OP",    name: "Optimism",          symbol: "🔴", value:    0.784, change:  3.20, series: [0.732, 0.742, 0.752, 0.762, 0.770, 0.778, 0.784] },
      { id: "MKR",   name: "Maker",             symbol: "⬙",  value: 1480.00, change: -0.55, series: [1510, 1505, 1500, 1495, 1490, 1485, 1480] },
      { id: "CRV",   name: "Curve DAO",         symbol: "〜", value:    0.485, change:  1.65, series: [0.464, 0.467, 0.470, 0.474, 0.477, 0.481, 0.485] },
      { id: "LDO",   name: "Lido DAO",          symbol: "🌊", value:    0.820, change:  2.10, series: [0.774, 0.782, 0.790, 0.798, 0.806, 0.814, 0.820] },
      { id: "SNX",   name: "Synthetix",         symbol: "⚡", value:    1.240, change:  1.22, series: [1.195, 1.205, 1.212, 1.218, 1.224, 1.232, 1.240] },
      { id: "GMX",   name: "GMX",               symbol: "⬡",  value:    16.42, change:  0.88, series: [15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.42] },
    ],
    "MEME / TRENDING": [
      { id: "DOGE",  name: "Dogecoin",          symbol: "Ð",  value: 0.16240,    change:  3.40, series: [0.152, 0.154, 0.157, 0.159, 0.160, 0.161, 0.1624] },
      { id: "SHIB",  name: "Shiba Inu",         symbol: "🐕", value: 0.00001242, change:  4.80, series: [0.00001124, 0.00001148, 0.00001172, 0.00001195, 0.00001214, 0.00001229, 0.00001242] },
      { id: "PEPE",  name: "Pepe",              symbol: "🐸", value: 0.00000728, change:  8.50, series: [0.00000612, 0.00000638, 0.00000658, 0.00000678, 0.00000696, 0.00000714, 0.00000728] },
      { id: "WIF",   name: "dogwifhat",         symbol: "🐶", value: 0.840,      change:  5.20, series: [0.756, 0.772, 0.788, 0.800, 0.816, 0.828, 0.840] },
      { id: "FLOKI", name: "Floki",             symbol: "⚡", value: 0.0000882,  change:  3.15, series: [0.0000822, 0.0000834, 0.0000846, 0.0000856, 0.0000864, 0.0000874, 0.0000882] },
      { id: "BONK",  name: "Bonk",              symbol: "🔥", value: 0.0000184,  change:  6.40, series: [0.0000152, 0.0000158, 0.0000164, 0.0000170, 0.0000175, 0.0000180, 0.0000184] },
    ],
    "STABLECOINS": [
      { id: "USDT",  name: "Tether",            symbol: "₮",  value: 1.000, change:  0.00, series: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00] },
      { id: "USDC",  name: "USD Coin",          symbol: "◎",  value: 1.000, change:  0.01, series: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00] },
      { id: "DAI",   name: "Dai",               symbol: "◈",  value: 1.000, change:  0.00, series: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00] },
      { id: "FDUSD", name: "First Digital USD", symbol: "$",  value: 1.000, change:  0.00, series: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00] },
    ],
    "LAYER1 / INFRA": [
      { id: "TRX",   name: "TRON",              symbol: "♦",  value:  0.2285, change:  0.88, series: [0.220, 0.222, 0.223, 0.225, 0.226, 0.228, 0.2285] },
      { id: "ATOM",  name: "Cosmos",            symbol: "⚛",  value:   4.420, change: -0.32, series: [4.48, 4.46, 4.46, 4.45, 4.44, 4.43, 4.42] },
      { id: "NEAR",  name: "NEAR Protocol",     symbol: "Ⓝ",  value:   2.340, change:  1.55, series: [2.24, 2.26, 2.28, 2.29, 2.31, 2.32, 2.34] },
      { id: "APT",   name: "Aptos",             symbol: "◉",  value:   4.960, change:  2.20, series: [4.68, 4.74, 4.79, 4.84, 4.88, 4.93, 4.96] },
      { id: "SUI",   name: "Sui",               symbol: "💧", value:   2.240, change:  3.80, series: [2.08, 2.12, 2.16, 2.19, 2.22, 2.23, 2.24] },
      { id: "FTM",   name: "Fantom",            symbol: "👻", value:   0.584, change:  1.42, series: [0.554, 0.560, 0.566, 0.570, 0.575, 0.580, 0.584] },
      { id: "ALGO",  name: "Algorand",          symbol: "Ⓐ",  value:   0.242, change: -0.55, series: [0.248, 0.247, 0.246, 0.245, 0.245, 0.243, 0.242] },
      { id: "XLM",   name: "Stellar",           symbol: "✦",  value:   0.282, change:  0.90, series: [0.272, 0.274, 0.276, 0.277, 0.279, 0.281, 0.282] },
      { id: "VET",   name: "VeChain",           symbol: "⬡",  value:  0.0242, change:  1.05, series: [0.0228, 0.0231, 0.0234, 0.0236, 0.0238, 0.0240, 0.0242] },
      { id: "ICP",   name: "Internet Computer", symbol: "∞",  value:   5.840, change: -0.88, series: [5.98, 5.94, 5.90, 5.87, 5.86, 5.85, 5.84] },
    ],
  },
  indices: {
    "GLOBAL INDICES": [
      { id: "MASI",    name: "Morocco All Share",      value:  12946.35, change:  0.31, series: [12860, 12895, 12910, 12918, 12925, 12936, 12946] },
      { id: "DOW",     name: "Dow Jones",              value:  41480.00, change:  0.42, series: [41200, 41250, 41300, 41350, 41400, 41440, 41480] },
      { id: "SPX",     name: "S&P 500",                value:   5580.00, change:  0.38, series: [5530, 5545, 5555, 5562, 5568, 5575, 5580] },
      { id: "NASDAQ",  name: "Nasdaq Composite",       value:  17440.00, change: -0.22, series: [17530, 17510, 17490, 17475, 17465, 17452, 17440] },
      { id: "FTSE",    name: "FTSE 100",               value:   8640.00, change:  0.14, series: [8612, 8616, 8624, 8629, 8634, 8638, 8640] },
      { id: "DAX",     name: "DAX (Frankfurt)",        value:  22820.00, change:  0.38, series: [22685, 22710, 22742, 22768, 22790, 22808, 22820] },
      { id: "CAC40",   name: "CAC 40 (Paris)",         value:   7980.00, change: -0.22, series: [8037, 8025, 8012, 8001, 7995, 7987, 7980] },
      { id: "NIKKEI",  name: "Nikkei 225",             value:  37240.00, change:  0.45, series: [37010, 37055, 37110, 37165, 37205, 37228, 37240] },
      { id: "HSI",     name: "Hang Seng",              value:  23480.00, change: -0.55, series: [23680, 23640, 23600, 23570, 23540, 23505, 23480] },
      { id: "SSE",     name: "Shanghai Composite",     value:   3320.00, change:  0.28, series: [3300, 3304, 3309, 3313, 3316, 3319, 3320] },
      { id: "TADAWUL", name: "Tadawul (Saudi)",        value:  11842.60, change:  0.62, series: [11754, 11770, 11792, 11808, 11820, 11834, 11842] },
      { id: "SENSEX",  name: "BSE Sensex (India)",     value:  74482.78, change:  0.42, series: [74100, 74180, 74260, 74330, 74390, 74440, 74482] },
    ],
    "USA STOCKS": [
      { id: "AAPL",  name: "Apple",                   value:  209.30, change:  0.82, series: [205.2, 206.1, 207.0, 207.8, 208.3, 208.9, 209.3] },
      { id: "MSFT",  name: "Microsoft",               value:  388.50, change:  0.55, series: [383.2, 384.4, 385.5, 386.4, 387.2, 387.9, 388.5] },
      { id: "NVDA",  name: "Nvidia",                  value:  112.40, change:  2.14, series: [108.0, 108.8, 109.6, 110.4, 111.0, 111.8, 112.4] },
      { id: "GOOGL", name: "Alphabet (Google)",       value:  164.80, change:  0.48, series: [162.1, 162.6, 163.2, 163.7, 164.1, 164.5, 164.8] },
      { id: "AMZN",  name: "Amazon",                  value:  196.20, change:  0.92, series: [192.8, 193.4, 194.1, 194.8, 195.3, 195.8, 196.2] },
      { id: "META",  name: "Meta Platforms",          value:  584.60, change:  1.35, series: [576.0, 577.8, 579.4, 581.0, 582.4, 583.6, 584.6] },
      { id: "TSLA",  name: "Tesla",                   value:  248.05, change: -1.82, series: [253.2, 252.4, 251.6, 250.8, 250.1, 249.1, 248.0] },
      { id: "BRK",   name: "Berkshire Hathaway",      value:  490.20, change:  0.22, series: [488.4, 488.7, 489.1, 489.4, 489.7, 490.0, 490.2] },
      { id: "JPM",   name: "JPMorgan Chase",          value:  238.80, change:  0.64, series: [235.8, 236.3, 236.9, 237.4, 237.9, 238.4, 238.8] },
      { id: "GS",    name: "Goldman Sachs",           value:  542.30, change:  0.88, series: [536.0, 537.4, 538.8, 539.9, 540.9, 541.7, 542.3] },
      { id: "BAC",   name: "Bank of America",         value:   42.42, change:  0.55, series: [41.8, 41.9, 42.0, 42.1, 42.2, 42.3, 42.42] },
      { id: "V",     name: "Visa",                    value:  348.50, change:  0.32, series: [346.2, 346.7, 347.2, 347.6, 348.0, 348.3, 348.5] },
      { id: "NFLX",  name: "Netflix",                 value:  968.80, change:  1.10, series: [958.0, 960.0, 962.0, 963.5, 965.0, 967.0, 968.8] },
      { id: "AMD",   name: "AMD",                     value:  101.40, change:  1.68, series: [97.2, 98.2, 99.2, 100.1, 100.9, 101.2, 101.4] },
      { id: "INTC",  name: "Intel",                   value:   22.85, change: -0.65, series: [23.4, 23.3, 23.2, 23.1, 23.1, 23.0, 22.85] },
      { id: "XOM",   name: "ExxonMobil",              value:  108.60, change:  0.42, series: [107.1, 107.4, 107.8, 108.1, 108.3, 108.5, 108.6] },
    ],
    "EUROPE STOCKS": [
      { id: "SAP",   name: "SAP (DE)",                value:  248.20, change:  0.74, series: [245.4, 246.0, 246.6, 247.1, 247.5, 247.9, 248.2] },
      { id: "ASML",  name: "ASML (NL)",               value:  668.50, change:  1.20, series: [652.0, 656.0, 659.0, 662.0, 664.5, 666.5, 668.5] },
      { id: "LVMH",  name: "LVMH (FR)",               value:  548.40, change: -0.38, series: [554.0, 552.5, 551.0, 550.0, 549.2, 548.8, 548.4] },
      { id: "NESN",  name: "Nestle (CH)",              value:   82.50, change: -0.22, series: [83.2, 83.0, 82.8, 82.7, 82.7, 82.6, 82.5] },
      { id: "NOVN",  name: "Novartis (CH)",           value:   96.80, change:  0.32, series: [95.8, 96.0, 96.2, 96.4, 96.5, 96.7, 96.8] },
      { id: "SHELL", name: "Shell (UK)",              value:   28.18, change:  0.55, series: [27.7, 27.8, 27.9, 28.0, 28.1, 28.1, 28.18] },
      { id: "HSBA",  name: "HSBC (UK)",               value:   86.42, change:  0.28, series: [85.6, 85.8, 86.0, 86.1, 86.2, 86.3, 86.42] },
      { id: "SIE",   name: "Siemens (DE)",            value:  188.90, change:  0.62, series: [186.4, 187.0, 187.5, 188.0, 188.4, 188.7, 188.9] },
      { id: "ABI",   name: "AB InBev (BE)",           value:   58.30, change: -0.18, series: [58.8, 58.7, 58.6, 58.5, 58.5, 58.4, 58.3] },
      { id: "AIR",   name: "Airbus (FR)",             value:  172.80, change:  0.88, series: [170.0, 170.6, 171.2, 171.7, 172.1, 172.5, 172.8] },
      { id: "MC",    name: "Moet Hennessy (FR)",      value:  348.50, change:  0.45, series: [344.0, 345.0, 346.0, 346.8, 347.5, 348.1, 348.5] },
      { id: "BARC",  name: "Barclays (UK)",           value:   28.15, change:  1.05, series: [27.6, 27.7, 27.8, 27.9, 28.0, 28.1, 28.15] },
    ],
    "GCC STOCKS": [
      { id: "2222",  name: "Saudi Aramco",            value:   27.85, change:  0.40, series: [27.55, 27.60, 27.65, 27.70, 27.75, 27.80, 27.85] },
      { id: "1180",  name: "Al Rajhi Bank (SA)",      value:   87.20, change:  0.58, series: [86.20, 86.40, 86.60, 86.80, 86.95, 87.10, 87.20] },
      { id: "2010",  name: "SABIC (SA)",              value:   72.50, change: -0.14, series: [72.9, 72.8, 72.7, 72.7, 72.6, 72.6, 72.5] },
      { id: "FAB",   name: "First Abu Dhabi Bank",    value:   12.84, change:  0.31, series: [12.72, 12.74, 12.77, 12.79, 12.81, 12.83, 12.84] },
      { id: "EMAAR", name: "Emaar Properties (UAE)",  value:    9.12, change:  0.88, series: [8.98, 9.00, 9.03, 9.06, 9.08, 9.10, 9.12] },
      { id: "DIB",   name: "Dubai Islamic Bank",      value:    7.08, change:  0.57, series: [6.98, 7.00, 7.02, 7.04, 7.05, 7.07, 7.08] },
      { id: "QNBK",  name: "QNB Group (QA)",          value:   15.20, change:  0.26, series: [15.08, 15.10, 15.12, 15.14, 15.16, 15.18, 15.20] },
      { id: "BKME",  name: "Bank al-Etihad (JO)",     value:    1.42, change:  0.71, series: [1.39, 1.40, 1.40, 1.41, 1.41, 1.42, 1.42] },
      { id: "NBK",   name: "Natl Bank of Kuwait",     value:    0.92, change:  0.22, series: [0.91, 0.91, 0.91, 0.92, 0.92, 0.92, 0.92] },
      { id: "BKBH",  name: "Bank of Bahrain & Kuwait",value:    0.68, change:  0.15, series: [0.67, 0.67, 0.67, 0.68, 0.68, 0.68, 0.68] },
    ],
    "ASIA STOCKS": [
      { id: "7203",     name: "Toyota Motor (JP)",       value:  3248.00, change:  0.62, series: [3208, 3218, 3228, 3234, 3240, 3245, 3248] },
      { id: "6758",     name: "Sony Group (JP)",         value: 12450.00, change:  0.88, series: [12280, 12310, 12350, 12380, 12410, 12430, 12450] },
      { id: "9984",     name: "SoftBank (JP)",           value:  8840.00, change:  1.42, series: [8650, 8690, 8730, 8770, 8800, 8825, 8840] },
      { id: "005930",   name: "Samsung Electronics (KR)",value: 78400.00, change:  0.51, series: [77600, 77800, 77900, 78000, 78100, 78250, 78400] },
      { id: "000660",   name: "SK Hynix (KR)",           value: 196500.0, change:  1.85, series: [190000,191500,193000,194000,195000,196000,196500] },
      { id: "BABA",     name: "Alibaba (HK)",            value:   112.85, change: -0.80, series: [115.2, 114.9, 114.6, 114.4, 114.2, 113.5, 112.85] },
      { id: "700",      name: "Tencent (HK)",            value:   436.00, change:  0.55, series: [431.0, 432.0, 433.0, 434.0, 434.5, 435.2, 436.0] },
      { id: "RELIANCE", name: "Reliance Ind. (IN)",      value:  2948.00, change:  0.48, series: [2916, 2922, 2928, 2934, 2939, 2944, 2948] },
      { id: "TCS",      name: "TCS (IN)",                value:  3862.00, change:  0.35, series: [3830, 3836, 3843, 3849, 3854, 3858, 3862] },
      { id: "700HK",    name: "Meituan (HK)",            value:   148.50, change:  1.20, series: [145.8, 146.3, 146.9, 147.4, 147.8, 148.2, 148.5] },
      { id: "2318",     name: "Ping An Insurance (CN)",  value:    42.80, change: -0.46, series: [43.4, 43.3, 43.2, 43.1, 43.0, 42.9, 42.8] },
    ],
  },
  morocco: {
    "BANKS": [
      { id: "ATW", name: "Attijariwafa Bank",         value:  522.0, change:  0.91, series: [514, 515.5, 517.2, 518.9, 520.1, 521.2, 522.0] },
      { id: "BCP", name: "Banque Centrale Populaire", value:  291.4, change:  0.27, series: [287.9, 288.6, 289.1, 289.8, 290.3, 290.9, 291.4] },
      { id: "BOA", name: "Bank of Africa",            value:  198.5, change: -0.13, series: [199.8, 199.6, 199.4, 199.2, 199.0, 198.8, 198.5] },
      { id: "CIH", name: "CIH Bank",                  value:  340.0, change:  0.50, series: [336, 337, 338, 338.5, 339, 339.5, 340] },
    ],
    "TELECOM / UTILITIES": [
      { id: "IAM", name: "Maroc Telecom", value:  109.8, change: 0.64, series: [107.2, 107.9, 108.3, 108.7, 109.0, 109.4, 109.8] },
      { id: "TQM", name: "Taqa Morocco",  value: 1675.0, change: 0.41, series: [1650, 1656, 1661, 1665, 1669, 1672, 1675] },
    ],
    "INDUSTRY / MATERIALS": [
      { id: "LHM", name: "LafargeHolcim Maroc", value: 2185.0, change:  0.34, series: [2152, 2160, 2168, 2173, 2178, 2182, 2185] },
      { id: "MNG", name: "Managem",              value: 2260.0, change:  1.12, series: [2204, 2216, 2228, 2239, 2248, 2254, 2260] },
      { id: "OCP", name: "OCP Group",            value: 1980.0, change: -0.30, series: [1998, 1996, 1992, 1988, 1985, 1982, 1980] },
    ],
    "REAL ESTATE / INSURANCE": [
      { id: "ADH", name: "Addoha",         value:   38.50, change:  0.52, series: [37.8, 37.9, 38.0, 38.1, 38.3, 38.4, 38.5] },
      { id: "WAA", name: "Wafa Assurance", value: 4480.00, change: -0.18, series: [4498, 4494, 4492, 4489, 4487, 4483, 4480] },
      { id: "HPS", name: "HPS",            value: 6200.00, change:  0.84, series: [6098, 6120, 6138, 6155, 6170, 6184, 6200] },
    ],
  },
  bonds: {
    "MOROCCO BONDS": [
      { id: "MA-3M",  name: "Morocco 3-Month",   value: 2.95, change:  0.02, series: [2.92, 2.92, 2.93, 2.93, 2.94, 2.94, 2.95] },
      { id: "MA-6M",  name: "Morocco 6-Month",   value: 3.08, change:  0.01, series: [3.06, 3.06, 3.07, 3.07, 3.07, 3.08, 3.08] },
      { id: "MA-1Y",  name: "Morocco 1-Year",    value: 3.22, change:  0.03, series: [3.18, 3.18, 3.19, 3.20, 3.20, 3.21, 3.22] },
      { id: "MA-2Y",  name: "Morocco 2-Year",    value: 3.45, change:  0.02, series: [3.42, 3.42, 3.43, 3.43, 3.44, 3.44, 3.45] },
      { id: "MA-5Y",  name: "Morocco 5-Year",    value: 3.88, change:  0.04, series: [3.82, 3.83, 3.84, 3.85, 3.86, 3.87, 3.88] },
      { id: "MA-10Y", name: "Morocco 10-Year",   value: 4.24, change:  0.05, series: [4.18, 4.19, 4.20, 4.21, 4.22, 4.23, 4.24] },
      { id: "MA-15Y", name: "Morocco 15-Year",   value: 4.48, change:  0.03, series: [4.44, 4.44, 4.45, 4.46, 4.46, 4.47, 4.48] },
      { id: "MA-20Y", name: "Morocco 20-Year",   value: 4.62, change:  0.02, series: [4.59, 4.59, 4.60, 4.60, 4.61, 4.61, 4.62] },
      { id: "MA-30Y", name: "Morocco 30-Year",   value: 4.75, change:  0.01, series: [4.73, 4.73, 4.74, 4.74, 4.74, 4.75, 4.75] },
      { id: "MA-EUR", name: "Eurobond 2032",     value: 5.12, change:  0.08, series: [5.02, 5.04, 5.06, 5.07, 5.09, 5.11, 5.12] },
    ],
    "US / AMERICAS": [
      { id: "US-1M",  name: "US 1-Month T-Bill",  value: 4.32, change: -0.02, series: [4.35, 4.34, 4.34, 4.33, 4.33, 4.32, 4.32] },
      { id: "US-3M",  name: "US 3-Month T-Bill",  value: 4.28, change: -0.01, series: [4.30, 4.30, 4.29, 4.29, 4.29, 4.28, 4.28] },
      { id: "US-6M",  name: "US 6-Month T-Bill",  value: 4.18, change: -0.03, series: [4.22, 4.21, 4.21, 4.20, 4.19, 4.19, 4.18] },
      { id: "US-2Y",  name: "US 2-Year",          value: 3.98, change: -0.04, series: [4.03, 4.02, 4.01, 4.00, 4.00, 3.99, 3.98] },
      { id: "US-5Y",  name: "US 5-Year",          value: 3.98, change: -0.02, series: [4.02, 4.01, 4.00, 4.00, 3.99, 3.99, 3.98] },
      { id: "US-10Y", name: "US 10-Year",         value: 4.30, change:  0.03, series: [4.26, 4.27, 4.28, 4.28, 4.29, 4.30, 4.30] },
      { id: "US-30Y", name: "US 30-Year",         value: 4.62, change:  0.04, series: [4.57, 4.58, 4.59, 4.60, 4.60, 4.61, 4.62] },
      { id: "CA-10Y", name: "Canada 10-Year",     value: 3.14, change:  0.02, series: [3.11, 3.11, 3.12, 3.12, 3.13, 3.13, 3.14] },
      { id: "BR-10Y", name: "Brazil 10-Year",     value: 13.48, change:  0.12, series: [13.32, 13.35, 13.38, 13.41, 13.43, 13.46, 13.48] },
      { id: "MX-10Y", name: "Mexico 10-Year",     value: 9.82, change:  0.08, series: [9.72, 9.74, 9.76, 9.78, 9.79, 9.81, 9.82] },
    ],
    "EUROPE": [
      { id: "DE-2Y",  name: "Germany 2-Year",     value:  2.12, change: -0.03, series: [2.16, 2.15, 2.15, 2.14, 2.13, 2.13, 2.12] },
      { id: "DE-10Y", name: "Germany 10-Year",    value:  2.52, change:  0.02, series: [2.49, 2.49, 2.50, 2.50, 2.51, 2.51, 2.52] },
      { id: "FR-10Y", name: "France 10-Year",     value:  3.08, change:  0.03, series: [3.04, 3.05, 3.05, 3.06, 3.07, 3.07, 3.08] },
      { id: "GB-10Y", name: "UK 10-Year",         value:  4.62, change:  0.04, series: [4.57, 4.58, 4.59, 4.60, 4.60, 4.61, 4.62] },
      { id: "IT-10Y", name: "Italy 10-Year",      value:  3.68, change:  0.05, series: [3.62, 3.63, 3.64, 3.65, 3.66, 3.67, 3.68] },
      { id: "ES-10Y", name: "Spain 10-Year",      value:  3.22, change:  0.03, series: [3.18, 3.19, 3.19, 3.20, 3.21, 3.21, 3.22] },
      { id: "PT-10Y", name: "Portugal 10-Year",   value:  2.98, change:  0.02, series: [2.95, 2.95, 2.96, 2.96, 2.97, 2.97, 2.98] },
      { id: "CH-10Y", name: "Switzerland 10-Year",value:  0.62, change: -0.01, series: [0.64, 0.63, 0.63, 0.63, 0.63, 0.62, 0.62] },
      { id: "SE-10Y", name: "Sweden 10-Year",     value:  2.28, change:  0.01, series: [2.26, 2.26, 2.27, 2.27, 2.27, 2.28, 2.28] },
      { id: "TR-10Y", name: "Turkey 10-Year",     value: 28.42, change:  0.35, series: [28.0, 28.1, 28.2, 28.25, 28.3, 28.38, 28.42] },
    ],
    "MENA / AFRICA": [
      { id: "SA-10Y", name: "Saudi Arabia 10-Year",value:  4.82, change:  0.06, series: [4.75, 4.76, 4.77, 4.78, 4.79, 4.81, 4.82] },
      { id: "AE-10Y", name: "UAE 10-Year",         value:  4.62, change:  0.04, series: [4.57, 4.58, 4.59, 4.60, 4.60, 4.61, 4.62] },
      { id: "QA-10Y", name: "Qatar 10-Year",       value:  4.42, change:  0.03, series: [4.38, 4.39, 4.39, 4.40, 4.41, 4.41, 4.42] },
      { id: "KW-10Y", name: "Kuwait 10-Year",      value:  3.82, change:  0.02, series: [3.79, 3.79, 3.80, 3.80, 3.81, 3.81, 3.82] },
      { id: "EG-10Y", name: "Egypt 10-Year",       value: 27.48, change:  0.22, series: [27.1, 27.2, 27.2, 27.3, 27.35, 27.42, 27.48] },
      { id: "TN-10Y", name: "Tunisia 10-Year",     value:  9.12, change:  0.08, series: [9.02, 9.04, 9.06, 9.07, 9.09, 9.11, 9.12] },
      { id: "ZA-10Y", name: "South Africa 10-Year",value:  9.42, change:  0.10, series: [9.30, 9.32, 9.34, 9.36, 9.38, 9.40, 9.42] },
      { id: "NG-10Y", name: "Nigeria 10-Year",     value: 18.82, change:  0.15, series: [18.60, 18.65, 18.68, 18.72, 18.76, 18.79, 18.82] },
    ],
    "ASIA / PACIFIC": [
      { id: "JP-10Y", name: "Japan 10-Year",       value:  1.52, change:  0.04, series: [1.47, 1.48, 1.49, 1.49, 1.50, 1.51, 1.52] },
      { id: "CN-10Y", name: "China 10-Year",       value:  1.82, change: -0.02, series: [1.85, 1.84, 1.84, 1.83, 1.83, 1.83, 1.82] },
      { id: "AU-10Y", name: "Australia 10-Year",   value:  4.42, change:  0.03, series: [4.38, 4.39, 4.39, 4.40, 4.41, 4.41, 4.42] },
      { id: "IN-10Y", name: "India 10-Year",       value:  6.72, change:  0.02, series: [6.69, 6.69, 6.70, 6.70, 6.71, 6.71, 6.72] },
      { id: "KR-10Y", name: "South Korea 10-Year", value:  2.82, change:  0.01, series: [2.80, 2.80, 2.81, 2.81, 2.81, 2.82, 2.82] },
      { id: "SG-10Y", name: "Singapore 10-Year",   value:  3.02, change:  0.02, series: [2.99, 2.99, 3.00, 3.00, 3.01, 3.01, 3.02] },
    ],
  },
  commodities: {
    "COMMODITIES": [
      { id: "GOLD",      name: "Gold ($/oz)",          value: 2985.50, change:  0.42, series: [2950, 2958, 2965, 2970, 2975, 2980, 2985.5] },
      { id: "SILVER",    name: "Silver ($/oz)",        value:   33.85, change:  1.10, series: [33.1, 33.2, 33.4, 33.5, 33.6, 33.7, 33.85] },
      { id: "PLATINUM",  name: "Platinum ($/oz)",      value:  968.00, change: -0.35, series: [978, 976, 974, 973, 972, 970, 968] },
      { id: "PALLADIUM", name: "Palladium ($/oz)",     value:  958.00, change: -0.82, series: [980, 976, 972, 970, 968, 964, 958] },
      { id: "COPPER",    name: "Copper ($/lb)",        value:    4.88, change:  0.96, series: [4.76, 4.78, 4.80, 4.82, 4.84, 4.86, 4.88] },
      { id: "ALUMINUM",  name: "Aluminum ($/t)",       value: 2448.00, change:  0.55, series: [2410, 2418, 2426, 2432, 2438, 2444, 2448] },
      { id: "ZINC",      name: "Zinc ($/t)",           value: 2780.00, change:  0.30, series: [2750, 2756, 2762, 2768, 2773, 2777, 2780] },
      { id: "NICKEL",    name: "Nickel ($/t)",         value: 15820.0, change: -0.48, series: [16020, 15980, 15940, 15910, 15880, 15860, 15820] },
      { id: "LEAD",      name: "Lead ($/t)",           value: 1980.00, change:  0.22, series: [1962, 1966, 1970, 1973, 1976, 1978, 1980] },
      { id: "IRON",      name: "Iron Ore ($/t)",       value:   98.50, change: -0.64, series: [101, 100.5, 100, 99.5, 99, 98.7, 98.5] },
      { id: "PHOSPHATE", name: "Phosphate (MA, $/t)",  value:  360.00, change: -0.28, series: [363, 362, 362, 361, 361, 360, 360] },
      { id: "BRENT",     name: "Brent Crude ($/bbl)",  value:   70.44, change:  0.74, series: [68.9, 69.1, 69.5, 69.8, 70.0, 70.2, 70.44] },
      { id: "WTI",       name: "WTI Crude ($/bbl)",    value:   67.91, change:  0.63, series: [66.5, 66.8, 67.0, 67.3, 67.5, 67.7, 67.91] },
      { id: "NGAS",      name: "Nat. Gas ($/MMBtu)",   value:    4.14, change: -1.38, series: [4.24, 4.22, 4.20, 4.18, 4.17, 4.16, 4.14] },
      { id: "HEATING",   name: "Heating Oil ($/gal)",  value:    2.38, change:  0.50, series: [2.34, 2.35, 2.36, 2.36, 2.37, 2.37, 2.38] },
      { id: "RBOB",      name: "RBOB Gasoline ($/gal)",value:    2.62, change:  0.85, series: [2.55, 2.57, 2.58, 2.59, 2.60, 2.61, 2.62] },
      { id: "COAL",      name: "Coal ($/t)",           value:  125.00, change: -0.44, series: [127, 126.5, 126, 126, 125.5, 125.2, 125] },
      { id: "WHEAT",     name: "Wheat ($/bu)",         value:  535.50, change: -0.55, series: [541, 540, 539, 538, 537, 536, 535.5] },
      { id: "CORN",      name: "Corn ($/bu)",          value:  462.25, change: -0.40, series: [466, 465, 464, 464, 463, 463, 462.25] },
      { id: "SOYBEAN",   name: "Soybeans ($/bu)",      value: 1002.00, change: -0.72, series: [1018, 1015, 1012, 1009, 1007, 1004, 1002] },
      { id: "RICE",      name: "Rough Rice ($/cwt)",   value:   14.85, change:  0.28, series: [14.68, 14.71, 14.74, 14.77, 14.80, 14.82, 14.85] },
      { id: "SUGAR",     name: "Sugar #11 (c/lb)",     value:   18.45, change:  0.65, series: [18.0, 18.1, 18.2, 18.3, 18.35, 18.4, 18.45] },
      { id: "COFFEE",    name: "Coffee Arabica ($/lb)",value:  328.50, change:  1.20, series: [322, 323, 325, 326, 327, 328, 328.5] },
      { id: "COCOA",     name: "Cocoa ($/t)",          value: 8420.00, change:  2.15, series: [8020, 8120, 8200, 8280, 8340, 8390, 8420] },
      { id: "COTTON",    name: "Cotton #2 (c/lb)",     value:   66.30, change: -0.38, series: [67.2, 67.0, 66.8, 66.7, 66.6, 66.4, 66.3] },
      { id: "LUMBER",    name: "Lumber ($/1000 bd ft)",value:  548.00, change:  0.92, series: [532, 536, 540, 543, 545, 546, 548] },
      { id: "OJ",        name: "Orange Juice (c/lb)",  value:  292.00, change:  1.45, series: [278, 281, 284, 287, 289, 291, 292] },
    ],
  },
};

// ─── INSTRUMENT CONFIGS ───────────────────────────────────────────────────────
const FX_CONFIGS = [
  { symbol: "USDMAD.FOREX", id: "USD/MAD", name: "US Dollar" },
  { symbol: "EURMAD.FOREX", id: "EUR/MAD", name: "Euro" },
  { symbol: "GBPMAD.FOREX", id: "GBP/MAD", name: "British Pound" },
  { symbol: "CHFMAD.FOREX", id: "CHF/MAD", name: "Swiss Franc" },
  { symbol: "CADMAD.FOREX", id: "CAD/MAD", name: "Canadian Dollar" },
  { symbol: "AUDMAD.FOREX", id: "AUD/MAD", name: "Australian Dollar" },
  { symbol: "JPYMAD.FOREX", id: "JPY/MAD", name: "100 Japanese Yen" },
  { symbol: "CNYMAD.FOREX", id: "CNY/MAD", name: "Chinese Yuan" },
  { symbol: "NOKMAD.FOREX", id: "NOK/MAD", name: "Norwegian Krone" },
  { symbol: "SEKMAD.FOREX", id: "SEK/MAD", name: "Swedish Krona" },
  { symbol: "DKKMAD.FOREX", id: "DKK/MAD", name: "Danish Krone" },
  { symbol: "SARMAD.FOREX", id: "SAR/MAD", name: "Saudi Riyal" },
  { symbol: "AEDMAD.FOREX", id: "AED/MAD", name: "UAE Dirham" },
  { symbol: "KWDMAD.FOREX", id: "KWD/MAD", name: "Kuwaiti Dinar" },
  { symbol: "QARMAD.FOREX", id: "QAR/MAD", name: "Qatari Riyal" },
  { symbol: "BHDMAD.FOREX", id: "BHD/MAD", name: "Bahraini Dinar" },
  { symbol: "OMRMAD.FOREX", id: "OMR/MAD", name: "Omani Rial" },
  { symbol: "JODMAD.FOREX", id: "JOD/MAD", name: "Jordanian Dinar" },
  { symbol: "TRYMAD.FOREX", id: "TRY/MAD", name: "Turkish Lira" },
  { symbol: "EGPMAD.FOREX", id: "EGP/MAD", name: "Egyptian Pound" },
  { symbol: "TNDMAD.FOREX", id: "TND/MAD", name: "Tunisian Dinar" },
  { symbol: "INRMAD.FOREX", id: "INR/MAD", name: "Indian Rupee" },
  { symbol: "BRLMAD.FOREX", id: "BRL/MAD", name: "Brazilian Real" },
  { symbol: "ZARMAD.FOREX", id: "ZAR/MAD", name: "South African Rand" },
];

const CRYPTO_CONFIGS = [
  { exchange: "binance", pair: "BTC-USDT",  id: "BTC",  name: "Bitcoin" },
  { exchange: "binance", pair: "ETH-USDT",  id: "ETH",  name: "Ethereum" },
  { exchange: "binance", pair: "SOL-USDT",  id: "SOL",  name: "Solana" },
  { exchange: "binance", pair: "BNB-USDT",  id: "BNB",  name: "BNB" },
  { exchange: "binance", pair: "XRP-USDT",  id: "XRP",  name: "XRP" },
  { exchange: "binance", pair: "ADA-USDT",  id: "ADA",  name: "Cardano" },
  { exchange: "binance", pair: "DOGE-USDT", id: "DOGE", name: "Dogecoin" },
  { exchange: "binance", pair: "AVAX-USDT", id: "AVAX", name: "Avalanche" },
  { exchange: "binance", pair: "LINK-USDT", id: "LINK", name: "Chainlink" },
  { exchange: "binance", pair: "DOT-USDT",  id: "DOT",  name: "Polkadot" },
  { exchange: "binance", pair: "UNI-USDT",  id: "UNI",  name: "Uniswap" },
  { exchange: "binance", pair: "SHIB-USDT", id: "SHIB", name: "Shiba Inu" },
  { exchange: "binance", pair: "ARB-USDT",  id: "ARB",  name: "Arbitrum" },
  { exchange: "binance", pair: "OP-USDT",   id: "OP",   name: "Optimism" },
  { exchange: "binance", pair: "SUI-USDT",  id: "SUI",  name: "Sui" },
  { exchange: "binance", pair: "NEAR-USDT", id: "NEAR", name: "NEAR Protocol" },
];

const COMMODITY_CONFIGS = [
  { symbol: "GC=F.COMM",  id: "GOLD",      name: "Gold ($/oz)" },
  { symbol: "SI=F.COMM",  id: "SILVER",    name: "Silver ($/oz)" },
  { symbol: "PL=F.COMM",  id: "PLATINUM",  name: "Platinum ($/oz)" },
  { symbol: "PA=F.COMM",  id: "PALLADIUM", name: "Palladium ($/oz)" },
  { symbol: "HG=F.COMM",  id: "COPPER",    name: "Copper ($/lb)" },
  { symbol: "ALI=F.COMM", id: "ALUMINUM",  name: "Aluminum ($/t)" },
  { symbol: "BZ=F.COMM",  id: "BRENT",     name: "Brent Crude ($/bbl)" },
  { symbol: "CL=F.COMM",  id: "WTI",       name: "WTI Crude ($/bbl)" },
  { symbol: "NG=F.COMM",  id: "NGAS",      name: "Nat. Gas ($/MMBtu)" },
  { symbol: "W=F.COMM",   id: "WHEAT",     name: "Wheat ($/bu)" },
  { symbol: "C=F.COMM",   id: "CORN",      name: "Corn ($/bu)" },
  { symbol: "S=F.COMM",   id: "SOYBEAN",   name: "Soybeans ($/bu)" },
  { symbol: "SB=F.COMM",  id: "SUGAR",     name: "Sugar #11 (c/lb)" },
  { symbol: "KC=F.COMM",  id: "COFFEE",    name: "Coffee Arabica ($/lb)" },
  { symbol: "CC=F.COMM",  id: "COCOA",     name: "Cocoa ($/t)" },
  { symbol: "CT=F.COMM",  id: "COTTON",    name: "Cotton #2 (c/lb)" },
];

// FIX #3 + #6: VALID_TABS as a Set (O(1) lookup). Input echoed back only as
// the static join of VALID_TABS keys, never the raw user string.
const VALID_TABS = new Set(["overview", "currencies", "crypto", "indices", "morocco", "bonds", "commodities"]);

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

// FIX SEC-5: Deterministic series — seed noise from price value so the same
// input always produces the same sparkline. Math.random() was making cached
// responses return different charts on each cache miss, and making static
// fallback data appear falsely "live" by jittering on every request.
function seededNoise(seed, i) {
  // Simple deterministic hash: combine seed + index into a stable float in (-0.5, 0.5)
  const x = Math.sin(seed * 9301 + i * 49297 + 233) * 10000;
  return (x - Math.floor(x)) - 0.5;
}

// FIX #12: toFixed(8) preserves micro-cap precision (SHIB, PEPE, BONK etc.)
function makeSeries(value, pct) {
  const v = Number(value);
  if (!Number.isFinite(v) || v === 0) return [0, 0, 0, 0, 0, 0, 0];
  const p    = Number(pct || 0) / 100;
  const v0   = v / (1 + p || 1);
  const seed = Math.abs(Math.round(v * 1000) % 9999) || 1;
  const pts  = [];
  for (let i = 0; i < 7; i++) {
    const t     = i / 6;
    const noise = seededNoise(seed, i) * 0.004 * v;
    pts.push(Number((v0 + (v - v0) * t + noise).toFixed(8)));
  }
  pts[6] = v;
  return pts;
}

function ensureSeries(items) {
  return (items || []).map(item => ({
    ...item,
    series: Array.isArray(item.series) && item.series.length >= 2
      ? item.series
      : makeSeries(item.value, item.change),
  }));
}

function buildFbMap(items) {
  const map = {};
  (items || []).forEach(item => { if (item?.id) map[item.id] = item; });
  return map;
}

// ─── EODHD ────────────────────────────────────────────────────────────────────

async function fetchEODHD(symbol, apiKey) {
  const url =
    `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}` +
    `?api_token=${encodeURIComponent(apiKey)}` +
    `&fmt=json&from=${daysAgo(20)}&order=a`;

  const r = await fetchWithTimeout(url, {}, 6000);
  if (!r.ok) throw new Error(`EODHD ${symbol} HTTP ${r.status}`);

  const json = await r.json();

  // FIX: Handle market holidays — EODHD returns empty array on non-trading days.
  // Return null instead of throwing, so caller falls back to static gracefully.
  if (!Array.isArray(json) || json.length < 2) return null;

  const closes = json.map(row => Number(row?.close)).filter(Number.isFinite);
  if (closes.length < 2) return null;

  const series = closes.slice(-7);
  const last   = series[series.length - 1];
  const prev   = series[series.length - 2] ?? last;
  const change = prev ? ((last - prev) / prev) * 100 : 0;
  return { value: last, change: Number(change.toFixed(2)), series };
}

async function buildEODHDItems(configs, fallbackItems, apiKey) {
  if (!apiKey) return ensureSeries(fallbackItems || []);

  const fbMap   = buildFbMap(fallbackItems);
  const results = await Promise.allSettled(configs.map(cfg => fetchEODHD(cfg.symbol, apiKey)));

  return results.map((r, i) => {
    const cfg = configs[i];
    const fb  = fbMap[cfg.id] || null;
    if (r.status === "fulfilled" && r.value !== null) {
      // Preserve symbol field from fallback if present
      return { id: cfg.id, name: cfg.name, ...(fb?.symbol ? { symbol: fb.symbol } : {}), ...r.value };
    }
    if (r.status === "rejected") {
      console.warn(`[market] EODHD fallback for ${cfg.id}:`, r.reason?.message);
    }
    return fb ? ensureSeries([fb])[0] : null;
  }).filter(Boolean);
}

// ─── LUZIA CRYPTO ─────────────────────────────────────────────────────────────

async function fetchLuzia(exchange, pair, apiKey) {
  const r = await fetchWithTimeout(
    `https://api.luzia.dev/v1/ticker/${exchange}/${pair}`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
    6000
  );
  if (!r.ok) throw new Error(`Luzia ${pair} HTTP ${r.status}`);
  return r.json();
}

async function buildCryptoItems(configs, fallbackItems, apiKey) {
  if (!apiKey) return ensureSeries(fallbackItems || []);

  const fbMap   = buildFbMap(fallbackItems);
  const results = await Promise.allSettled(configs.map(cfg => fetchLuzia(cfg.exchange, cfg.pair, apiKey)));

  return results.map((r, i) => {
    const cfg = configs[i];
    const fb  = fbMap[cfg.id] || null;
    if (r.status === "fulfilled") {
      const json = r.value;
      const last = Number(json?.last ?? json?.price ?? json?.lastPrice ?? json?.data?.last ?? json?.data?.price);
      const chg  = Number(json?.changePercent ?? json?.change_pct ?? json?.percentChange ?? json?.data?.changePercent ?? 0);
      if (Number.isFinite(last) && last > 0) {
        return { id: cfg.id, name: cfg.name, ...(fb?.symbol ? { symbol: fb.symbol } : {}), value: last, change: Number(chg.toFixed(2)), series: makeSeries(last, chg) };
      }
    }
    console.warn(`[market] Luzia fallback for ${cfg.id}`);
    return fb ? ensureSeries([fb])[0] : null;
  }).filter(Boolean);
}

// ─── DRAHMI MOROCCO ───────────────────────────────────────────────────────────

function categorize(items) {
  const out = { "BANKS": [], "TELECOM / UTILITIES": [], "INDUSTRY / MATERIALS": [], "REAL ESTATE / INSURANCE": [], "OTHER": [] };
  const rules = [
    [/bank|banque|attijari|cr[eé]dit|cih|bcp|boa/i, "BANKS"],
    [/telecom|taqa|lydec|redal/i,                   "TELECOM / UTILITIES"],
    [/lafarge|holcim|managem|cosumar|ocp|ciment/i,  "INDUSTRY / MATERIALS"],
    [/addoha|assurance|insurance|immobil|realty/i,  "REAL ESTATE / INSURANCE"],
  ];
  for (const item of items) {
    const txt    = `${item.id} ${item.name}`;
    const bucket = rules.find(([rx]) => rx.test(txt));
    out[bucket ? bucket[1] : "OTHER"].push(item);
  }
  if (!out["OTHER"].length) delete out["OTHER"];
  return out;
}

async function fetchMoroccoStocks(apiKey) {
  if (!apiKey) return STATIC.morocco;
  try {
    const r = await fetchWithTimeout(
      "https://api.drahmi.app/api/v1/stocks?limit=100",
      { headers: { "X-API-Key": apiKey } },
      8000
    );
    if (!r.ok) throw new Error(`Drahmi HTTP ${r.status}`);
    const json = await r.json();
    const raw  = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : Array.isArray(json?.stocks) ? json.stocks : [];
    const mapped = raw.map((row, idx) => {
      const id    = String(row?.symbol || row?.ticker || row?.code || `MA${idx + 1}`);
      const name  = String(row?.name || row?.company_name || row?.label || id);
      const price = Number(row?.price ?? row?.last ?? row?.close ?? row?.last_price);
      const pct   = Number(row?.change_percent ?? row?.percent_change ?? row?.variation_percent ?? row?.changePct ?? 0);
      if (!Number.isFinite(price) || price <= 0) return null;
      return { id, name, value: price, change: Number(pct.toFixed(2)), series: makeSeries(price, pct) };
    }).filter(Boolean);
    if (!mapped.length) throw new Error("Drahmi returned 0 valid stocks");
    return categorize(mapped);
  } catch (err) {
    console.warn("[market] Drahmi fallback:", err.message);
    return STATIC.morocco;
  }
}



// ─── HANDLER ──────────────────────────────────────────────────────────────────


// ─── NETLIFY FUNCTION HANDLER ─────────────────────────────────────────────────
// Converted from Vercel (req/res) → Netlify (event/context) format.
// File must live at: netlify/functions/market.js
// API route will be:  /.netlify/functions/market?tab=overview
// (or /api/market if you add a redirect in netlify.toml)


// ─── CLOUDFLARE PAGES FUNCTION ────────────────────────────────────────────────
export async function onRequest({ request, env }) {
  // Build a Netlify-compatible event
  const url    = new URL(request.url);
  const qs     = {};
  url.searchParams.forEach((v,k) => { qs[k] = v; });

  const res = await handle({
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    queryStringParameters: qs,
  }, env);

  return new Response(res.body, {
    status: res.statusCode,
    headers: res.headers || {},
  });
}

async function handle(event, env) {

  // CORS
  const allowedOrigin = env.ALLOWED_ORIGIN || "";
  const requestOrigin = event.headers["origin"] || "";
  const corsOrigin    = allowedOrigin
    ? (requestOrigin === allowedOrigin ? allowedOrigin : allowedOrigin)
    : "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin":  corsOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };

  // OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  // Only GET
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const tab = String(event.queryStringParameters?.tab || "overview").trim();

  if (!VALID_TABS.has(tab)) {
    return { statusCode: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Unknown tab. Valid: " + [...VALID_TABS].join(", ") }) };
  }

  const eodhdKey  = env.EODHD_API_KEY  || "";
  const drahmiKey = env.DRAHMI_API_KEY || "";
  const luziaKey  = env.LUZIA_API_KEY  || "";

  try {
    const withDeadline = (promise, fallback) =>
      Promise.race([promise, new Promise(resolve => setTimeout(() => resolve({ __timeout: true, fallback }), 9000))]);

    const [fxR, cryptoR, moroccoR, commodityR] = await Promise.allSettled([
      withDeadline(buildEODHDItems(FX_CONFIGS,        STATIC.currencies["FX / MAD"],    eodhdKey), ensureSeries(STATIC.currencies["FX / MAD"])),
      withDeadline(buildCryptoItems(CRYPTO_CONFIGS,   STATIC.crypto["LARGE CAP"],        luziaKey), ensureSeries(STATIC.crypto["LARGE CAP"])),
      withDeadline(fetchMoroccoStocks(drahmiKey),      STATIC.morocco),
      withDeadline(buildEODHDItems(COMMODITY_CONFIGS, STATIC.commodities["COMMODITIES"], eodhdKey), ensureSeries(STATIC.commodities["COMMODITIES"])),
    ]);

    [fxR, cryptoR, moroccoR, commodityR].forEach((r, i) => {
      if (r.status === "rejected") console.error(`[market] top-level fetch #${i} failed:`, r.reason?.message);
    });

    function unwrap(r, fallback) {
      if (r.status === "rejected") return fallback;
      const v = r.value;
      if (v && v.__timeout) { console.warn("[market] fetch timed out, using static fallback"); return v.fallback; }
      return v;
    }

    const fxItems        = unwrap(fxR,        ensureSeries(STATIC.currencies["FX / MAD"]));
    const cryptoItems    = unwrap(cryptoR,     ensureSeries(STATIC.crypto["LARGE CAP"]));
    const moroccoData    = unwrap(moroccoR,    STATIC.morocco);
    const commodityItems = unwrap(commodityR,  ensureSeries(STATIC.commodities["COMMODITIES"]));

    const payload = {
      overview: {
        "FEATURED MARKET BOXES": ensureSeries([
          ...fxItems.slice(0, 2),
          ...cryptoItems.slice(0, 1),
          ...STATIC.indices["GLOBAL INDICES"].slice(0, 1),
        ]),
        "GLOBAL INDICES":       ensureSeries(STATIC.indices["GLOBAL INDICES"]),
        "FX / MAD":             fxItems,
        "CRYPTO":               cryptoItems,
        "BANKS":                moroccoData["BANKS"]                || [],
        "TELECOM / UTILITIES":  moroccoData["TELECOM / UTILITIES"]  || [],
        "INDUSTRY / MATERIALS": moroccoData["INDUSTRY / MATERIALS"] || [],
        "RATES / BONDS":        ensureSeries(STATIC.bonds["MOROCCO BONDS"]),
      },
      currencies: { "FX / MAD": fxItems },
      crypto: {
        "LARGE CAP":       cryptoItems.length ? cryptoItems : ensureSeries(STATIC.crypto["LARGE CAP"]),
        "DEFI / LAYER2":   ensureSeries(STATIC.crypto["DEFI / LAYER2"]),
        "MEME / TRENDING": ensureSeries(STATIC.crypto["MEME / TRENDING"]),
        "STABLECOINS":     ensureSeries(STATIC.crypto["STABLECOINS"]),
        "LAYER1 / INFRA":  ensureSeries(STATIC.crypto["LAYER1 / INFRA"]),
      },
      indices: {
        "GLOBAL INDICES": ensureSeries(STATIC.indices["GLOBAL INDICES"]),
        "USA STOCKS":     ensureSeries(STATIC.indices["USA STOCKS"]),
        "EUROPE STOCKS":  ensureSeries(STATIC.indices["EUROPE STOCKS"]),
        "GCC STOCKS":     ensureSeries(STATIC.indices["GCC STOCKS"]),
        "ASIA STOCKS":    ensureSeries(STATIC.indices["ASIA STOCKS"]),
      },
      morocco: moroccoData,
      bonds: {
        "MOROCCO BONDS":  ensureSeries(STATIC.bonds["MOROCCO BONDS"]),
        "US / AMERICAS":  ensureSeries(STATIC.bonds["US / AMERICAS"]),
        "EUROPE":         ensureSeries(STATIC.bonds["EUROPE"]),
        "MENA / AFRICA":  ensureSeries(STATIC.bonds["MENA / AFRICA"]),
        "ASIA / PACIFIC": ensureSeries(STATIC.bonds["ASIA / PACIFIC"]),
      },
      commodities: { "COMMODITIES": commodityItems },
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
      body: JSON.stringify(payload[tab]),
    };

  } catch (err) {
    console.error("[market] Unhandled error:", err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }

}

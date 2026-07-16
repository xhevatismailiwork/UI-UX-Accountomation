export const MONTHLY = [
  { m:"Jan", te_ardhura:1240000, shpenzime:890000 },
  { m:"Shk", te_ardhura:1560000, shpenzime:1020000 },
  { m:"Mar", te_ardhura:980000,  shpenzime:750000 },
  { m:"Pri", te_ardhura:2100000, shpenzime:1340000 },
  { m:"Maj", te_ardhura:1780000, shpenzime:1150000 },
  { m:"Qer", te_ardhura:2450000, shpenzime:1680000 },
];

export const CASHFLOW = [
  { data:"01 Qer", hyrje:320000,  dalje:145000, neto:175000 },
  { data:"05 Qer", hyrje:560000,  dalje:87500,  neto:472500 },
  { data:"10 Qer", hyrje:192000,  dalje:34200,  neto:157800 },
  { data:"15 Qer", hyrje:445000,  dalje:890000, neto:-445000 },
  { data:"19 Qer", hyrje:890000,  dalje:67800,  neto:822200 },
  { data:"22 Qer", hyrje:1240000, dalje:445000, neto:795000 },
];

export const CF_OPERATIVE = [
  { zeri:"Arkëtim nga klientët",            shuma:1250000, tip:"hyrje" as const },
  { zeri:"Pagesë furnitorëve",              shuma:-890000, tip:"dalje" as const },
  { zeri:"Pagesë rrogash dhe kontributesh", shuma:-186000, tip:"dalje" as const },
  { zeri:"Pagesë TVSH tek DAP",             shuma:-148000, tip:"dalje" as const },
  { zeri:"Të ardhura të tjera operative",   shuma:95000,   tip:"hyrje" as const },
];

export const CF_INVESTUESE = [
  { zeri:"Blerje pajisje zyre",             shuma:-340000, tip:"dalje" as const },
  { zeri:"Shitje aktivi i amortizuar",      shuma:120000,  tip:"hyrje" as const },
  { zeri:"Blerje kompjuter dhe harduer",    shuma:-85000,  tip:"dalje" as const },
];

export const CF_FINANCIARE = [
  { zeri:"Hua bankare e marrë",             shuma:500000,  tip:"hyrje" as const },
  { zeri:"Kthim i huasë bankare",           shuma:-210000, tip:"dalje" as const },
  { zeri:"Dividendë të paguar",             shuma:-80000,  tip:"dalje" as const },
];

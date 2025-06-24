
import { Promotion } from './promotion.model';
import { Vente } from './vente.model';

export interface Article {
  id: number;
  codeArticle: string;
  codeBarre: string;
  libelle: string;
  codeDim1: string;
  libelleDim1: string;
  codeDim2: string;
  libelleDim2: string;
  fournisseur: string;
  familleNiv1: string;
  familleNiv2: string;
  familleNiv3: string;
  familleNiv4: string;
  familleNiv5: string;
  familleNiv6: string;
  familleNiv7: string;
  familleNiv8: string;
  quantite_Achat: number;
  dateLibre: Date;
  prix_Vente_TND: number;
  prix_Achat_TND: number;
  idCategorie: string;
  categorie?: Categorie;
  promotions?: Promotion[];
  stocks?: Stock[];
  ventes?: Vente[];
}

export interface Categorie {
  idCategorie: string;
  nom: string;
  description: string;
  articles?: Article[];
}

export interface AIPrediction {
  current_price_tnd: number;
  promoted_price_tnd: number;
  adjusted_promotion_pct: number;
  volume_impact_pct: number;
  revenue_impact_tnd: number;
  projected_monthly_volume: number;
}

export interface Stock {
  id: number;
  quantitePhysique: number;
  stockMin: number;
  venteFFO: number;
  livreFou: number;
  transfert: number;
  annonceTrf: number;
  valeur_Stock_TND: number;
  articleId: number;
  article?: Article;
  depotId: number;
  depot?: Depot;
}

export interface Depot {
  id: number;
  code: string;
  libelle: string;
  typeDepot: string;
  etablissementId: number;
  etablissement?: Etablissement;
}

export interface Etablissement {
  id: number;
  code: string;
  libelle: string;
  adresse: string;
  ville: string;
  type: string;
  secteur: string;
  depots?: Depot[];
}

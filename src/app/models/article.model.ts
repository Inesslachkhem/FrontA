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
  quantite_Achat: string;
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

export interface Promotion {
  id: number;
  dateFin: Date;
  tauxReduction: number;
  codeArticle: string;
  article?: Article;
  prix_Vente_TND_Avant: number;
  prix_Vente_TND_Apres: number;
  isAccepted: boolean;
  dateCreation: Date;
  dateApproval?: Date;
  approvedBy?: string;
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
}

export interface Vente {
  id: number;
  quantiteVendue: number;
  montantTotal: number;
  dateVente: Date;
  articleId: number;
  article?: Article;
}

export interface Depot {
  id: number;
  code: string;
  libelle: string;
  typeDepot: string;
}

export interface Etablissement {
  id: number;
  code: string;
  libelle: string;
  adresse: string;
  ville: string;
  type: string;
  secteur: string;
}

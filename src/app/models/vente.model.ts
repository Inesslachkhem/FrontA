import { Article } from './article.model';

export interface Vente {
  id: number;
  date: Date;
  quantiteFacturee: number;
  numeroFacture: string;
  numLigne: string;
  prix_Vente_TND: number;
  cout_Unitaire_TND: number;
  ventes_Mensuelles_Unites: number;
  ca_Mensuel_TND: number;
  profit_Mensuel_TND: number;
  date_Derniere_Vente: Date;
  articleId: number;
  article?: Article;
}

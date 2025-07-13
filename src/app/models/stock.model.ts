import { Article } from './article.model';
import { Depot } from './depot.model';

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

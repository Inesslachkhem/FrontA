import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ArticleListComponent } from './pages/articles/article-list.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoryListComponent } from './pages/categories/category-list.component';
import { VentesComponent } from './pages/ventes/ventes.component';
import { VenteListComponent } from './pages/ventes/vente-list.component';
import { PromotionComponent } from './pages/promotion/promotion.component';
import { PromotionListComponent } from './pages/promotion/promotion-list.component';
import { StockComponent } from './pages/stock/stock.component';
import { StockListComponent } from './pages/stock/stock-list.component';
import { DepartmentComponent } from './pages/department/department.component';
import { EtablissementComponent } from './pages/etablissement/etablissement.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'articles', component: ArticleListComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'ventes', component: VenteListComponent },
      { path: 'promotion', component: PromotionListComponent },
      { path: 'stock', component: StockListComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'etablissement', component: EtablissementComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

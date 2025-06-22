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
import { LoginComponent } from './pages/auth/login.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { UserProfileComponent } from './pages/users/user-profile.component';
import { AuthGuard } from './guards/auth.guard';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'verify', component: VerifyCodeComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
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
      { path: 'users', component: UserManagementComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'admin/profile', component: UserProfileComponent },
      { path: 'admin/stats', component: DashboardComponent }, // Reuse dashboard for now
      { path: 'admin/settings', component: UserManagementComponent }, // Reuse user management for now
    ],
  },
  { path: '**', redirectTo: 'login' },
];

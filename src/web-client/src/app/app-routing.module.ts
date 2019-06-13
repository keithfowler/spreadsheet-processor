import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { AuthGuard } from './gaurds/auth-gaurd';
import { HomeComponent } from './home/home.component';
import { DataImportComponent } from './data-import/data-import.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'import', component: DataImportComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
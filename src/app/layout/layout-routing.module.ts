import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { ComedorGuard } from '../shared/guard/comedor.guard';
import { RolesGuard } from '../shared/guard/role.guard';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', canActivate: [RolesGuard] , pathMatch: 'prefix' },
            { path: 'voluntarios', loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate: [ComedorGuard] },
            { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
            { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
            { path: 'perfil', loadChildren: './form/form.module#FormModule', canActivate: [ComedorGuard] },
            { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
            { path: 'solicitudes', loadChildren: './grid/grid.module#GridModule' },
            { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
            { path: 'mis_solicitudes', loadChildren: './blank-page/blank-page.module#BlankPageModule' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}

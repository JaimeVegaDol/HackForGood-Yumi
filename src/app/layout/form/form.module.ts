import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormRoutingModule } from './form-routing.module';
import { FormComponent } from './form.component';
import { PageHeaderModule } from './../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        FormRoutingModule,
        PageHeaderModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule
    ],
    declarations: [FormComponent]
})
export class FormModule {}

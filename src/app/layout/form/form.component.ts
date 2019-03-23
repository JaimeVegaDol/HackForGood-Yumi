import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { tap, take, map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [routerTransition()]
})
export class FormComponent implements OnInit {
    comedorItem;
    comedorForm: FormGroup;
    desdeHora = { 'hour': 0, 'minute': 0, 'second': 0 };
    hastaHora = { 'hour': 23, 'minute': 59, 'second': 59 };
    userUuid: string;
    isSaved: boolean;

    readonly diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    constructor(
        private af: AngularFireAuth,
        private store: AngularFirestore,
        private formBuilder: FormBuilder,
        private ref: ChangeDetectorRef
    ) {
        this.af.auth.onAuthStateChanged(value => {
            this.userUuid = value.uid;
            this.store.collection('comedores').doc(value.uid).get().toPromise().then( doc => {
                const data = doc.data();
                const newData = {...doc.data()};
                delete newData.dias;
                this.comedorForm.patchValue(newData);

                if (data.dias.length) {
                    const formArray = this.comedorForm.get('dias') as FormArray;
                    data.dias.forEach(dia => {
                        formArray.push(new FormControl(dia));
                    });
                }

                if (!this.ref['destroyed']) {
                    this.ref.detectChanges();
                }
            }
            );
        });
    }

    ngOnInit() {


        this.comedorForm  =  this.formBuilder.group({
            name: ['', Validators.required],
            direccion: ['', Validators.required],
            telefono: [ '', Validators.required],
            web: ['', Validators.required],
            capacidad: ['', Validators.required],
            dias: new FormArray([]),
            desdeHora: [''],
            hastaHora: [''],
            email: ['']
        });
    }

    isChecked(value) {
        return this.comedorForm.value.dias.includes(value);
    }

    guardarPerfil() {
        const fromObj = this.comedorForm.value;
        Object.keys(fromObj).forEach((key) => (fromObj[key] == null) && delete fromObj[key]);
        this.store.collection('comedores').doc(this.userUuid).set(
            fromObj
        , { merge: true}).then(() => {
            this.isSaved = true;
            setTimeout(() => {
                this.isSaved = false;
            }, 3000);
        });
    }

    onCheckChange(event) {
        const formArray: FormArray = this.comedorForm.get('dias') as FormArray;

        /* Selected */
        if (event.target.checked) {
          // Add a new control in the arrayForm
          formArray.push(new FormControl(event.target.value));
        } else {
          // find the unselected element
          let i = 0;

          formArray.controls.forEach((ctrl: FormControl) => {
            if (ctrl.value === event.target.value) {
              // Remove the unselected element from the arrayForm
              formArray.removeAt(i);
              return;
            }

            i++;
          });
        }
      }
}

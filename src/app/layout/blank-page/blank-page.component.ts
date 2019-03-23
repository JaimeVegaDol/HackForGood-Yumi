import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { when } from 'q';
import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, map, take, filter } from 'rxjs/operators';
import { Observable, zip } from 'rxjs';

@Component({
    selector: 'app-blank-page',
    templateUrl: './blank-page.component.html',
    styleUrls: ['./blank-page.component.scss']
})
export class BlankPageComponent implements OnInit {
    userUid: string;


    misSolicitudes$;

    constructor(
        private store: AngularFirestore,
        auth: AngularFireAuth
    ) {
        auth.auth.onAuthStateChanged(value => {
            this.userUid = value.uid;
            this.setMisSolicitudes();
        });
    }

    setMisSolicitudes() {

        this.misSolicitudes$ = this.store.collection('mis_solicitudes',
            ref => ref.where('voluntario_id', '==', this.userUid)).valueChanges()
            .pipe(
            switchMap(
              solicitud => {
                return zip(...solicitud
                    .map((sol: any) => {
                    return this.store.collection('peticiones_voluntariado').doc(sol.solicitud_id).get()
                  .pipe(
                  map(response => {
                      const data = response.data();
                      if (data) {
                        this.store.collection('comedores').doc(data.comedor_id).get().subscribe(response => {
                            data.comedor = response.data();
                        });
                      }
                      return data;
                    }));
                }));
              }));
    }

    cancela() {
        alert('Estas seguro?');
    }

    ngOnInit() {
    }
}

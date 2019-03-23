import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { AngularFirestore } from 'angularfire2/firestore';
import { switchMap, map, take } from 'rxjs/operators';
import { zip } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    animations: [routerTransition()]
})
export class GridComponent implements OnInit {
    solicitudes = [];
    solicitudesIds = [];
    solicitudes$;
    constructor(
        private store: AngularFirestore,
        private authService: AuthService,
    ) {}

    doApuntarme(solicitud) {
        return this.store.collection('mis_solicitudes').add({
            solicitud_id: solicitud.id,
            voluntario_id: this.authService.uid
        }).then(() => {
            return this.store
                .collection('peticiones_voluntariado')
                .doc(solicitud.id)
                .update({
                    posicion: 'cerrada'
                });
        })
        .then(() => {
            this.setSolicitudes();
        });
    }

    setSolicitudes() {
        this.solicitudes$ = this.store.collection('peticiones_voluntariado').valueChanges().pipe(
            take(1),
            switchMap(
              solicitud => {
                return zip(...solicitud
                    .filter((sol: any) => sol.posicion === 'abierta')
                    .map((sol: any) => {
                    return this.store.collection('comedores').doc(sol.comedor_id).get()
                  .pipe(
                  map(movie => ({...sol, ...{comedor: movie.data()}})));
                }));
              }));
    }

    ngOnInit() {
        this.setSolicitudes();
    }
}

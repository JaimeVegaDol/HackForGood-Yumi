import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { take, tap, map } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    userUid: string;
    readonly customValues = {
        solicitudCocina: 0,
        solicitudAcompanantes: 0,
        solicitudServicio: 0
    };

    solicitudes = {
        cocina: [],
        acompanantes: [],
        servicio: []

    };

    values = { ...this.customValues };

    masVolSections = [
        {
            title: 'En cocina',
            icon: 'fa-cutlery',
            key: 'solicitudCocina',
            descripcion: 'Los voluntarios de cocina prepararán la comida.'
        },
        {
            title: 'Acompañantes',
            icon: 'fa-group',
            key: 'solicitudAcompanantes',
            descripcion: 'Los acompañantes disfrutarán comiendo con las personas sin recursos.'
        },
        {
            title: 'Servicio',
            icon: 'fa-leaf',
            key: 'solicitudServicio',
            descripcion: 'Los voluntarios de servicio servirán la comida y lo dejarán todo limpio.'
        }
    ];
    hoveredDate: NgbDate;
    fromDate: NgbDate;
    toDate: NgbDate;

    isSaved: boolean;

    enviandoSolicitudes = false;

    getCerrados(actividad) {
        return this.solicitudes[actividad].filter(sol => sol.posicion === 'cerrada').length;
    }

    setCurrentSolicitudes(actividad) {
        let act = actividad;
        if (actividad === 'acompanantes') {
            act = 'acompañantes';
        }
        this.store.collection('peticiones_voluntariado',
            ref => ref.where('comedor_id', '==', this.userUid).where('actividad', '==', act)).valueChanges()
            .pipe(
                take(1),
                map(response => {
                    this.solicitudes[actividad] = response;
                    if (!this.ref['destroyed']) {
                        this.ref.detectChanges();
                    }
                })
            ).subscribe();
    }

    constructor(
        calendar: NgbCalendar,
        private store: AngularFirestore,
        auth: AngularFireAuth,
        private ref: ChangeDetectorRef) {

        auth.auth.onAuthStateChanged(value => {
            this.userUid = value.uid;
            this.setCurrentSolicitudes('cocina');
            this.setCurrentSolicitudes('acompanantes');
            this.setCurrentSolicitudes('servicio');
        });

        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    }




    increment(key: string) {
        this.values[key] += 1;
    }

    decrement(key: string) {
        if (!(this.values[key] > 0)) {
            return;
        }
        this.values[key] -= 1;
    }

    ngOnInit() { }

    onDateSelection(date: NgbDate) {
        if (!this.fromDate && !this.toDate) {
            this.fromDate = date;
        } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
            this.toDate = date;
        } else {
            this.toDate = null;
            this.fromDate = date;
        }
    }

    isHovered(date: NgbDate) {
        return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
        return date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
        return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
    }

    guardarSolicitud(from, to, actividad) {
        return this.store.collection('peticiones_voluntariado').add({
            comedor_id: this.userUid,
            desde: new Date(from.year, from.month - 1, from.day).toISOString(),
            hasta: new Date(to.year, to.month, to.day).toISOString(),
            posicion: 'abierta',
            actividad,
            fecha_solicitud: new Date().toISOString()
        }).then(response => {
            return this.store.collection('peticiones_voluntariado').doc(response.id).update({
                id: response.id
            });
        });
    }

    enviarNumeroSolicitudesTipo(numero, tipo) {
        let counter = 0;
        while (counter !== numero) {
            this.guardarSolicitud(this.fromDate, this.toDate, tipo);
            counter += 1;
        }
    }

    enviarSolicitudes() {
        this.enviandoSolicitudes = true;
        const { solicitudCocina, solicitudAcompanantes, solicitudServicio } = this.values;
        if (solicitudCocina > 0) {
            this.enviarNumeroSolicitudesTipo(solicitudCocina, 'cocina');
        }
        if (solicitudAcompanantes > 0) {
            this.enviarNumeroSolicitudesTipo(solicitudAcompanantes, 'acompañantes');
        }
        if (solicitudServicio > 0) {
            this.enviarNumeroSolicitudesTipo(solicitudServicio, 'servicio');
        }

        setTimeout(() => {
            this.enviandoSolicitudes = false;
            this.values = { ...this.customValues };
            if (!this.ref['destroyed']) {
                this.ref.detectChanges();
            }
        }, 2000);
    }
}

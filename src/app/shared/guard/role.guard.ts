import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AngularFirestore } from 'angularfire2/firestore';
import { resolve } from 'q';
import { AngularFireAuth } from 'angularfire2/auth';
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private auth: AngularFireAuth,
        private router: Router,
        private store: AngularFirestore) { }


    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.auth.auth.onAuthStateChanged((user: firebase.User) => {
              if (user) {
                this.store.collection('user_types').doc(user.uid).get().toPromise().then(response => {
                    const {type} = response.data();
                    resolve(type === 'voluntario');
                    if (type === 'voluntario') {
                        this.router.navigate(['/solicitudes']);
                    }

                    if (type === 'comedor') {
                        this.router.navigate(['/voluntarios']);
                    }
                    resolve(true);
                });
              }
            });
          });
    }
}

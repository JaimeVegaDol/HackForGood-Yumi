import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
    private user: firebase.User;
    constructor(public afAuth: AngularFireAuth) {
        afAuth.authState.subscribe(user => {
            this.user = user;
        });
    }

    get uid(): string {
        return this.user.uid;
    }

    get authenticated(): boolean {
        return this.user !== null;
    }

    get currentUserObservable(): any {
        return this.afAuth.authState;
    }

    doRegister(value) {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doLogin(value) {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signInWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }

    doLogout() {
        return new Promise<any>((resolve, reject) => {
            firebase.auth().signOut()
                .then(res => {
                    resolve(res);
                }, err => reject(err));
        });
    }
}

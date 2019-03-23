import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { AuthService } from '../services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
    signupForm: FormGroup;
    isSubmitted: boolean;
    errorMessage: string;

    constructor(
        private authService: AuthService,
        private formBuilder: FormBuilder,
        private store: AngularFirestore,
        private router: Router
    ) {}

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            name: [''],
            type: ['', Validators.required],
            email: ['', Validators.compose([Validators.email, Validators.required])],
            password: ['', Validators.required],
            duplicatePassword: ['', Validators.required]
        });
    }

    onRegister() {
        this.isSubmitted = true;
        this.errorMessage = '';

        if (this.signupForm.invalid) {
            return;
        }

        const {value} = this.signupForm;

        return this.authService.doRegister(value).then(response => {
            if (value.name) {
                response.user.updateProfile({
                  displayName: value.name,
                  photoURL: ''
                });

                const pluralTypes = {
                    comedor: 'comedores',
                    voluntario: 'voluntarios',
                    donante: 'donantes'
                };

                return this.store.collection(`${pluralTypes[value.type]}`).doc(`${response.user.uid}`).set({
                    name: value.name,
                    email: value.email,
                    type: value.type
                })
                .then(() => {
                    return this.store.collection('user_types').doc(`${response.user.uid}`).set( { type: value.type });
                })
                .then(() => {
                    if (value.type === 'comedor') {
                        this.router.navigateByUrl('/voluntarios');
                    }

                    if (value.type === 'voluntario') {
                        this.router.navigateByUrl('/solicitudes');
                    }
                });
              }
        });
    }
}

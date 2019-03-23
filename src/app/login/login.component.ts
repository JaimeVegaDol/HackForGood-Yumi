import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isSubmitted  =  false;
    errorMessage: string;

    constructor(
      public router: Router,
      private authService: AuthService,
      private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.loginForm  =  this.formBuilder.group({
            email: ['', Validators.compose([Validators.email, Validators.required])],
            password: ['', Validators.required]
        });
    }

    get formControls() { return this.loginForm.controls; }

    onLoggedin() {
        this.isSubmitted = true;
        this.errorMessage = '';
        if (this.loginForm.invalid) {
          return;
        }
        localStorage.setItem('isLoggedin', 'true');
        return this.authService.doLogin(this.loginForm.value)
            .then(() => this.router.navigateByUrl(''))
            .catch(({message}) => {
                if ( message === 'There is no user record corresponding to this identifier. The user may have been deleted.') {
                    this.errorMessage = 'Usuario no existente';
                }

                if (message === 'The password is invalid or the user does not have a password.') {
                    this.errorMessage = 'La contraseña es incorrecta, Por favor intentelo de nuevo';
                }
            });
    }
}

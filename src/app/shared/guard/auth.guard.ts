import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }


    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {
        if (this.auth.authenticated) { return true; }

        return this.auth.currentUserObservable
            .pipe(
                take(1),
                map(user => !!user),
                tap(loggedIn => {
                    if (!loggedIn) {
                        console.log('access denied');
                        this.router.navigate(['/login']);
                    }
                })
            );

    }
}

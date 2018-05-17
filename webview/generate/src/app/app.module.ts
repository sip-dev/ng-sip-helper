import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GenerateComponent } from './generate/generate.component';
import { SharedModule } from './shared/shared.module';
import { StartupService } from './core/services/startup.service';

export function StartupServiceFactory(startupService: StartupService): Function {
    return () => startupService.load();
}

@NgModule({
    declarations: [
        AppComponent,
        GenerateComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgbModule.forRoot(),
        SharedModule,
        CoreModule
    ],
    bootstrap: [AppComponent],
    providers: [NgbPopoverConfig,
        StartupService,
        {
            provide: APP_INITIALIZER,
            useFactory: StartupServiceFactory,
            deps: [StartupService],
            multi: true
        }
    ],
    exports: [
        CoreModule,
        GenerateComponent
    ]
})
export class AppModule {
}
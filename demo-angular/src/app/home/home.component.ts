import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { BottomSheet } from "../../../../src/ng-bottomsheet";
import { BottomSheetState } from "../../../../src/ng-bottomsheet.common";
import { Screen, Page, Utils } from "@nativescript/core";

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit, AfterViewInit {

    @ViewChild("bottomSheet", {static: false}) bottomSheetRef: ElementRef;

    constructor(private page: Page) {
        this.page.actionBarHidden = true;

        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
    }

    ngAfterViewInit() {
        // this.bottomSheetRef.nativeElement.setSkipExpanded(false);
    }

    onStateChange(args) {
        const {eventName, object, state, startState} = args;
        console.log(state);
        console.log(startState);
    }
}

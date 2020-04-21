import { Component, OnInit } from "@angular/core";
import { BottomSheetState } from "../../../../src/ng-bottomsheet.common";

@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
    }

    onStateChange(args) {
        const {eventName, object, state} = args;
        console.log(state);
    }
}

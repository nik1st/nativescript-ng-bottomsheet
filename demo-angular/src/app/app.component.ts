import { registerElement } from "nativescript-angular/element-registry";
registerElement("BottomSheet", () => require("nativescript-ng-bottomsheet").BottomSheet);
// registerElement("Peek", () => require("nativescript-ng-bottomsheet/childs/peek/peek").Peek);
// registerElement("InfoView", () => require("nativescript-ng-bottomsheet/childs/info-view/info-view").InfoView);
import { Component } from "@angular/core";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent { }

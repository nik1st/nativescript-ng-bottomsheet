import { ScrollView, isAndroid, Style, View } from "@nativescript/core";
import { BottomSheetState } from "../../ng-bottomsheet.common";

export class InfoViewBase extends ScrollView {
    constructor() {
        super();
        this.id = "InfoView";
        // this.on("getPeekHeight", (event: any) => this.marginTop = event.height);
        // this.on("stateChange", (event: any) => {
        //     if (event.state === BottomSheetState.EXPANDED) {
        //         return allowScrolling(this, false);
        //     }
        //     allowScrolling(this, true);
        // });
    }
}

function allowScrolling(view: View, value: boolean) {
    if (isAndroid) {
        return view.nativeView.requestDisallowInterceptTouchEvent(value);
    }

    this.view.scrollEnabled = value;
}
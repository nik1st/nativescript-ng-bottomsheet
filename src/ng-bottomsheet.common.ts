import {
    GestureHandlerStateEvent, GestureHandlerTouchEvent, GestureState,
    GestureStateEventData, GestureTouchEventData, HandlerType, Manager, PanGestureHandler
} from "nativescript-gesturehandler";
import { View, Property } from "tns-core-modules/ui/core/view";
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import * as application from "@nativescript/core/application";
import { GestureTypes, GestureStateTypes, PanGestureEventData } from "@nativescript/core/ui/gestures/gestures";
import { CubicBezierAnimationCurve } from "@nativescript/core/ui/animation";
import { screen } from "@nativescript/core/platform";
import { Label } from "tns-core-modules/ui/label";
import * as builder  from "tns-core-modules/ui/builder";
import * as utils from "@nativescript/core/utils/utils";

const OPEN_DURATION = 100;
const CLOSE_DURATION = 200;

export interface BottomSheetScrollEventData {
    top: number;
    percentage: number;
    height: number;
}

export enum BottomSheetState {
    COLLAPSED,
    HALP_EXPANDED,
    EXPANDED
}

export class BottomSheetBase extends GridLayout {
    state: BottomSheetState = BottomSheetState.HALP_EXPANDED;
    screenHeight: number;
    currentHeight: number;

    constructor() {
        super();

        // this.changeState(this.state);
        this.height = { unit: "%", value: 50 };

        const childElem = new Label();
        const cssString = `Label { height: 40; width: 100%; background-color: green; color: white;}`;
        childElem.addCss(cssString);
        childElem.verticalAlignment = "top";
        this.addChild(childElem);

        this.screenHeight = screen.mainScreen.heightDIPs;

        this.getChildAt(0).on(GestureTypes.pan, (args: PanGestureEventData) => {
            const { state, deltaY  } = args;
            switch (state) {
                case GestureStateTypes.began :
                    this.currentHeight = this.getActualSize().height;
                    break;

                case GestureStateTypes.changed :
                    console.log(`Height = ${this.currentHeight} && Y = ${deltaY}` );
                    this.animate({
                        height: this.currentHeight - deltaY,
                        duration: 0,
                        curve: new CubicBezierAnimationCurve(0.1, 0.1, 0.1, 1)
                    });
                    break;

                case GestureStateTypes.ended || GestureStateTypes.cancelled :
                    this.currentHeight = this.getActualSize().height;
                    if (this.currentHeight <= this.screenHeight * 30 /100) {
                        this.changeState(BottomSheetState.COLLAPSED);
                    } else if (this.currentHeight <= this.screenHeight * 70/100) {
                        this.changeState(BottomSheetState.HALP_EXPANDED);
                    } else if (this.currentHeight > this.screenHeight * 70/100) {
                        this.changeState(BottomSheetState.EXPANDED);
                    }
                    break;
            }
        });
    }

    changeState(state: BottomSheetState) {
        let height: string;
        switch(state) {
            case BottomSheetState.COLLAPSED :
                height = "20%";
                this.state = BottomSheetState.COLLAPSED;
                break;
            case BottomSheetState.HALP_EXPANDED :
                height = "50%";
                this.state = BottomSheetState.HALP_EXPANDED;
                break;
            case BottomSheetState.EXPANDED :
                height = "100%";
                this.state = BottomSheetState.EXPANDED;
                break;
        }
        this.animate({
            height,
            duration: CLOSE_DURATION
        });
    }
}
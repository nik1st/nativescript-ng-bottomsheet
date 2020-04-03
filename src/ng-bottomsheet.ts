import {
    GestureHandlerStateEvent, GestureHandlerTouchEvent, GestureState,
    GestureStateEventData, GestureTouchEventData, HandlerType, Manager, PanGestureHandler
} from "nativescript-gesturehandler";
import { Observable } from "tns-core-modules/data/observable";
import { View, Property } from "tns-core-modules/ui/core/view";
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import * as application from "@nativescript/core/application";

const OPEN_DURATION = 100;
const CLOSE_DURATION = 200;

export const PAN_GESTURE_TAG = 1;

export interface BottomSheetScrollEventData {
    top: number;
    percentage: number;
    height: number;
}

export class BottomSheet extends StackLayout {

    panGestureHandler: PanGestureHandler;

    constructor() {
        super();
        // const manager = Manager.getInstance();
        // const gestureHandler = manager.createGestureHandler(HandlerType.PAN, PAN_GESTURE_TAG, {
        //     shouldCancelWhenOutside: false,
        //     activeOffsetY: 5,
        //     failOffsetY: -5,
        //     simultaneousHandlers: application.ios ? [NATIVE_GESTURE_TAG] : undefined
        // });
        // gestureHandler.on(GestureHandlerTouchEvent, this.onGestureTouch, this);
        // gestureHandler.on(GestureHandlerStateEvent, this.onGestureState, this);
        // this.panGestureHandler = gestureHandler as any;
    }

    // destroyed() {
    //     if (this.panGestureHandler) {
    //         this.panGestureHandler.off(GestureHandlerTouchEvent, this.onGestureTouch, this);
    //         this.panGestureHandler.off(GestureHandlerStateEvent, this.onGestureState, this);
    //         this.panGestureHandler = null;
    //     }
    // }

    // onGestureTouch(args: GestureTouchEventData) {
    //     const data = args.data;
    //     console.log(data);
    // }

    // onGestureState(args: GestureStateEventData) {
    //     const data = args.data;
    //     console.log(data);
    // }

}
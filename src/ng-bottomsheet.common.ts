import {
    GridLayout, StackLayout, Screen, Application,
    GestureStateTypes, GestureTypes, PanGestureEventData, Utils
} from "@nativescript/core";
import { Property } from "@nativescript/core/ui/content-view";
import { Size } from "@nativescript/core/ui/core/view/view";
import { PercentLength } from "@nativescript/core/ui/styling/style-properties";
import { animate } from "./animation-helper";
import { Peek } from "./childs/peek/peek";

export enum BottomSheetState {
    COLLAPSED,
    SETTLING,
    EXPANDED,
    DRAGGING,
    HIDDEN
}

let _size: Size;

export class BottomSheetBase extends GridLayout {
    static onStateChangeEvent: string = "stateChange";
    state: BottomSheetState = BottomSheetState.COLLAPSED;

    maxHeight: number;
    canExpand: boolean = true;

    settlingHeight: number;
    settlingWidth: number;

    collapsedHeight: number;
    collapsedWidth: number;

    peekHeight: number;

    private stateDIPs: number;

    constructor() {
        super();
        _size = this.getBottomSheetSize();
        this.height = { unit: "dip", value: this.getBottomSheetSize().height * 20 / 100 };
        this.verticalAlignment = "bottom";
        this.backgroundColor = "white";
        this.androidElevation = 12;
        this.borderTopLeftRadius = 20;
        this.borderTopRightRadius = 20;

        const peek = new Peek();
        this.addChild(peek);
        peek.addChild(new StackLayout());
        peek.getChildAt(0).addCss(
            `StackLayout {
                background-color: #a0a0a0;
                height: 5;
                width: 50;
                margin-top: 10;
                border-radius: 8;
            }`
        );

        this.on("loaded", () => {
            this.state = BottomSheetState.COLLAPSED;
            this.notify({eventName: BottomSheetBase.onStateChangeEvent, object: this, state: this.state});
            this.getChildAt(0).on(GestureTypes.pan, this.panGestureHandler);
            // this.getViewById("Peek").on("pan", this.panGestureHandler);
            // this.getViewById("InfoView").notify({eventName: "getPeekHeight", object: this.getViewById("Peek").style});
        });

        this.on("unloaded", () => {
            this.state = BottomSheetState.HIDDEN;
            this.notify({eventName: BottomSheetBase.onStateChangeEvent, object: this, state: this.state});
            this.getChildAt(0).off("pan", this.panGestureHandler);
        });
    }

    private panGestureHandler = (args: PanGestureEventData) => {
        const { state, deltaY } = args;
        switch (state) {
            case GestureStateTypes.began :
                this.stateDIPs = this.getActualSize().height;

                this.notify({eventName: BottomSheetBase.onStateChangeEvent,
                    object: this, state: BottomSheetState.DRAGGING, startState: this.state}
                );
                break;

            case GestureStateTypes.changed :
                if (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs >= this.getBottomSheetSize().height) {
                    break;
                }
                if (deltaY > 0) {
                    this.setBorders(20, 12);
                }

                const settlingDIPs = this.settlingHeight || this.getBottomSheetSize().height * 50 / 100;
                if (this.canExpand || deltaY > 0 ||
                    (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs <= settlingDIPs)
                ) {
                    this.height = { unit: "dip", value: this.stateDIPs - deltaY };
                }

                break;

            case GestureStateTypes.ended || GestureStateTypes.cancelled :
                this.stateDIPs = this.getActualSize().height;

                const collapsedAndSettlingAverage = (
                    (this.settlingHeight || this.getBottomSheetSize().height * 50 / 100)
                    + (this.collapsedHeight || this.getBottomSheetSize().height * 20 / 100)
                ) / 2;
                // console.log((collapsedAndSettlingAverage / this.getBottomSheetSize().height) * 100);
                const settlingAndExpandedAverage = (
                    (this.settlingHeight || this.getBottomSheetSize().height * 50 / 100)
                    + this.getBottomSheetSize().height
                ) / 2;
                // console.log((settlingAndExpandedAverage / this.getBottomSheetSize().height) * 100);
                if (this.stateDIPs <= collapsedAndSettlingAverage) {
                    this.setState(BottomSheetState.COLLAPSED);
                    break;
                }
                if (this.stateDIPs <= settlingAndExpandedAverage) {
                    this.setState(BottomSheetState.SETTLING);
                    break;
                }
                if (this.canExpand) {
                    this.setState(BottomSheetState.EXPANDED);
                }
                break;
        }
    }

    setState(state: BottomSheetState): void {
        let newStateDIPs: number;

        switch (state) {
            case BottomSheetState.COLLAPSED :
                newStateDIPs = this.collapsedHeight || this.getBottomSheetSize().height * 20 / 100;
                this.state = BottomSheetState.COLLAPSED;
                this.setBorders(20, 12);
                break;

            case BottomSheetState.SETTLING :
                newStateDIPs = this.settlingHeight || this.getBottomSheetSize().height * 50 / 100;
                this.state = BottomSheetState.SETTLING;
                this.setBorders(20, 12);
                break;

            case BottomSheetState.EXPANDED :
                newStateDIPs = this.getBottomSheetSize().height;
                this.state = BottomSheetState.EXPANDED;
                this.setBorders(0, 0);
                break;

            default : return;
        }
        // later will ve added width animation
        animate(200, [{
            getRange: () => {
                return { from: this.stateDIPs, to: newStateDIPs };
            },
            curve: (t) => t,
            step: (v) => {
                this.height = v;
            }
        }]).then(() => {
            this.notify(
                {eventName: BottomSheetBase.onStateChangeEvent, object: this, state: this.state}
            );
        });

    }

    private setBorders(topRadius, elevation?) {
        this.borderTopLeftRadius = topRadius;
        this.borderTopRightRadius = topRadius;
        this.androidElevation = elevation || 0;
    }

    private getBottomSheetSize(): Size {
        const marginTop = Utils.layout.toDeviceIndependentPixels(
            PercentLength.toDevicePixels(this.marginTop, 0, 0)
        ) || 0;
        const differenceBetweenMaxHeightAndScreenHeight =
            this.maxHeight ? Screen.mainScreen.heightDIPs - this.maxHeight : 0;

        let screenHeight: number;
        if (Application.ios) {
            screenHeight = Screen.mainScreen.heightDIPs -
                Application.ios.nativeApp.windows[0].safeAreaInsets.top -
                Application.ios.nativeApp.windows[0].safeAreaInsets.bottom;
        } else {
            screenHeight = Screen.mainScreen.heightDIPs -
                Utils.android.getApplicationContext().getResources().getDimensionPixelSize(
                    Utils.android.getApplicationContext().getResources().getIdentifier("status_bar_height", "dimen", "android")
                ) /
                Utils.android.getApplicationContext().getResources().getDisplayMetrics().density;
        }

        return {
            height: screenHeight - marginTop -
                differenceBetweenMaxHeightAndScreenHeight,
            width: this.getActualSize().width
        };
    }

    setHideable(hideable: boolean): void {
        // Sets whether this bottom sheet can hide when it is swiped down.
        // here will be implementation ...
    }

    setPeekHeight(peekHeight: number): void {
        // Sets the height of the bottom sheet when it is collapsed.
        // here will be implementation ...
    }

    setSkipCollapsed(skipCollapsed: boolean): void {
        // Sets whether this bottom sheet should skip the collapsed state when it is being hidden after it is expanded once.
        // here will be implementation ...
    }

    setCanExpand(canExpand: boolean): void {
        this.canExpand = canExpand;
    }

    getPeekHeight() {
        // Gets the height of the bottom sheet when it is collapsed.
        // here will be implementation ...
    }

    getSkipCollapsed() {
        // Sets whether this bottom sheet should skip the collapsed state when it is being hidden after it is expanded once.
        // here will be implementation ...
    }

    getState() {
        //  Gets the current state of the bottom sheet.
        // here will be implementaion ...
    }

    isHideable() {
        // Gets whether this bottom sheet can hide when it is swiped down.
        // here will be implementation ...
    }
}

export const canExpand = new Property<BottomSheetBase, boolean>({
    name: "canExpand",
    valueConverter: value => value === 'true'
});
canExpand.register(BottomSheetBase);

export const maxHeightProperty = new Property<BottomSheetBase, number>({
    name: "maxHeight",
    valueConverter: value => {
        const length = PercentLength.parse(value);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    return _size.height * (length.value * 100) / 100;
                case "px" :
                    return Utils.layout.toDeviceIndependentPixels(length.value);
                case "dip" :
                    return length.value;
                default :
                    return NaN;
            }
        }
        if (typeof length === "string") {
            return NaN;
        }

        return length;
    }
});
maxHeightProperty.register(BottomSheetBase);

export const settlingWidth = new Property<BottomSheetBase, PercentLength>({
    name: "settingWidth",
    valueConverter: value => {
        const length = PercentLength.parse(value);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    return _size.width * (length.value * 100) / 100;
                case "px" :
                    return Utils.layout.toDeviceIndependentPixels(length.value);
                case "dip" :
                    return length.value;
                default :
                    return NaN;
            }
        }
        if (typeof length === "string") {
            return NaN;
        }

        return length;
    }
});
settlingWidth.register(BottomSheetBase);

export const settlingHeight = new Property<BottomSheetBase, PercentLength>({
    name: "settlingHeight",
    valueConverter: value => {
        const length = PercentLength.parse(value);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    return _size.height * (length.value * 100) / 100;
                case "px" :
                    return Utils.layout.toDeviceIndependentPixels(length.value);
                case "dip" :
                    return length.value;
                default :
                    return NaN;
            }
        }
        if (typeof length === "string") {
            return NaN;
        }

        return length;
    }
});
settlingHeight.register(BottomSheetBase);

export const collapsedWidth = new Property<BottomSheetBase, PercentLength>({
    name: "collapsedWidth",
    valueConverter: value => {
        const length = PercentLength.parse(value);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    return _size.width * (length.value * 100) / 100;
                case "px" :
                    return Utils.layout.toDeviceIndependentPixels(length.value);
                case "dip" :
                    return length.value;
                default :
                    return NaN;
            }
        }
        if (typeof length === "string") {
            return NaN;
        }

        return length;
    }
});
collapsedWidth.register(BottomSheetBase);

export const collapsedHeight = new Property<BottomSheetBase, PercentLength>({
    name: "collapsedHeight",
    valueConverter: value => {
        const length = PercentLength.parse(value);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    return _size.height * (length.value * 100) / 100;
                case "px" :
                    return Utils.layout.toDeviceIndependentPixels(length.value);
                case "dip" :
                    return length.value;
                default :
                    return NaN;
            }
        }
        if (typeof length === "string") {
            return NaN;
        }

        return length;
    }
});
collapsedHeight.register(BottomSheetBase);

export const peekHeight = new Property<BottomSheetBase, PercentLength>({
    name: "peekHeight",
    valueConverter: value => parseInt(value)
});
peekHeight.register(BottomSheetBase);
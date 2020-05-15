import {
    GridLayout, StackLayout, Screen, Application,
    GestureStateTypes, GestureTypes, PanGestureEventData, Utils
} from "@nativescript/core";
import { Property } from "@nativescript/core/ui/content-view";
import { Size, Length } from "@nativescript/core/ui/core/view/view";
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
    canExpand: boolean;

    settlingHeight: number;
    settlingWidth: number;

    collapsedHeight: number;
    collapsedWidth: number;

    peekHeight: number;

    private stateDIPs: number = this.getActualSize().height;

    constructor() {
        super();
        _size = this._getBottomSheetSize();
        this.height = {
            unit: "dip",
            value: this.settlingHeight
                || this.collapsedHeight
                || this._getBottomSheetSize().height * 20 / 100
        };
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
            this.getChildAt(0).on(GestureTypes.pan, this._panGestureHandler);
            // this.getViewById("Peek").on("pan", this.panGestureHandler);
            // this.getViewById("InfoView").notify({eventName: "getPeekHeight", object: this.getViewById("Peek").style});
        });

        this.on("unloaded", () => {
            this.state = BottomSheetState.HIDDEN;
            this.notify({eventName: BottomSheetBase.onStateChangeEvent, object: this, state: this.state});
            this.getChildAt(0).off("pan", this._panGestureHandler);
        });
    }

    setState(state: BottomSheetState, newStateHeight?: number): void {
        let newStateDIPs: number;

        switch (state) {
            case BottomSheetState.COLLAPSED :
                newStateDIPs = newStateHeight
                    || this.collapsedHeight
                    || this._getBottomSheetSize().height * 20 / 100;
                this._setBorders(20, 12);
                break;

            case BottomSheetState.SETTLING :
                newStateDIPs = newStateHeight
                    || this.settlingHeight
                    || this._getBottomSheetSize().height * 50 / 100;
                this._setBorders(20, 12);
                break;

            case BottomSheetState.EXPANDED :
                newStateDIPs = this._getBottomSheetSize().height;
                this._setBorders(0, 0);
                break;

            default : return;
        }
        // later will be added width animation
        animate(200, [{
            getRange: () => {
                return {
                    from: this.stateDIPs || this.getActualSize().height,
                    to: newStateDIPs
                };
            },
            curve: (t) => t,
            step: (v) => {
                this.height = v;
            }
        }]).then(() => {
            if (newStateHeight) {
                this.stateDIPs = newStateHeight;
            }
            this.state = state;
            this.notify({
                eventName: BottomSheetBase.onStateChangeEvent,
                object: this,
                state: this.state
            });
        });
    }

    setCanExpand(canExpand: boolean): void {
        this.canExpand = canExpand;
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

    private _panGestureHandler = (args: PanGestureEventData) => {
        const { state, deltaY } = args;
        switch (state) {
            case GestureStateTypes.began :
                this.stateDIPs = this.getActualSize().height;

                this.notify({eventName: BottomSheetBase.onStateChangeEvent,
                    object: this, state: BottomSheetState.DRAGGING, startState: this.state}
                );
                break;

            case GestureStateTypes.changed :
                if (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs >= this._getBottomSheetSize().height) {
                    break;
                }
                if (deltaY > 0) {
                    this._setBorders(20, 12);
                }

                const settlingDIPs = this.settlingHeight || this._getBottomSheetSize().height * 50 / 100;
                if (this.canExpand || deltaY > 0 ||
                    (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs <= settlingDIPs)
                ) {
                    this.height = { unit: "dip", value: this.stateDIPs - deltaY };
                }

                break;

            case GestureStateTypes.ended || GestureStateTypes.cancelled :
                this.stateDIPs = this.getActualSize().height;

                const collapsedAndSettlingAverage = (
                    (this.settlingHeight || this._getBottomSheetSize().height * 50 / 100)
                    + (this.collapsedHeight || this._getBottomSheetSize().height * 20 / 100)
                ) / 2;
                // console.log((collapsedAndSettlingAverage / this.getBottomSheetSize().height) * 100);
                const settlingAndExpandedAverage = (
                    (this.settlingHeight || this._getBottomSheetSize().height * 50 / 100)
                    + this._getBottomSheetSize().height
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

    private _setBorders(topRadius: Length, elevation?: number): void {
        this.borderTopLeftRadius = topRadius;
        this.borderTopRightRadius = topRadius;
        this.androidElevation = elevation || 0;
    }

    private _getBottomSheetSize(): Size {
        const marginTop = Utils.layout.toDeviceIndependentPixels(
            PercentLength.toDevicePixels(this.marginTop, 0, 0)
        ) || 0;
        const differenceBetweenMaxHeightAndScreenHeight =
            this.maxHeight ? Screen.mainScreen.heightDIPs - this.maxHeight : 0;

        let screenHeight: number;
        if (Application.ios) {
            screenHeight = Screen.mainScreen.heightDIPs
                - Application.ios.nativeApp.windows[0].safeAreaInsets.top
                - Application.ios.nativeApp.windows[0].safeAreaInsets.bottom;
        } else {
            const resources =  Utils.android.getApplicationContext().getResources();
            screenHeight = Screen.mainScreen.heightDIPs
                - resources.getDimensionPixelSize(
                    resources.getIdentifier("status_bar_height", "dimen", "android")
                )
                / Utils.android.getApplicationContext().getResources().getDisplayMetrics().density;
        }

        return {
            height: screenHeight - marginTop -
                differenceBetweenMaxHeightAndScreenHeight,
            width: this.getActualSize().width
        };
    }
}

export const canExpandProperty = new Property<BottomSheetBase, boolean>({
    name: "canExpand",
    defaultValue: true,
    valueConverter: value => value === 'true'
});
canExpandProperty.register(BottomSheetBase);

export const maxHeightProperty = new Property<BottomSheetBase, number>({
    name: "maxHeight",
    valueConverter: percentLengthPropertyConverter
});
maxHeightProperty.register(BottomSheetBase);

export const settlingWidthProperty = new Property<BottomSheetBase, PercentLength>({
    name: "settingWidth",
    defaultValue: "auto",
    valueConverter: percentLengthPropertyConverter
});
settlingWidthProperty.register(BottomSheetBase);

export const settlingHeightProperty = new Property<BottomSheetBase, PercentLength>({
    name: "settlingHeight",
    valueConverter: percentLengthPropertyConverter
});
settlingHeightProperty.register(BottomSheetBase);

export const collapsedWidthProperty = new Property<BottomSheetBase, PercentLength>({
    name: "collapsedWidth",
    defaultValue: "auto",
    valueConverter: percentLengthPropertyConverter
});
collapsedWidthProperty.register(BottomSheetBase);

export const collapsedHeightProperty = new Property<BottomSheetBase, PercentLength>({
    name: "collapsedHeight",
    valueConverter: percentLengthPropertyConverter
});
collapsedHeightProperty.register(BottomSheetBase);

export const peekHeightProperty = new Property<BottomSheetBase, PercentLength>({
    name: "peekHeight",
    defaultValue: 40,
    valueConverter: value => parseInt(value)
});
peekHeightProperty.register(BottomSheetBase);

function percentLengthPropertyConverter(value: string) {
    const length = PercentLength.parse(value);
    console.log(`settlingHeight = ${value}`);
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
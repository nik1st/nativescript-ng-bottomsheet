import {
    GridLayout, StackLayout, Screen,
    GestureStateTypes, GestureTypes, PanGestureEventData, Utils, View
} from "@nativescript/core";
import { Size } from "@nativescript/core/ui/core/view/view";
import { PercentLength} from "@nativescript/core/ui/styling/style-properties";
import {animate} from "./animation-helper";

export enum BottomSheetState {
    COLLAPSED,
    HALP_EXPANDED, // later will be changed to SETTLING
    EXPANDED,
    // DRAGGING,
    // HIDDEN
}

export class BottomSheetBase extends GridLayout {
    static onStateChangeEvent: string = "stateChange";
    state: BottomSheetState = BottomSheetState.COLLAPSED;

    private skipExpanded: boolean = false;
    private stateDIPs: number;
    private _maxHeight: number;
    // private _settlingStateSize: number;
    // private _collapsedStateSize: number;

    // PARSINGS PercenLength value to number
    set maxHeight(length: any) {
        length = PercentLength.parse(length);
        if (typeof length === "object") {
            switch (length.unit) {
                case "%" :
                    this._maxHeight = this.getBottomSheetSize().height * (length.value * 100) / 100;
                    break;
                case "px" :
                    this._maxHeight = Utils.layout.toDeviceIndependentPixels(length.value);
                    break;
                case "dip" :
                    this._maxHeight = length.value;
                    break;
                default :
                    this._maxHeight = NaN;
            }
            return;
        }
        if (typeof length === "string") {
            this._maxHeight = NaN;
            return;
        }

        this._maxHeight = length;
    }

    get maxHeight(): any {
        return this._maxHeight;
    }

    constructor() {
        super();
        this.height = { unit: "dip", value: Screen.mainScreen.heightDIPs * 20 / 100 };
        this.verticalAlignment = "bottom";

        // if (Application.android) {
        this.backgroundColor = "white";
        this.androidElevation = 12;
        this.borderTopLeftRadius = 20;
        this.borderTopRightRadius = 20;
        // } else {
        // this.on("loaded", () => {
                // let shadowLayer = CAShapeLayer.alloc().init();
                // let cgPath = UIBezierPath.bezierPathWithRoundedRectByRoundingCornersCornerRadii(this.ios.bounds, 3, CGSizeMake(8, 8)).CGPath;
                // shadowLayer.path = cgPath;
                // shadowLayer.fillColor = UIColor.whiteColor.CGColor;
                // shadowLayer.shadowColor = UIColor.blackColor.CGColor;
                // shadowLayer.shadowPath = cgPath;
                // shadowLayer.shadowOffset = CGSizeMake(2.6, 2.6);
                // shadowLayer.shadowOpacity = 0.8;
                // shadowLayer.shadowRadius = 8;
                // this.ios.layer.masksToBounds = true;
                // this.ios.layer.backgroundColor = UIColor.whiteColor.CGColor;
                // this.ios.layer.maskedCorners = 3;
                // this.ios.layer.shadowOffset = CGSizeMake(0, 1);
                // this.ios.layer.shadowOpacity = .4;
                // this.ios.layer.shadowRadius = 5;
                // this.ios.layer.cornerRadius = 20;
                // this.ios.layer.addSublayer(shadowLayer);
            // });
        // }
        const peek = new StackLayout();
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

        this.getChildAt(0).on(GestureTypes.pan, (args: PanGestureEventData) => {
            const { state, deltaY  } = args;
            switch (state) {
                case GestureStateTypes.began :
                    this.stateDIPs = this.getActualSize().height;
                    break;

                case GestureStateTypes.changed :
                    if (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs >= this.getBottomSheetSize().height) {
                        break;
                    }
                    if (this.state === BottomSheetState.EXPANDED && deltaY > 0) {
                        // if (Application.android) {
                        this.borderTopLeftRadius = 20;
                        this.borderTopRightRadius = 20;
                        this.androidElevation = 12;
                        // }
                    }

                    // later 50% of BottomSheet height will be changed to _settlingStateSize
                    if (!this.skipExpanded || deltaY > 0 ||
                        (deltaY < 0 && deltaY - deltaY * 2 + this.stateDIPs <= this.getBottomSheetSize().height * 50 / 100)
                    ) {
                        this.height = { unit: "dip", value: this.stateDIPs - deltaY };
                    }

                    break;

                case GestureStateTypes.ended || GestureStateTypes.cancelled :
                    this.stateDIPs = this.getActualSize().height;

                    // later 30% of BottomSheet height will be changed to another value
                    if (this.stateDIPs <= this.getBottomSheetSize().height * 30 / 100) {
                        this.setState(BottomSheetState.COLLAPSED);
                        break;
                    }
                    // later 50% of BottomSheet height will be changed to to another value
                    if (this.stateDIPs <= this.getBottomSheetSize().height * 70 / 100) {
                        this.setState(BottomSheetState.HALP_EXPANDED);
                        break;
                    }
                    if (!this.skipExpanded) {
                        this.setState(BottomSheetState.EXPANDED);
                    }
                    break;
            }
        });
    }

    setState(state: BottomSheetState): void {
        let newStateDIPs: number;

        switch (state) {
            case BottomSheetState.COLLAPSED :
                // later 20% of BottomSheet height will be changed to _collapsedStateSize
                newStateDIPs = this.getBottomSheetSize().height * 20 / 100;
                this.state = BottomSheetState.COLLAPSED;
                // if (Application.android) {
                this.borderTopLeftRadius = 20;
                this.borderTopRightRadius = 20;
                this.androidElevation = 12;
                // }
                break;

            case BottomSheetState.HALP_EXPANDED :
                // later 50% of BottomSheet height will be changed to _settlingStateSize
                newStateDIPs = this.getBottomSheetSize().height * 50 / 100;
                this.state = BottomSheetState.HALP_EXPANDED;
                // if (Application.android) {
                this.borderTopLeftRadius = 20;
                this.borderTopRightRadius = 20;
                this.androidElevation = 12;
                // }
                break;

            case BottomSheetState.EXPANDED :
                newStateDIPs = this.getBottomSheetSize().height;
                this.state = BottomSheetState.EXPANDED;
                // if (Application.android) {
                this.borderTopLeftRadius = 0;
                this.borderTopRightRadius = 0;
                this.androidElevation = 0;
                // }
                break;

            default : return;
        }

        animate(200, [{
            getRange: () => {
                return { from: this.stateDIPs, to: newStateDIPs };
            },
            curve: (t) => t,
            step: (v) => {
                this.height = v;
            }
        }]);

        this.notify({eventName: BottomSheetBase.onStateChangeEvent, object: this, state: this.state});
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

    setSkipExpanded(skipExpanded: boolean): void {
        this.skipExpanded = skipExpanded;
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

    private getBottomSheetSize(): Size {
        const marginTop = Utils.layout.toDeviceIndependentPixels(
            PercentLength.toDevicePixels(this.marginTop, 0, 0)
        ) || 0;
        const differenceBetweenMaxHeightAndScreenHeight =
            this.maxHeight ? Screen.mainScreen.heightDIPs - this.maxHeight : 0;

        return {
            height: Screen.mainScreen.heightDIPs - marginTop -
                differenceBetweenMaxHeightAndScreenHeight,
            width: this.getActualSize().width
        };
    }
}
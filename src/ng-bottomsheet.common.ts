import {
    GridLayout, StackLayout, Application, Screen,
    GestureStateTypes, GestureTypes, PanGestureEventData
} from "@nativescript/core";
import {animate} from "./animation-helper";

export enum BottomSheetState {
    COLLAPSED,
    HALP_EXPANDED,
    EXPANDED
}

export class BottomSheetBase extends GridLayout {
    public static onStateChangeEvent: string = "stateChange";
    state: BottomSheetState = BottomSheetState.COLLAPSED;
    private stateDIPs: number;

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
        //    this.on("loaded", () => {
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
        const bottomSheetDragView = new StackLayout();
        this.addChild(bottomSheetDragView);
        bottomSheetDragView.addChild(new StackLayout());
        bottomSheetDragView.getChildAt(0).addCss(
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
                    if (this.state === BottomSheetState.EXPANDED) {
                        // if (Application.android) {
                            this.borderTopLeftRadius = 20;
                            this.borderTopRightRadius = 20;
                        // }
                    }
                    break;

                case GestureStateTypes.changed :
                    this.height = { unit: "dip", value: this.stateDIPs - deltaY };
                    break;

                case GestureStateTypes.ended || GestureStateTypes.cancelled :
                    this.stateDIPs = this.getActualSize().height;
                    if (this.stateDIPs <= Screen.mainScreen.heightDIPs * 30 / 100) {
                        this.setState(BottomSheetState.COLLAPSED);
                    } else if (this.stateDIPs <= Screen.mainScreen.heightDIPs * 70 / 100) {
                        this.setState(BottomSheetState.HALP_EXPANDED);
                    } else if (this.stateDIPs > Screen.mainScreen.heightDIPs * 70 / 100) {
                        this.setState(BottomSheetState.EXPANDED);
                    }
                    break;
            }
        });
    }

    setState(state: BottomSheetState) {
        let newStateDIPs: number;
        switch (state) {
            case BottomSheetState.COLLAPSED :
                newStateDIPs = Screen.mainScreen.heightDIPs * 20 / 100;
                this.state = BottomSheetState.COLLAPSED;
                // if (Application.android) {
                    this.borderTopLeftRadius = 20;
                    this.borderTopRightRadius = 20;
                // }
                break;
            case BottomSheetState.HALP_EXPANDED :
                newStateDIPs = Screen.mainScreen.heightDIPs * 50 / 100;
                this.state = BottomSheetState.HALP_EXPANDED;
                // if (Application.android) {
                    this.borderTopLeftRadius = 20;
                    this.borderTopRightRadius = 20;
                // }
                break;
            case BottomSheetState.EXPANDED :
                newStateDIPs = Screen.mainScreen.heightDIPs * 105 / 100;
                this.state = BottomSheetState.EXPANDED;
                // if (Application.android) {
                    this.borderTopLeftRadius = 0;
                    this.borderTopRightRadius = 0;
                // }
                break;
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
}
import React, { ReactNode } from "react";
import { ImageCompare, ImageCompareProps } from "./ImageCompare";
import './ZoomableImageCompare.css';


const PIXELATION_THRESHOLD = 3;
export class ZoomableImageCompare extends React.Component<ImageCompareProps, {
    zoomIn: boolean,
    zoomLevel: number,
}> {

    constructor(props: ImageCompareProps) {
        super(props);
        this.state = {
            zoomIn: true,
            zoomLevel: 1,
        };
    }

    zoomIn() {
        this.setState({
            zoomLevel: this.state.zoomLevel * 2,
        })
    }

    zoomOut() {
        this.setState({
            zoomLevel: this.state.zoomLevel * 0.5,
        })
    }

    componentDidMount(): void {

        const container = document.getElementById('container');

        container?.addEventListener('click', (v: MouseEvent) => {

            if (v.ctrlKey) {
                this.zoomOut();
            } else {
                this.zoomIn();
            }

        })

        window.addEventListener('keydown', (v: KeyboardEvent) => {

            if (v.ctrlKey) {
                this.setState({
                    zoomIn: false
                });
            }
        })
        
        window.addEventListener('keyup', (v: KeyboardEvent) => {
            if (!v.ctrlKey) {
                this.setState({
                    zoomIn: true,
                });
            }
        })
    }

    render(): ReactNode {
        return (
            <div>
                <div id='container' 
                    className={[
                        (this.state.zoomIn ? 'zoom-in' : 'zoom-out'),
                        (this.state.zoomLevel >= PIXELATION_THRESHOLD ? 'pixelated' : '')
                    ].join(' ')}
                    style={
                        {zoom: this.state.zoomLevel}
                    }>
                    <ImageCompare
                        firstImage={this.props.firstImage} 
                        secondImage={this.props.secondImage} />
                </div>
            </div>
        )
    }

}

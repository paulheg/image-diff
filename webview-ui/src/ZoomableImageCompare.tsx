import React, { ReactNode } from "react";
import { ImageCompare, ImageCompareProps } from "./ImageCompare";
import './ZoomableImageCompare.css';


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

    componentDidMount(): void {

        const container = document.getElementById('container');

        container?.addEventListener('click', (v: MouseEvent) => {

            if (v.ctrlKey) {
                // zoom out
                this.setState({
                    zoomLevel: this.state.zoomLevel * 0.5,
                })
            } else {
                // zoom in
                this.setState({
                    zoomLevel: this.state.zoomLevel * 2,
                })
            }

        })

        window.addEventListener('keydown', (v: KeyboardEvent) => {

            if (v.ctrlKey) {
                console.log('ctrl down');
                
                this.setState({
                    zoomIn: false
                });
            }
        })
        
        window.addEventListener('keyup', (v: KeyboardEvent) => {
            if (!v.ctrlKey) {
                console.log('ctrl up');

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
                    className={this.state.zoomIn ? 'zoom-in' : 'zoom-out'}
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

import React from 'react';
import './ImageCompare.css';

export interface ImageCompareProps {
    firstImage: string
    secondImage: string
}

interface ImageCompareState extends ImageCompareProps{
    width: number
    height: number
}

export class ImageCompare extends React.Component<ImageCompareProps, ImageCompareState> {

    constructor(props: ImageCompareProps) {
        super(props);
        this.state = {
            width: 0,
            height: 0,
            firstImage: props.firstImage,
            secondImage: props.secondImage,
        }
    }

    handleImageLoaded(event: any) {
        const image = event.target as HTMLImageElement
        this.setState({
            width: image.naturalWidth,
            height: image.naturalHeight,
        });
    }

    render(): React.ReactNode {
        return (
            <div>
                <div className='image-overlay' style={{
                    width: this.state.width,
                    height: this.state.height,
                }}>
                    <div className='image-container'>
                        {
                            this.props.firstImage.length > 0 &&
                            <img alt='First to compare' src={this.props.firstImage} onLoad={(e) => {this.handleImageLoaded(e);}} />
                        }
                    </div>
                    <div className='image-container'>
                        {
                        this.props.secondImage.length > 0 && 
                        <img alt='Second to compare' src={this.props.secondImage} />
                        }
                    </div>
                </div>
            </div>
        );
    }
}
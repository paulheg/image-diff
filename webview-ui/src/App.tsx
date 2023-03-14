import React from 'react';
import './App.css';
import { vscode } from "./utilities/vscode";
import { ZoomableImageCompare } from './ZoomableImageCompare';


interface AppProps {
  
}

interface AppState {
  firstImage: string
  secondImage: string
}


export default class App extends React.Component<AppProps, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {
      firstImage: '',
      secondImage: '',
    };
  }

  componentDidMount(): void {
    
    // listen to messages from the base extension
    window.addEventListener('message', (event: MessageEvent<
      {
        command: string,
        arguments: any,
      }>) =>  {

      console.log(event);
  
      switch (event.data.command) {
        case 'LOAD_FIRST_IMAGE':
          this.setState({
            firstImage: event.data.arguments,
          })
          break;
        case 'LOAD_SECOND_IMAGE':
          this.setState({
            secondImage: event.data.arguments,
          })
          break;
        default:
          break;
      }
    })

    // tell the base extension that we are ready
    vscode.postMessage({
      command: 'WEBVIEW_READY'
    })
  }

  render(): React.ReactNode {
    return (
      <main>
        <div className='container'>
          <div className='center-viewer'>
            <ZoomableImageCompare 
              firstImage={this.state.firstImage}
              secondImage={this.state.secondImage}/>
          </div>
        </div>
      </main>
    );
  }
}

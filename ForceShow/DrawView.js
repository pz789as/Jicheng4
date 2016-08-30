'use strict'
import React, { Component } from 'react';
import { View } from 'react-native';
import { requireNativeComponent } from 'react-native';

class DrawView extends Component {
  setNativeProps(props){
    this.root.setNativeProps(props);
  }

  render() {
    return (
      <DrawViewNative
        {...this.props}
        style={[
          {
            backgroundColor: 'transparent',
          },
          this.props.style,
        ]}
        ref={(r)=>{this.root = r}}/>
    );
  }
}

DrawView.propTypes = {
  transPos: React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
  }),
  scaleValue: React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
  }),
  drawData: React.PropTypes.object,
};

const DrawViewNative = requireNativeComponent('RCTDrawView', DrawView);

export default DrawView;

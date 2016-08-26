/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

import Svg,{
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Text as SvgText,
  Use,
  Defs,
  Stop
} from 'react-native-svg';

export default class TestArt extends Component {
  constructor(props){
    super(props);
    this.state={
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
    };
  }
  setPosition(x1, y1, x2, y2){
    this.setState({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
    });
  }
  render() {
    return (
      <Line 
        x1={this.props.x1}
        y1={this.props.y1}
        x2={this.props.x2}
        y2={this.props.y2}
        stroke="green"
        strokeWidth="2" />
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  vector:{
    width: 100,
    height: 100,
  },
  nodeStyle: {
    position: 'absolute',
    width: 10,
    height: 10,
    left: ScreenWidth/2,
    top: ScreenHeight/2,
    borderRadius: 5,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

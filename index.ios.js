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

import TestD3 from './TestD3';
import TestArt from './TestArt';
import ArtLayout from './ArtLayout';
// import ForceLayout from './ForceLayout';
import ForceLayout from './ForceShow/ForceLayout';

var test = false;
class Jicheng4 extends Component {
  constructor(props){
    super(props);
  }
  render() {
    if (test == false){
      return (
        <View style={styles.container}>
          <ForceLayout />
        </View>
      );
    }else{
      this.renderTest();
    }
  }
  renderTest(){
    return (
      <View style={styles.container}>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 100,
          height: 20,
          backgroundColor: '#F00',
          transform:[{
            rotateZ: '45'
          }],
        }}/>
        <View style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 100,
          height: 20,
          backgroundColor: '#0F0',
          transform:[{
            rotateZ: '0'
          }],
        }}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent('Jicheng4', () => Jicheng4);

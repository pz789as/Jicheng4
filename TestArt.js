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
  View,
  ART,
} from 'react-native';

const {
  Shape,
  Group,
  Transform,
  Surface,
  Path,
  Pattern,
  LinearGradient,
  RadialGradient,
  // Text,
  ClippingRectangle,
} = ART;

// var ellipse = require('./art/shapes/ellipse');

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

export default class TestArt extends Component {
  constructor(props){
    super(props);
    this.state={
      x1: 10,
      y1: 10,
      x2: 20,
      y2: 20,
    };
  }
  componentDidMount(){
    this.timeTicked = setInterval(this.timeTicks.bind(this), 100);
  }
  componentWillUnmount(){
    this.timeTicked && clearInterval(this.timeTicked);
  }
  timeTicks(){
    this.setState({
      x1: Math.random() * (ScreenWidth-10) + 5,
      y1: Math.random() * (ScreenHeight-10) + 5,
      x2: Math.random() * (ScreenWidth-10) + 5,
      y2: Math.random() * (ScreenHeight-10) + 5,
    });
  }
  render() {
    // var radius = 50;
    // var path = Path().moveTo(160, 160-radius).arc(0, radius*2, radius)
    //   .arc(0, -radius * 2, radius).close();
    // return (
    //   <Surface width={ScreenWidth} height={ScreenHeight}>
    //     <Group>
    //       <Shape d={'M160 160 a45 45, 0, 0, 1, 115 205'}
    //         stroke='#000000' strokeWidth={1}/>
    //       <Shape d={'M160 160 A45 45, 0, 0, 1, 115 205'}
    //         stroke='#000000' strokeWidth={1}/>
    //       <Shape d={path} stroke='#000000' strokeWidth={1}/>
    //       <Shape d={'M160 160 L115 205'} stroke='rgb(255,0,0,0.5)' strokeWidth={1}/>
    //     </Group>
    //   </Surface>
    // );

    var line = Path().moveTo(this.state.x1, this.state.y1)
      .lineTo(this.state.x2, this.state.y2);
    return (
      <Surface width={ScreenWidth} height={ScreenHeight}>
        <Shape ref={'shape'} d={line} stroke='rgb(255,0,0,1)' strokeWidth={1}/>
      </Surface>
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

// Shape属性：
// Shape用于生成路径，语法与svg中的<path>很相似。Shape的Props如下：
// d: 语法与svg规范相同
// stroke: 线条颜色，"#FFFFFF"的形式
// strokeWidth: 线条宽度，{3}的形式
// transform：接受 new ART.Transform()生成的object，具体见下文Transform条目。

// Path属性
// push():
// reset(): 清空Path
// move(x, y): 等同于'm'，移动到目的坐标，参数x和y是相对目标下的目的坐标
// moveTo(x, y): 等同于'M'，与move只差别在x和y是绝对坐标。
// line(x, y): 等同于'l'，从一个坐标点到另一个坐标点画直线，参数x和y是相对坐标下的目的坐标
// lineTo(x, y): 等同于'L'，与line只差别在x和y是绝对坐标。
// arc(x, y, rx, ry, outer): 等同于'a'，从一个坐标点向另一个坐标点画椭圆曲线，x和y是相对坐标下的目的坐标，rx和ry是椭圆的长轴半径和短轴半径，outer只有0和1两个数字，代表是大角度还是小角度。
// arcTo(x, y, rx, ry, outer): 等同于'A'，与arc只差别在x和y是绝对坐标。
// curve(2个，4个或6个参数): 从一个坐标点向另一个坐标点画贝塞尔曲线。
// 当参数为两个时，等同于't'，绘制光滑二次贝塞尔曲线。
// 当参数为4个时，等同于'q'，绘制二次贝塞尔曲线。
// 当参数为6个时，等同于'c'，绘制三次贝塞尔曲线。
// 有些精通SVG的同学这时候可能就要问我了，不对啊，二次贝塞尔曲线和光滑三次贝塞尔曲线的参数都是4个，你这里没有光滑三次啊？因为开发的同学留坑没写了呀(微笑)。

// Transform
// 实现代码路径：art/core/transform.js
// Transform对象中的函数：
// transform(xx, yx, xy, yy, x, y): transform的相对坐标版本
// transformTo: 完整的矩阵变换，把这张位图上所有的点都做一次矩阵乘法，得到的新位图，公式如下图所示
// ⎧⎩⎨⎪⎪ad0be0cf1⎫⎭⎬⎪⎪×⎧⎩⎨⎪⎪xy1⎫⎭⎬⎪⎪
// translate(x, y): 位移
// move: 相对于原参考点坐标，增减参考点的x,y坐标
// moveTo: 等同于translateTo，容易误以为是move的绝对左边版本，吐糟不能
// scale(x, y): 将一个元素拉伸或者压缩指定的倍数，x是宽度缩放比例，y是长度缩放比例，如果只有一个参数，则x = y。如
// scaleTo: 在缩放的同时保持原来的长宽比
// rotate(deg, x, y): 将一个元素旋转角度deg。x和y则是用于指定旋转的原点。
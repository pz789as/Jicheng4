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

import Dimensions from 'Dimensions';
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;

export default class ForceLine extends Component {
  constructor(props){
    super(props);
    this.x1 = -1;
    this.y1 = -1;
    this.x2 = -2;
    this.y2 = -2;
    this.tx = 0;
    this.ty = 0;
    this.edge = props.edge == undefined ? null : props.edge;
    this.color = this.edge == null ? 'rgb(0,0,0)' : this.edge.color;
    this.state={
      visible: props.visible == undefined ? true : props.visible,
      blnUpdate: false,
    };
  }
  setVisible(bln){
    //这里显示线，是通过不跟新线的位置，以及将线放置屏幕外侧
    //作用主要是在父对象中保持ref的存在
    this.setState({
      visible: bln,
    });
  }
  updateRender(){
    this.setState({
      blnUpdate: !this.state.blnUpdate,
    });
  }
  setTransPos(tx, ty){
    this.tx = tx;
    this.ty = ty;
    if (this.state.visible){
      this.updateRender();
    }
  }
  selfSet(){
    this.x1 = this.edge.source.x;
    this.y1 = this.edge.source.y;
    this.x2 = this.edge.target.x;
    this.y2 = this.edge.target.y;
    this.color = this.edge.color;
    if (this.state.visible){
      this.updateRender();
    }
  }
  setPosition(x1, y1, x2, y2){
    //设置位置可以根据是否显示来更新
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    if (this.state.visible){
      this.updateRender();
    }
  }
  setColor(color){
    this.color = color;
    if (this.state.visible){
      this.updateRender();
    }
  }
  shouldComponentUpdate(nextProps, nextState){
    if (this.props!=nextProps || this.state!=nextState) return true;
    return false;
  }
  render() {
    var x1 = this.x1 + this.tx, y1 = this.y1 + this.ty;
    var x2 = this.x2 + this.tx, y2 = this.y2 + this.ty;
    if (!this.state.visible){//这里处理的就是是否显示线段了，实际是移到屏幕外侧
      x1 = -1;
      y1 = -1;
      x2 = -1;
      y2 = -1;
    }
    var line = Path().moveTo(x1, y1).lineTo(x2, y2);
    return (
      <Shape d={line} stroke={this.color} strokeWidth={1}/>
    );
  }
}

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